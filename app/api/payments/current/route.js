import { NextResponse } from "next/server";
import pool from "@/libs/mysql";
import { getActiveSeason } from "@/libs/seasons";

// endpoint que te devuelve los pagos de la temporada actual
// y los jugadores que tienen pagos pendientes

export async function GET() {
  const db = await pool.getConnection();

  try {
    const seasonId = await getActiveSeason();

    const [rows] = await db.execute(
      `WITH pay AS (
         SELECT player_id,
                season_id,
                SUM(amount) AS totalPaid
         FROM payments
         WHERE status = 'completed'
         GROUP BY player_id, season_id
       )
       SELECT
         p.id        AS playerId,
         p.first_name,
         p.last_name,
         p.dni,
         r.total_fee,

         /* Pago contabilizado  */
         CASE
           WHEN r.split_payment = 1
             THEN LEAST(COALESCE(pay.totalPaid,0), r.total_fee - 150)
           ELSE
             LEAST(COALESCE(pay.totalPaid,0), r.total_fee)
         END                         AS totalPaid,

         /* Deuda restante */
         CASE
           WHEN r.split_payment = 1
             THEN GREATEST(r.total_fee - LEAST(COALESCE(pay.totalPaid,0), r.total_fee - 150), 0)
           ELSE
             GREATEST(r.total_fee - LEAST(COALESCE(pay.totalPaid,0), r.total_fee), 0)
         END                         AS debt,

         r.participate_lottery,
         r.split_payment
       FROM players p
       INNER JOIN registrations r
              ON r.player_id = p.id
             AND r.season_id = ?
       INNER JOIN pay                /* solo jugadores con pagos completados */
              ON pay.player_id = p.id
             AND pay.season_id = r.season_id
       ORDER BY p.id ASC`,
      [seasonId]
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error en GET /payments/current:", error);
    return NextResponse.json(
      {
        error: "Error al obtener pagos de la temporada actual",
        detail: error.message,
      },
      { status: 500 }
    );
  } finally {
    db.release();
  }
}
