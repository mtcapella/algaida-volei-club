import { NextResponse } from "next/server";
import pool from "@/libs/mysql";

export async function GET() {
  const db = await pool.getConnection();

  try {
    // 1. Temporada activa
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

    // 2. Total jugadores
    const [playersResult] = await db.execute(
      `SELECT COUNT(*) AS totalPlayers FROM registrations WHERE season_id = ?`,
      [seasonId]
    );
    const totalPlayers = playersResult[0].totalPlayers;

    // 3. Total equipos
    const [teamsResult] = await db.execute(
      `SELECT COUNT(*) AS totalTeams FROM teams WHERE season_id = ?`,
      [seasonId]
    );
    const totalTeams = teamsResult[0].totalTeams;

    // 4. Pagos: pagado vs pendiente
    const cuotaBase = 200; // Asumimos 200€ por jugador
    const [paymentsResult] = await db.execute(
      `SELECT r.id AS registrationId, IFNULL(SUM(p.amount), 0) AS totalPaid
       FROM registrations r
       LEFT JOIN payments p ON p.registration_id = r.id
       WHERE r.season_id = ?
       GROUP BY r.id`,
      [seasonId]
    );

    let pagado = 0;
    let pendiente = 0;
    paymentsResult.forEach((reg) => {
      if (parseFloat(reg.totalPaid) >= cuotaBase) {
        pagado++;
      } else {
        pendiente++;
      }
    });

    const totalRegistros = pagado + pendiente;
    const porcentajePagado =
      totalRegistros > 0 ? Math.round((pagado / totalRegistros) * 100) : 0;
    const porcentajePendiente = 100 - porcentajePagado;

    // 5. Jugadores por categoría
    const [categoriesResult] = await db.execute(
      `SELECT c.name AS categoryName, COUNT(r.id) AS totalPlayers
       FROM registrations r
       INNER JOIN categories c ON r.category_id = c.id
       WHERE r.season_id = ?
       GROUP BY r.category_id`,
      [seasonId]
    );

    const jugadoresPorCategoria = categoriesResult.map((cat) => ({
      category: cat.categoryName,
      totalPlayers: cat.totalPlayers,
    }));

    // 6. Respuesta final
    const dashboardData = {
      totalPlayers,
      totalTeams,
      porcentajePagado,
      porcentajePendiente,
      jugadoresPorCategoria,
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error("DB error:", error);
    return NextResponse.json(
      { error: "Error al cargar el dashboard", detail: error.message },
      { status: 500 }
    );
  } finally {
    db.release();
  }
}
