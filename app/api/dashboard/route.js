import { NextResponse } from "next/server";
import pool from "@/libs/mysql";

export async function GET() {
  const db = await pool.getConnection();

  try {
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

    // Total jugadores
    const [[{ totalPlayers }]] = await db.execute(
      `SELECT COUNT(*) AS totalPlayers FROM registrations WHERE season_id = ?`,
      [seasonId]
    );

    // Total equipos
    const [[{ totalTeams }]] = await db.execute(
      `SELECT COUNT(*) AS totalTeams FROM teams WHERE season_id = ?`,
      [seasonId]
    );

    // Pagos por split_payment
    const [[{ pagado }]] = await db.execute(
      `SELECT COUNT(*) AS pagado FROM registrations WHERE season_id = ? AND split_payment = 0`,
      [seasonId]
    );

    const [[{ pendiente }]] = await db.execute(
      `SELECT COUNT(*) AS pendiente FROM registrations WHERE season_id = ? AND split_payment = 1`,
      [seasonId]
    );

    // Jugadores por categoría
    const [categoriasResult] = await db.execute(
      `SELECT c.name AS category, COUNT(*) AS totalPlayers
       FROM registrations r
       INNER JOIN categories c ON r.category_id = c.id
       WHERE r.season_id = ?
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
