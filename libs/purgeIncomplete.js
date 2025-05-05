import pool from "@/libs/mysql";
import { getActiveSeason } from "@/libs/seasons";

export async function purgeIncomplete(dni) {
  const conn = await pool.getConnection();
  try {
    const seasonId = await getActiveSeason();

    // Buscar ID del jugador
    const [players] = await conn.execute(
      `SELECT id FROM players WHERE dni = ?`,
      [dni]
    );

    if (players.length === 0) return; // No hay nada que purgar

    const playerId = players[0].id;

    // Verificar si hay algún payment no completado en esta temporada
    const [payments] = await conn.execute(
      `SELECT id FROM payments 
       WHERE player_id = ? AND season_id = ? AND status != 'completed'`,
      [playerId, seasonId]
    );

    if (payments.length === 0) return; // No hay pagos a purgar

    // Eliminar documentos de esta temporada
    await conn.execute(
      `DELETE FROM documents WHERE player_id = ? AND season_id = ?`,
      [playerId, seasonId]
    );

    // Eliminar tutor legal
    await conn.execute(
      `DELETE FROM legal_guardians WHERE player_id = ? AND season_id = ?`,
      [playerId, seasonId]
    );

    // Eliminar pagos no completados
    await conn.execute(
      `DELETE FROM payments 
       WHERE player_id = ? AND season_id = ? AND status != 'completed'`,
      [playerId, seasonId]
    );

    // Eliminar la inscripción
    await conn.execute(
      `DELETE FROM registrations 
       WHERE player_id = ? AND season_id = ?`,
      [playerId, seasonId]
    );

    // Comprobar si el jugador tiene otras inscripciones
    const [otherRegistrations] = await conn.execute(
      `SELECT COUNT(*) AS count FROM registrations WHERE player_id = ?`,
      [playerId]
    );

    if (otherRegistrations[0].count === 0) {
      // Eliminar el jugador si ya no tiene registros
      await conn.execute(`DELETE FROM players WHERE id = ?`, [playerId]);
    }
  } catch (err) {
    console.error("Error en purgeIncompleteUserByDNI:", err);
  } finally {
    conn.release();
  }
}
