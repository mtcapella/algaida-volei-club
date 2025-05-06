// /api/teams/[id]/route.js

import { NextResponse } from "next/server";
import pool from "@/libs/mysql";

// GET para obtener un equipo por ID
export async function GET(request, context) {
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json(
      { error: "Falta el ID del equipo" },
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

    // 2. Obtener datos del equipo + jugadores
    const [teamData] = await db.execute(
      `SELECT 
          t.id AS teamId,
          t.name AS teamName,
          t.coach_name,
          c.name AS categoryName
       FROM teams t
       INNER JOIN categories c ON t.category_id = c.id
       WHERE t.id = ? AND t.season_id = ?
       LIMIT 1`,
      [id, seasonId]
    );

    if (teamData.length === 0) {
      return NextResponse.json(
        { error: "Equipo no encontrado para esta temporada" },
        { status: 404 }
      );
    }

    const team = teamData[0];

    // 3. Obtener jugadores del equipo
    const [playersResult] = await db.execute(
      `SELECT 
          p.id AS playerId,
          p.dni,
          p.first_name,
          p.last_name
       FROM players p
       INNER JOIN registrations r ON r.player_id = p.id
       WHERE r.team_id = ? AND r.season_id = ?
       ORDER BY p.last_name ASC`,
      [id, seasonId]
    );

    return NextResponse.json({
      teamId: team.teamId,
      teamName: team.teamName,
      coachName: team.coach_name,
      categoryName: team.categoryName,
      players: playersResult,
    });
  } catch (error) {
    console.error("DB error en GET TEAM BY ID:", error);
    return NextResponse.json(
      { error: "Error al cargar datos del equipo", detail: error.message },
      { status: 500 }
    );
  } finally {
    db.release();
  }
}

// PUT para actualizar datos de un equipo
export async function PUT(request, context) {
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json(
      { error: "Falta el ID del equipo" },
      { status: 400 }
    );
  }

  const db = await pool.getConnection();

  try {
    const body = await request.json();
    const { name, coachName, categoryId } = body;

    if (!name || !coachName || !categoryId) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    const [updateResult] = await db.execute(
      `UPDATE teams
       SET name = ?, coach_name = ?, category_id = ?
       WHERE id = ?`,
      [name, coachName, categoryId, id]
    );

    if (updateResult.affectedRows === 0) {
      return NextResponse.json(
        { error: "Equipo no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Equipo actualizado correctamente",
    });
  } catch (error) {
    console.error("DB error en PUT TEAM:", error);
    return NextResponse.json(
      { error: "Error al actualizar equipo", detail: error.message },
      { status: 500 }
    );
  } finally {
    db.release();
  }
}

// DELETE para eliminar un equipo

// 🗑️ DELETE para borrar equipo
export async function DELETE(request, context) {
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json(
      { error: "Falta el ID del equipo" },
      { status: 400 }
    );
  }

  const db = await pool.getConnection();

  try {
    // 1. Comprobar si el equipo tiene jugadores registrados
    const [uses] = await db.execute(
      `SELECT COUNT(*) AS count FROM registrations WHERE team_id = ?`,
      [id]
    );

    if (uses[0].count > 0) {
      return NextResponse.json(
        {
          error:
            "No se puede borrar el equipo porque tiene jugadores asociados",
        },
        { status: 400 }
      );
    }
    // 2. Comprobar si el equipo tiene jugadores registrados
    const [deleteResult] = await db.execute(`DELETE FROM teams WHERE id = ?`, [
      id,
    ]);

    if (deleteResult.affectedRows === 0) {
      return NextResponse.json(
        { error: "Equipo no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Equipo eliminado correctamente",
    });
  } catch (error) {
    console.error("DB error en DELETE TEAM:", error);
    return NextResponse.json(
      { error: "Error al borrar equipo", detail: error.message },
      { status: 500 }
    );
  } finally {
    db.release();
  }
}
