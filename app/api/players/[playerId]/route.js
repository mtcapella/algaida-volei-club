export const runtime = "nodejs"; // Usar Node.js para este endpoint
import { requireFirebaseUser } from "@/libs/withAuth";
import { NextResponse } from "next/server";
import pool from "@/libs/mysql";

//  DELETE inscripción del jugador
export async function DELETE(request, context) {
  try {
    await requireFirebaseUser(request);
  } catch (e) {
    // ③ verifica
    const msg = e.message === "NO_TOKEN" ? "Falta token" : "Token inválido";
    return NextResponse.json({ error: msg }, { status: 401 });
  }

  const { playerId } = await context.params;

  console.log("DELETE playerId:", context.params);

  if (!playerId) {
    return NextResponse.json(
      { error: "Falta el ID del jugador" },
      { status: 400 }
    );
  }

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

    await db.execute(`DELETE FROM registrations WHERE id = ?`, [
      registrationId,
    ]);

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

//  PUT para actualizar datos del jugador
export async function PUT(request, context) {
  try {
    await requireFirebaseUser(request);
  } catch (e) {
    const msg = e.message === "NO_TOKEN" ? "Falta token" : "Token inválido";
    return NextResponse.json({ error: msg }, { status: 401 });
  }

  const { playerId } = await context.params;

  if (!playerId) {
    return NextResponse.json({ error: "Falta playerId" }, { status: 400 });
  }

  const db = await pool.getConnection();

  try {
    const { firstName, lastName, dateOfBirth, teamId } = await request.json();

    if (!firstName?.trim() || !lastName?.trim() || !dateOfBirth) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    //  Actualiza datos del jugador
    await db.execute(
      `UPDATE players
       SET first_name = ?, last_name = ?, date_of_birth = ?
       WHERE id = ?`,
      [firstName.trim(), lastName.trim(), dateOfBirth, playerId]
    );

    //  Actualiza el equipo en la inscripción
    await db.execute(
      `UPDATE registrations
       SET team_id = ?
       WHERE player_id = ? AND season_id = (SELECT id FROM seasons WHERE is_active = 1 LIMIT 1)`,
      [teamId, playerId]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DB error:", err);
    return NextResponse.json(
      { error: "Error al actualizar jugador", detail: err.message },
      { status: 500 }
    );
  } finally {
    db.release();
  }
}
