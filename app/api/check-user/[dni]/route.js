import { NextResponse } from "next/server";
import pool from "@/libs/mysql";
import { purgeIncomplete } from "@/libs/purgeIncomplete";
import { getActiveSeason } from "@/libs/seasons";

export async function GET(request, context) {
  const { dni } = await context.params;

  if (!dni) {
    return NextResponse.json(
      { error: "Falta el DNI en la ruta" },
      { status: 400 }
    );
  }

  await purgeIncomplete(dni);

  const db = await pool.getConnection();

  try {
    // Buscar jugador
    const [players] = await db.execute(
      `SELECT id AS playerId, first_name, last_name FROM players WHERE dni = ?`,
      [dni]
    );

    if (players.length === 0) {
      return NextResponse.json({ exists: false });
    }

    const { playerId, first_name, last_name } = players[0];

    // Temporada activa

    const seasonId = await getActiveSeason();

    // Registro en la temporada actual
    const [registrations] = await db.execute(
      `SELECT r.id, r.team_id, r.category_id, r.registered_at, r.split_payment
       FROM registrations r
       WHERE r.player_id = ? AND r.season_id = ?`,
      [playerId, seasonId]
    );

    const registered = registrations.length > 0;

    // ¿Tiene deuda activa en la temporada actual?
    const [deudaActual] = await db.execute(
      `SELECT COUNT(*) AS count 
       FROM registrations 
       WHERE player_id = ? AND season_id = ? AND split_payment = 1`,
      [playerId, seasonId]
    );

    const hasActiveDebt = deudaActual[0].count > 0;

    // ¿Tiene deuda histórica?
    const [deudaHistorica] = await db.execute(
      `SELECT COUNT(*) AS count 
       FROM debt_history 
       WHERE player_id = ? AND status IN ('pending', 'partially_paid')`,
      [playerId]
    );

    const hasHistoricalDebt = deudaHistorica[0].count > 0;

    // Respuesta base
    const response = {
      exists: true,
      registered,
      hasDebt: hasActiveDebt || hasHistoricalDebt,
      player: {
        playerId,
        first_name,
        last_name,
        dni,
      },
    };

    if (registered) {
      const reg = registrations[0];
      response.registration = {
        registrationId: reg.id,
        teamId: reg.team_id,
        categoryId: reg.category_id,
        registeredAt: reg.registered_at,
        splitPayment: reg.split_payment,
      };
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("DB error:", error);
    return NextResponse.json(
      { error: "Error al consultar el jugador", detail: error.message },
      { status: 500 }
    );
  } finally {
    db.release();
  }
}
