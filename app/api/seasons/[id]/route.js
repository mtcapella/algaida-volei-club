export const runtime = "nodejs"; // Usar Node.js para este endpoint
import { requireFirebaseUser } from "@/libs/withAuth";
import { NextResponse } from "next/server";
import pool from "@/libs/mysql";

export async function GET(request, context) {
  try {
    await requireFirebaseUser(request);
  } catch (e) {
    // ③ verifica
    const msg = e.message === "NO_TOKEN" ? "Falta token" : "Token inválido";
    return NextResponse.json({ error: msg }, { status: 401 });
  }
  const { id } = await context.params;
  const db = await pool.getConnection();

  try {
    const [[season]] = await db.execute(
      `SELECT id, is_active, name FROM seasons WHERE id = ?`,
      [id]
    );
    if (!season)
      return NextResponse.json(
        { error: "La temporada no existe" },
        { status: 404 }
      );
    if (season.is_active === 1)
      return NextResponse.json(
        { error: "No se puede consultar una temporada activa" },
        { status: 400 }
      );

    const [players, teams, payments] = await Promise.all([
      db
        .execute(
          `SELECT
             p.id  AS playerId,
             p.first_name,
             p.last_name,
             p.dni,
             p.date_of_birth,
             COALESCE(JSON_ARRAYAGG(CASE WHEN d.id IS NOT NULL THEN JSON_OBJECT('url', d.file_url, 'type', d.doc_type) END), JSON_ARRAY()) AS documents
           FROM players p
           LEFT JOIN documents d ON d.player_id = p.id AND d.season_id = ?
           WHERE EXISTS (SELECT 1 FROM registrations r WHERE r.player_id = p.id AND r.season_id = ?)
           GROUP BY p.id, p.first_name, p.last_name, p.dni, p.date_of_birth`,
          [id, id]
        )
        .then(([rows]) => rows),

      db
        .execute(
          `SELECT t.id, t.name, t.coach_name,
                  c.name AS category,
                  (SELECT COUNT(*) FROM registrations r WHERE r.team_id = t.id) AS totalPlayers
           FROM teams t
           LEFT JOIN categories c ON t.category_id = c.id
           WHERE t.season_id = ?`,
          [id]
        )
        .then(([rows]) => rows),

      db
        .execute(
          `SELECT dh.player_id      AS playerId,
                  p.first_name,
                  p.last_name,
                  SUM(dh.total_due)  AS totalDue,
                  SUM(dh.total_paid) AS totalPaid,
                  MAX(dh.status)     AS status
           FROM debt_history dh
           INNER JOIN players p ON p.id = dh.player_id
           WHERE dh.season_id = ?
           GROUP BY dh.player_id, p.first_name, p.last_name`,
          [id]
        )
        .then(([rows]) => rows),
    ]);

    return NextResponse.json({
      seasonName: season.name,
      players,
      teams,
      payments,
    });
  } catch (error) {
    console.error("Error en GET /seasons/[id]:", error);
    return NextResponse.json(
      {
        error: "Error al obtener información de la temporada",
        detail: error.message,
      },
      { status: 500 }
    );
  } finally {
    db.release();
  }
}

// PUT /api/seasons/[id]  { playerId: number }
// Marca la deuda del jugador como pagada igualando total_paid a total_due.
export async function PUT(request, { params }) {
  try {
    await requireFirebaseUser(request);
  } catch (e) {
    // ③ verifica
    const msg = e.message === "NO_TOKEN" ? "Falta token" : "Token inválido";
    return NextResponse.json({ error: msg }, { status: 401 });
  }

  const { id } = params; // season id from URL
  const db = await pool.getConnection();

  try {
    const { playerId } = await request.json();
    if (!playerId) {
      return NextResponse.json(
        { error: "Falta el ID del jugador" },
        { status: 400 }
      );
    }

    // Verificar temporada no activa
    const [[season]] = await db.execute(
      `SELECT is_active FROM seasons WHERE id = ?`,
      [id]
    );
    if (!season)
      return NextResponse.json(
        { error: "La temporada no existe" },
        { status: 404 }
      );
    if (season.is_active === 1)
      return NextResponse.json(
        { error: "No se puede modificar una temporada activa" },
        { status: 400 }
      );

    // Actualizar deuda
    const [result] = await db.execute(
      `UPDATE debt_history
         SET total_paid = total_due,
             status      = 'completed'
       WHERE season_id = ? AND player_id = ?`,
      [id, playerId]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "No se encontró deuda para ese jugador en la temporada dada" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Deuda marcada como pagada",
      playerId,
      seasonId: id,
    });
  } catch (error) {
    console.error("Error en PUT /seasons/[id]:", error);
    return NextResponse.json(
      { error: "Error al actualizar deuda", detail: error.message },
      { status: 500 }
    );
  } finally {
    db.release();
  }
}
