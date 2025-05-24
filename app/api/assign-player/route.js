export const runtime = "nodejs"; // Usar Node.js para este endpoint
import { requireFirebaseUser } from "@/libs/withAuth";
import { NextResponse } from "next/server";
import pool from "@/libs/mysql";
import { getActiveSeason } from "@/libs/seasons";

export async function PUT(request) {
  try {
    await requireFirebaseUser(request);
  } catch (e) {
    // ③ verifica
    const msg = e.message === "NO_TOKEN" ? "Falta token" : "Token inválido";
    return NextResponse.json({ error: msg }, { status: 401 });
  }

  const db = await pool.getConnection();

  try {
    const { playerId, teamId } = await request.json();

    if (!playerId) {
      return NextResponse.json(
        { error: "Falta el playerId obligatorio" },
        { status: 400 }
      );
    }

    const seasonId = await getActiveSeason();

    const [result] = await db.execute(
      `UPDATE registrations
       SET team_id = ?
       WHERE player_id = ? AND season_id = ?`,
      [teamId ?? null, playerId, seasonId]
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
