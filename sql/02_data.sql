-- 1. Desactivar temporalmente FK checks
SET FOREIGN_KEY_CHECKS = 0;

-- 2. Insertar categorías (si no existen):
INSERT INTO `categories` (`id`,`name`,`min_age`,`max_age`) VALUES
  (1,'Alevin',   NULL,NULL),
  (2,'Infantil', NULL,NULL),
  (3,'Cadete',   NULL,NULL),
  (4,'Juvenil',  NULL,NULL),
  (5,'Senior',   NULL,NULL)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 3. Insertar estado de formulario abierto para la temporada creada
INSERT INTO `form_status` (`season_id`, `opens_at`, `closes_at`, `enabled`) VALUES
  (
    1,
    '2025-01-01 00:00:00',
    '2026-01-01 00:00:00',
    1
  )
ON DUPLICATE KEY UPDATE
  `opens_at` = VALUES(`opens_at`),
  `closes_at` = VALUES(`closes_at`),
  `enabled` = VALUES(`enabled`);


-- 4. Insertar la temporada 2024-2025 y marcarla activa

INSERT INTO `seasons` (`id`,`name`,`start_date`,`end_date`,`is_active`,`is_locked`) VALUES
  (1,'Temporada 2024-2025','2024-09-01','2025-06-30',1,0)
ON DUPLICATE KEY UPDATE
  `name`=VALUES(`name`),
  `start_date`=VALUES(`start_date`),
  `end_date`=VALUES(`end_date`),
  `is_active`=VALUES(`is_active`),
  `is_locked`=VALUES(`is_locked`);

-- 4. Reactivar FK checks
SET FOREIGN_KEY_CHECKS = 1;

-- 5. (Re)crear el procedure archive_debts


DELIMITER $$

DROP PROCEDURE IF EXISTS archive_debts$$

CREATE PROCEDURE archive_debts()
BEGIN
  DECLARE v_season INT DEFAULT NULL;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_season = NULL;

  -- 1) Averiguar temporada activa
  SELECT id
    INTO v_season
    FROM seasons
   WHERE is_active = 1
   LIMIT 1;

  IF v_season IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No hay temporada activa';
  END IF;

  -- 2) Limpiar histórico de esa temporada (evita duplicados)
  DELETE FROM debt_history
   WHERE season_id = v_season;

  -- 3) Volcar todas las inscripciones de la temporada
  INSERT INTO debt_history
    (player_id, season_id, total_due, total_paid, status)
  SELECT
    r.player_id,
    r.season_id,
    -- cuota según participe o no en lotería
    MAX(CASE WHEN r.participate_lottery = 1 THEN 380 ELSE 400 END) AS total_due,
    -- sólo pagos COMPLETADOS
    IFNULL(SUM(CASE WHEN p.status = 'completed' THEN p.amount ELSE 0 END), 0) AS total_paid,
    -- si ha pagado toda la cuota → completed; sino → pending
    CASE
      WHEN IFNULL(SUM(CASE WHEN p.status = 'completed' THEN p.amount ELSE 0 END), 0)
           = MAX(CASE WHEN r.participate_lottery = 1 THEN 380 ELSE 400 END)
        THEN 'completed'
      ELSE 'pending'
    END AS status
  FROM registrations r
  LEFT JOIN payments p
    ON p.player_id = r.player_id
   AND p.season_id = r.season_id
  WHERE r.season_id = v_season
  GROUP BY r.player_id, r.season_id;

END$$

DELIMITER ;
