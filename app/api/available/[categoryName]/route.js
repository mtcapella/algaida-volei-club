import { NextResponse } from "next/server";
import pool from "@/libs/mysql";
import { getActiveSeason } from "@/libs/seasons";

export async function GET(request, context) {
  const db = await pool.getConnection();

  const { categoryName } = await context.params;

  try {
    const seasonId = await getActiveSeason();

    // Obtener category_id
    const [catRows] = await db.query(
      `SELECT id FROM categories WHERE name = ? LIMIT 1`,
      [categoryName]
    );

    if (catRows.length === 0) {
      return NextResponse.json(
        { error: "Categoría no encontrada" },
        { status: 404 }
      );
    }

    const categoryId = catRows[0].id;

    // Obtener jugadores sin equipo con pago completado en esa categoría
    const [players] = await db.query(
      `SELECT p.id AS playerId, p.first_name AS firstName, p.last_name AS lastName
       FROM players p
       INNER JOIN registrations r ON r.player_id = p.id
       INNER JOIN payments pay ON pay.player_id = p.id AND pay.season_id = r.season_id
       WHERE r.season_id = ?
         AND r.category_id = ?
         AND r.team_id IS NULL
         AND pay.status = 'completed'
       GROUP BY p.id, p.first_name, p.last_name`,
      [seasonId, categoryId]
    );

    return NextResponse.json(players);
  } catch (err) {
    console.error("Error en GET /available/:categoryName", err);
    return NextResponse.json(
      { error: "Error al obtener jugadores disponibles" },
      { status: 500 }
    );
  } finally {
    db.release();
  }
}
