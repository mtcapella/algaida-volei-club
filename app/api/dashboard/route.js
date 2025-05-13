import { NextResponse } from "next/server";
import pool from "@/libs/mysql";
import { getActiveSeason } from "@/libs/seasons";

export async function GET() {
  const db = await pool.getConnection();

  try {
    // Obtener el ID de la temporada activa
    const seasonId = await getActiveSeason();

    // Total jugadores (con pagos completados)
    const [[{ totalPlayers }]] = await db.execute(
      `SELECT COUNT(DISTINCT r.player_id) AS totalPlayers 
       FROM registrations r 
       INNER JOIN payments p ON p.player_id = r.player_id AND p.season_id = r.season_id 
       WHERE r.season_id = ? AND p.status = 'completed'`,
      [seasonId]
    );

    // Total equipos
    const [[{ totalTeams }]] = await db.execute(
      `SELECT COUNT(*) AS totalTeams FROM teams WHERE season_id = ?`,
      [seasonId]
    );

    // Pagos completados y pendientes
    const [[{ pagado }]] = await db.execute(
      `SELECT COUNT(DISTINCT r.player_id) AS pagado 
       FROM registrations r 
       INNER JOIN payments p ON p.player_id = r.player_id AND p.season_id = r.season_id 
       WHERE r.season_id = ? AND p.status = 'completed'`,
      [seasonId]
    );

    const [[{ pendiente }]] = await db.execute(
      `SELECT COUNT(DISTINCT r.player_id) AS pendiente 
       FROM registrations r 
       LEFT JOIN payments p ON p.player_id = r.player_id AND p.season_id = r.season_id 
       WHERE r.season_id = ? AND (p.status IS NULL OR p.status != 'completed')`,
      [seasonId]
    );

    // Jugadores por categoría
    const [categoriasResult] = await db.execute(
      `SELECT c.name AS category, COUNT(DISTINCT r.player_id) AS totalPlayers
       FROM registrations r
       INNER JOIN categories c ON r.category_id = c.id
       INNER JOIN payments p ON p.player_id = r.player_id AND p.season_id = r.season_id 
       WHERE r.season_id = ? AND p.status = 'completed'
       GROUP BY c.name`,
      [seasonId]
    );

    return NextResponse.json({
      totalPlayers,
      totalTeams,
      pagos: {
        pagado,
        pendiente,
      },
      jugadoresPorCategoria: categoriasResult,
    });
  } catch (error) {
    console.error("DB error en GET /dashboard:", error);
    return NextResponse.json(
      { error: "Error al generar resumen dashboard", detail: error.message },
      { status: 500 }
    );
  } finally {
    db.release();
  }
}
