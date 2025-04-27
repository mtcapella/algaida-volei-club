import { NextResponse } from "next/server";
import pool from "@/libs/mysql";

export async function DELETE(request, context) {
  const { playerId } = context.params;

  console.log("DELETE playerId:", context.params);

  if (!playerId) {
    return NextResponse.json(
      { error: "Falta el ID del jugador" },
      { status: 400 }
    );
  }

  const db = await pool.getConnection();

  try {
    // 1. Obtener temporada activa
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

    // 2. Buscar registration_id primero
    const [registrationResult] = await db.execute(
      `SELECT id FROM registrations WHERE player_id = ? AND season_id = ? LIMIT 1`,
      [playerId, seasonId]
    );

    if (registrationResult.length === 0) {
      return NextResponse.json(
        {
          error:
            "No existe inscripción para este jugador en la temporada activa",
        },
        { status: 404 }
      );
    }

    const registrationId = registrationResult[0].id;

    // 3. Borrar la registration específica
    const [deleteResult] = await db.execute(
      `DELETE FROM registrations WHERE id = ?`,
      [registrationId]
    );

    return NextResponse.json({
      success: true,
      message: "Inscripción eliminada correctamente",
    });
  } catch (error) {
    console.error("DB error en DELETE:", error);
    return NextResponse.json(
      { error: "Error al borrar inscripción", detail: error.message },
      { status: 500 }
    );
  } finally {
    db.release();
  }
}
