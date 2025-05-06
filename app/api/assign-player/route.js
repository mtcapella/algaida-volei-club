import { NextResponse } from "next/server";
import pool from "@/libs/mysql";
import { getActiveSeason } from "@/libs/seasons";

export async function PUT(request) {
  const db = await pool.getConnection();

  try {
    const { playerId, teamId } = await request.json();

    if (!playerId || !teamId) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios: playerId o teamId" },
        { status: 400 }
      );
    }

    const seasonId = await getActiveSeason();

    const [result] = await db.execute(
      `UPDATE registrations
       SET team_id = ?
       WHERE player_id = ? AND season_id = ?`,
      [teamId, playerId, seasonId]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "No se encontró registro para actualizar" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al asignar jugador a equipo:", error);
    return NextResponse.json(
      { error: "Error interno al asignar jugador a equipo" },
      { status: 500 }
    );
  } finally {
    db.release();
  }
}
