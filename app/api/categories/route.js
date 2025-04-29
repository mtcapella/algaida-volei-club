import { NextResponse } from "next/server";
import pool from "@/libs/mysql";

export async function GET() {
  const db = await pool.getConnection();

  try {
    // 1. Obtener temporada activa
    const [seasonResult] = await db.execute(
      `SELECT id FROM seasons WHERE is_active = 1 LIMIT 1`
    );

    if (seasonResult.length === 0) {
      return NextResponse.json(
        { error: "No hay temporada activa" },
        { status: 500 }
      );
    }

    const seasonId = seasonResult[0].id;

    // 2. Obtener total de jugadores en la temporada activa
    const [totalPlayersResult] = await db.execute(
      `SELECT COUNT(*) AS total FROM registrations WHERE season_id = ?`,
      [seasonId]
    );
    const totalPlayers = totalPlayersResult[0].total || 1; // evitamos división por 0

    // 3. Obtener categorías con total de equipos y jugadores
    const [categoryStats] = await db.execute(
      `SELECT 
          c.id, 
          c.name,
          COUNT(DISTINCT t.id) AS totalTeams,
          COUNT(DISTINCT r.player_id) AS totalPlayers
       FROM categories c
       LEFT JOIN teams t ON t.category_id = c.id AND t.season_id = ?
       LEFT JOIN registrations r ON r.team_id = t.id AND r.season_id = ?
       GROUP BY c.id, c.name
       ORDER BY c.name ASC`,
      [seasonId, seasonId]
    );

    const result = categoryStats.map((cat) => ({
      id: cat.id,
      name: cat.name,
      totalTeams: cat.totalTeams,
      totalPlayers: cat.totalPlayers,
      percentage: parseFloat(
        ((cat.totalPlayers / totalPlayers) * 100).toFixed(2)
      ),
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("DB error en GET CATEGORIES:", error);
    return NextResponse.json(
      { error: "Error al cargar categorías", detail: error.message },
      { status: 500 }
    );
  } finally {
    db.release();
  }
}
