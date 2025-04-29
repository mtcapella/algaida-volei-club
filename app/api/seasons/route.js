import { NextResponse } from "next/server";
import pool from "@/libs/mysql";

// GET: Listar todas las temporadas con total de jugadores y equipos
export async function GET() {
  const db = await pool.getConnection();

  try {
    const [seasons] = await db.execute(
      `SELECT 
          s.id, 
          s.name, 
          s.start_date, 
          s.end_date, 
          s.is_active,
          (SELECT COUNT(DISTINCT r.player_id) FROM registrations r WHERE r.season_id = s.id) AS totalPlayers,
          (SELECT COUNT(*) FROM teams t WHERE t.season_id = s.id) AS totalTeams
       FROM seasons s
       ORDER BY s.start_date DESC`
    );

    return NextResponse.json(seasons);
  } catch (error) {
    console.error("DB error en GET SEASONS:", error);
    return NextResponse.json(
      { error: "Error al cargar temporadas", detail: error.message },
      { status: 500 }
    );
  } finally {
    db.release();
  }
}

// POST: Crear una nueva temporada (por defecto inactiva)
export async function POST(request) {
  const db = await pool.getConnection();

  try {
    const body = await request.json();
    const { name, startDate, endDate } = body;

    if (!name || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    await db.execute(
      `INSERT INTO seasons (name, start_date, end_date, is_active)
       VALUES (?, ?, ?, 0)`,
      [name, startDate, endDate]
    );

    return NextResponse.json({
      success: true,
      message: "Temporada creada correctamente",
    });
  } catch (error) {
    console.error("DB error en POST SEASONS:", error);
    return NextResponse.json(
      { error: "Error al crear temporada", detail: error.message },
      { status: 500 }
    );
  } finally {
    db.release();
  }
}
