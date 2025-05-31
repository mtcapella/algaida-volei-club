export const runtime = "nodejs"; // Usar Node.js para este endpoint
import { requireFirebaseUser } from "@/libs/withAuth";
import { NextResponse } from "next/server";
import pool from "@/libs/mysql";

export async function PUT(request) {
  try {
    await requireFirebaseUser(request);
  } catch (e) {
    const msg = e.message === "NO_TOKEN" ? "Falta token" : "Token inválido";
    return NextResponse.json({ error: msg }, { status: 401 });
  }

  const db = await pool.getConnection();

  try {
    const { playerId, amount } = await request.json();

    // Obtener datos actuales del jugador
    const [registrationResult] = await db.execute(
      `SELECT 
          r.total_fee, 
          r.split_payment,
          IFNULL(SUM(p.amount), 0) AS totalPaid
       FROM registrations r
       LEFT JOIN payments p ON p.player_id = r.player_id AND p.season_id = r.season_id
       WHERE r.player_id = ? AND r.season_id = (SELECT id FROM seasons WHERE is_active = 1 LIMIT 1)
       GROUP BY r.id`,
      [playerId]
    );

    if (registrationResult.length === 0) {
      return NextResponse.json(
        { error: "Jugador no encontrado" },
        { status: 404 }
      );
    }

    const { total_fee, totalPaid } = registrationResult[0];

    const fee = parseFloat(total_fee);
    const paid = parseFloat(totalPaid);
    const newTotalPaid = paid + amount;
    const remainingDebt = Math.round((fee - newTotalPaid) * 100) / 100;

    // Insertar nuevo pago manual
    await db.execute(
      `INSERT INTO payments (player_id, season_id, amount, paid_at, status, origin)
       VALUES (?, (SELECT id FROM seasons WHERE is_active = 1 LIMIT 1), ?, NOW(), 'completed', 'manual')`,
      [playerId, amount]
    );

    // Actualizar estado de split_payment si queda deuda
    await db.execute(
      `UPDATE registrations 
       SET split_payment = ?, total_fee = ?
       WHERE player_id = ? AND season_id = (SELECT id FROM seasons WHERE is_active = 1 LIMIT 1)`,
      [remainingDebt > 0 ? 1 : 0, fee, playerId]
    );

    return NextResponse.json({
      success: true,
      totalPaid: newTotalPaid,
      remainingDebt,
    });
  } catch (error) {
    console.error("Error en PUT /payments/update:", error);
    return NextResponse.json(
      { error: "Error al actualizar el pago", detail: error.message },
      { status: 500 }
    );
  } finally {
    db.release();
  }
}
