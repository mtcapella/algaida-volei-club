-- 1. Desactivar temporalmente FK checks
SET FOREIGN_KEY_CHECKS = 0;

-- 2. Insertar categorías (si no existen):
INSERT INTO `categories` (`id`,`name`,`min_age`,`max_age`) VALUES
  (1,'Alevín',   NULL,NULL),
  (2,'Infantil', NULL,NULL),
  (3,'Cadete',   NULL,NULL),
  (4,'Juvenil',  NULL,NULL),
  (5,'Sénior',   NULL,NULL)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 3. Insertar la temporada 2024-2025 y marcarla activa
-- Ojo: ajusta start_date/end_date si quieres otras fechas
INSERT INTO `seasons` (`id`,`name`,`start_date`,`end_date`,`is_active`,`is_locked`) VALUES
  (1,'2024-2025','2024-09-01','2025-06-30',1,0)
ON DUPLICATE KEY UPDATE
  `name`=VALUES(`name`),
  `start_date`=VALUES(`start_date`),
  `end_date`=VALUES(`end_date`),
  `is_active`=VALUES(`is_active`),
  `is_locked`=VALUES(`is_locked`);

-- 4. Reactivar FK checks
SET FOREIGN_KEY_CHECKS = 1;

-- 5. (Re)crear el procedure archive_debts
DROP PROCEDURE IF EXISTS `archive_debts`;
DELIMITER $$
CREATE DEFINER=`mike`@`%` PROCEDURE `algaida_volei_club`.`archive_debts`()
BEGIN
    -- Obtener la temporada activa
    DECLARE active_season_id INT;
    SELECT id INTO active_season_id FROM seasons WHERE is_active = 1 LIMIT 1;

    -- Verificar si existe temporada activa
    IF active_season_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No hay temporada activa';
    END IF;

    -- Insertar las deudas en el histórico sin violar ONLY_FULL_GROUP_BY
    INSERT INTO debt_history (player_id, season_id, total_due, total_paid, status)
    SELECT 
        r.player_id, 
        r.season_id, 
        MAX(CASE WHEN r.participate_lottery = 1 THEN 380 ELSE 400 END) AS total_due,
        IFNULL(SUM(CASE WHEN p.status = 'completed' THEN p.amount ELSE 0 END), 0) AS total_paid,
        (CASE 
            WHEN IFNULL(SUM(CASE WHEN p.status = 'completed' THEN p.amount ELSE 0 END), 0) = MAX(CASE WHEN r.participate_lottery = 1 THEN 380 ELSE 400 END) THEN 'completed'
            WHEN IFNULL(SUM(CASE WHEN p.status = 'completed' THEN p.amount ELSE 0 END), 0) > 0 THEN 'partially_paid'
            ELSE 'pending' 
        END) AS status
    FROM registrations r
    LEFT JOIN payments p ON p.player_id = r.player_id AND p.season_id = r.season_id
    WHERE r.season_id = active_season_id AND r.split_payment = 1
    GROUP BY r.player_id, r.season_id;

    -- Actualizar las deudas como saldadas para la temporada activa
    UPDATE registrations 
    SET split_payment = 0 
    WHERE season_id = active_season_id AND split_payment = 1;

END;
DELIMITER ;


