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
    const [playersResult] = await db.execute(
      `SELECT COUNT(*) AS total FROM registrations WHERE season_id = ?`,
      [seasonId]
    );

    // Total equipos
    const [teamsResult] = await db.execute(
      `SELECT COUNT(*) AS total FROM teams WHERE season_id = ?`,
      [seasonId]
    );

    // Pagos por jugador con cuota personalizada
    const [deudas] = await db.execute(
      `SELECT r.id AS registrationId, r.participate_lottery, IFNULL(SUM(p.amount), 0) AS totalPaid
       FROM registrations r
       LEFT JOIN payments p ON p.player_id = r.player_id AND p.season_id = r.season_id
       WHERE r.season_id = ?
       GROUP BY r.id, r.participate_lottery`,
      [seasonId]
    );

    let totalPaid = 0;
    let totalPending = 0;

    deudas.forEach((r) => {
      const cuotaBase = r.participate_lottery ? 380 : 400;
      if (parseFloat(r.totalPaid) >= cuotaBase) totalPaid++;
      else totalPending++;
    });

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
      totalPlayers: playersResult[0].total,
      totalTeams: teamsResult[0].total,
      pagos: {
        pagado: totalPaid,
        pendiente: totalPending,
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
