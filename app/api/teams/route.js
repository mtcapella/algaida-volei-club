import { NextResponse } from "next/server";
import pool from "@/libs/mysql";

// 🏐 GET para listar equipos mejorado
export async function GET() {
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

    const [teamsResult] = await db.execute(
      `SELECT 
          t.id,
          t.name,
          t.coach_name,
          c.name AS categoryName,
          COUNT(r.id) AS totalPlayers
       FROM teams t
       INNER JOIN categories c ON t.category_id = c.id
       LEFT JOIN registrations r ON r.team_id = t.id AND r.season_id = ?
       WHERE t.season_id = ?
       GROUP BY t.id, t.name, t.coach_name, c.name
       ORDER BY t.name ASC`,
      [seasonId, seasonId]
    );

    return NextResponse.json(teamsResult);
  } catch (error) {
    console.error("DB error en GET TEAMS:", error);
    return NextResponse.json(
      { error: "Error al cargar equipos", detail: error.message },
      { status: 500 }
    );
  } finally {
    db.release();
  }
}

// 🏐 POST para crear un nuevo equipo
export async function POST(request) {
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

    // Buscar temporada activa
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

    // Insertar el nuevo equipo
    await db.execute(
      `INSERT INTO teams (name, coach_name, category_id, season_id)
       VALUES (?, ?, ?, ?)`,
      [name, coachName, categoryId, seasonId]
    );

    return NextResponse.json({
      success: true,
      message: "Equipo creado correctamente",
    });
  } catch (error) {
    console.error("DB error en POST TEAMS:", error);
    return NextResponse.json(
      { error: "Error al crear equipo", detail: error.message },
      { status: 500 }
    );
  } finally {
    db.release();
  }
}
