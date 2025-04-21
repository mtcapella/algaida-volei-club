// app/api/check-user/[dni]/route.js

import { NextResponse } from "next/server";
import pool from "@/libs/mysql";

export async function GET(request, context) {
  // se extraen los params de la ruta para saber el dni del jugador
  const params = await context.params;
  const { dni } = params;

  console.log("dni", dni);

  // si por alguna razon no se pasa el dni, se devuelve un error 400
  if (!dni) {
    return NextResponse.json(
      { error: "Falta el DNI en la ruta" },
      { status: 400 }
    );
  }

  const db = await pool.getConnection();
  // ejecutar la consulta para ver si el jugador existe
  try {
    // se consulta si el jugador existe en la tabla players
    const [players] = await db.execute(
      `SELECT id AS playerId, first_name, last_name
         FROM players
        WHERE dni = ?`,
      [dni]
    );
    if (players.length === 0) {
      return NextResponse.json({ exists: false });
    }
    const { playerId, first_name, last_name } = players[0];

    const [seasons] = await db.execute(
      `SELECT id AS seasonId
         FROM seasons
        WHERE is_active = 1
        LIMIT 1`
    );
    if (seasons.length === 0) {
      return NextResponse.json(
        { error: "No hay temporada activa" },
        { status: 500 }
      );
    }
    const { seasonId } = seasons[0];

    const [registrations] = await db.execute(
      `SELECT
         r.id            AS registrationId,
         r.team_id       AS teamId,
         r.category_id   AS categoryId,
         r.registered_at AS registeredAt,
         IFNULL(SUM(p.amount), 0) AS totalPaid
       FROM registrations r
       LEFT JOIN payments p
         ON p.registration_id = r.id
       WHERE r.player_id = ?
         AND r.season_id = ?
       GROUP BY r.id
       LIMIT 1`,
      [playerId, seasonId]
    );

    if (registrations.length === 0) {
      return NextResponse.json({
        exists: true,
        registered: false,
        player: { playerId, first_name, last_name, dni },
      });
    }

    const reg = registrations[0];
    const hasDebt = reg.totalPaid === 0;

    return NextResponse.json({
      exists: true,
      registered: true,
      player: { playerId, first_name, last_name, dni },
      registration: {
        registrationId: reg.registrationId,
        teamId: reg.teamId,
        categoryId: reg.categoryId,
        registeredAt: reg.registeredAt,
        totalPaid: reg.totalPaid,
        hasDebt,
      },
    });
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
