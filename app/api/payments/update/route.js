import { NextResponse } from "next/server";
import pool from "@/libs/mysql";
import { getActiveSeason } from "@/libs/seasons";

export async function PUT(request) {
  const db = await pool.getConnection();

  try {
    const { playerId } = await request.json();

    if (!playerId) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios" },
        { status: 400 }
      );
    }

    const seasonId = await getActiveSeason();

    // Verificar que el jugador y la temporada existen
    const [playerExists] = await db.execute(
      `SELECT r.total_fee, IFNULL(SUM(p.amount), 0) AS totalPaid
       FROM registrations r
       LEFT JOIN payments p ON p.player_id = r.player_id AND p.season_id = r.season_id
       WHERE r.player_id = ? AND r.season_id = ?
       GROUP BY r.total_fee`,
      [playerId, seasonId]
    );

    if (playerExists.length === 0) {
      return NextResponse.json(
        { error: "Jugador no encontrado en la temporada actual" },
        { status: 404 }
      );
    }

    const { total_fee, totalPaid } = playerExists[0];

    // Actualizar el estado de split_payment a 0 y ajustar los montos
    await db.execute(
      `UPDATE registrations SET split_payment = 0, total_fee = ? WHERE player_id = ? AND season_id = ?`,
      [totalPaid, playerId, seasonId]
    );

    return NextResponse.json({
      success: true,
      message: "Pago completado correctamente y estado actualizado.",
    });
  } catch (error) {
    console.error("Error en PUT /payments/update-split:", error);
    return NextResponse.json(
      {
        error: "Error al actualizar el estado de split_payment",
        detail: error.message,
      },
      { status: 500 }
    );
  } finally {
    db.release();
  }
}
