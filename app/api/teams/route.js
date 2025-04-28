import { NextResponse } from "next/server";
import pool from "@/libs/mysql";

export async function GET() {
  const db = await pool.getConnection();

  try {
    // 1. Buscar temporada activa
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

    // 2. Buscar equipos + número de jugadores
    const [teamsResult] = await db.execute(
      `SELECT 
          t.id,
          t.name,
          t.coach_name,
          COUNT(r.id) AS totalPlayers
       FROM teams t
       LEFT JOIN registrations r ON r.team_id = t.id AND r.season_id = ?
       WHERE t.season_id = ?
       GROUP BY t.id, t.name, t.coach_name
       ORDER BY t.name ASC`,
      [seasonId, seasonId]
    );

    return NextResponse.json(teamsResult);
  } catch (error) {
    console.error("DB error en GET TEAMS:", error);
    return NextResponse.json(
      { error: "Error al cargar equipos", detail: error.message },
      { status: 500 }
    );
  } finally {
    db.release();
  }
}
