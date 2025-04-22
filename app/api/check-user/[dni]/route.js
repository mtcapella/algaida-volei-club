import { NextResponse } from "next/server";
import pool from "@/libs/mysql";

export async function GET(request, context) {
  const { dni } = context.params;

  if (!dni) {
    return NextResponse.json(
      { error: "Falta el DNI en la ruta" },
      { status: 400 }
    );
  }

  const db = await pool.getConnection();

  try {
    // 1. Buscar jugador por DNI
    const [players] = await db.execute(
      `SELECT id AS playerId, first_name, last_name FROM players WHERE dni = ?`,
      [dni]
    );

    if (players.length === 0) {
      return NextResponse.json({ exists: false });
    }

    const { playerId, first_name, last_name } = players[0];

    // 2. Obtener temporada activa
    const [seasons] = await db.execute(
      `SELECT id AS seasonId FROM seasons WHERE is_active = 1 LIMIT 1`
    );

    if (seasons.length === 0) {
      return NextResponse.json(
        { error: "No hay temporada activa" },
        { status: 500 }
      );
    }

    const { seasonId } = seasons[0];

    // 3. Verificar si ya está registrado en la temporada actual
    const [registrations] = await db.execute(
      `SELECT
         r.id            AS registrationId,
         r.team_id       AS teamId,
         r.category_id   AS categoryId,
         r.registered_at AS registeredAt,
         IFNULL(SUM(p.amount), 0) AS totalPaid
       FROM registrations r
       LEFT JOIN payments p ON p.registration_id = r.id
       WHERE r.player_id = ? AND r.season_id = ?
       GROUP BY r.id
       LIMIT 1`,
      [playerId, seasonId]
    );

    const registered = registrations.length > 0;

    // 4. Comprobar deuda global en todas las temporadas
    const [deudas] = await db.execute(
      `SELECT r.id, IFNULL(SUM(p.amount), 0) AS totalPaid
       FROM registrations r
       LEFT JOIN payments p ON p.registration_id = r.id
       WHERE r.player_id = ?
       GROUP BY r.id`,
      [playerId]
    );

    const cuotaBase = 200;
    let totalPending = 0;
    deudas.forEach((reg) => {
      const pendiente = cuotaBase - parseFloat(reg.totalPaid);
      if (pendiente > 0) totalPending += pendiente;
    });
    const hasDebt = totalPending > 0;

    // 5. Respuesta final
    const response = {
      exists: true,
      registered,
      hasDebt,
      player: { playerId, first_name, last_name, dni },
    };

    if (hasDebt) {
      response.pendingAmount = totalPending;
    }

    if (registered) {
      const reg = registrations[0];
      response.registration = {
        registrationId: reg.registrationId,
        teamId: reg.teamId,
        categoryId: reg.categoryId,
        registeredAt: reg.registeredAt,
        totalPaid: reg.totalPaid,
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
