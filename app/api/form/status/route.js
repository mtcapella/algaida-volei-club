import { NextResponse } from "next/server";
import pool from "@/libs/mysql";
import { getActiveSeason } from "@/libs/seasons";
import { isBefore, isAfter, format } from "date-fns";

export async function GET() {
  const db = await pool.getConnection();

  try {
    const activeSeason = await getActiveSeason();

    const [result] = await db.execute(
      `SELECT opens_at, closes_at, enabled FROM form_status WHERE season_id = ?`,
      [activeSeason]
    );

    if (result.length === 0) {
      return NextResponse.json({
        opens_at: null,
        closes_at: null,
        enabled: 0,
        isActive: false,
      });
    }

    const { opens_at, closes_at, enabled } = result[0];

    const now = new Date();
    const isActive =
      enabled === 1 &&
      isBefore(new Date(opens_at), now) &&
      isAfter(new Date(closes_at), now);

    return NextResponse.json({
      opens_at: format(new Date(opens_at), "yyyy-MM-dd HH:mm:ss"),
      closes_at: format(new Date(closes_at), "yyyy-MM-dd HH:mm:ss"),
      enabled,
      isActive,
    });
  } catch (error) {
    console.error("Error en GET /form/status:", error);
    return NextResponse.json(
      {
        error: "Error al obtener el estado del formulario",
        detail: error.message,
      },
      { status: 500 }
    );
  } finally {
    db.release();
  }
}

export async function PUT(request) {
  const db = await pool.getConnection();

  try {
    const activeSeason = await getActiveSeason();

    const { opens_at, closes_at, enabled } = await request.json();

    if (!opens_at || !closes_at) {
      return NextResponse.json(
        { error: "Faltan fechas de apertura o cierre." },
        { status: 400 }
      );
    }

    // Formatear las fechas para compatibilidad con MySQL
    const formattedOpensAt = format(new Date(opens_at), "yyyy-MM-dd HH:mm:ss");
    const formattedClosesAt = format(
      new Date(closes_at),
      "yyyy-MM-dd HH:mm:ss"
    );

    // Verificar si ya existe un estado para la temporada activa
    const [existing] = await db.execute(
      `SELECT id FROM form_status WHERE season_id = ? LIMIT 1`,
      [activeSeason]
    );

    if (existing.length > 0) {
      // Si existe, actualizarlo
      await db.execute(
        `UPDATE form_status SET opens_at = ?, closes_at = ?, enabled = ? WHERE season_id = ?`,
        [formattedOpensAt, formattedClosesAt, enabled, activeSeason]
      );
    } else {
      // Si no existe, crearlo
      await db.execute(
        `INSERT INTO form_status (season_id, opens_at, closes_at, enabled)
         VALUES (?, ?, ?, ?)`,
        [activeSeason, formattedOpensAt, formattedClosesAt, enabled]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error en PUT /form/status:", error);
    return NextResponse.json(
      {
        error: "Error al actualizar el estado del formulario",
        detail: error.message,
      },
      { status: 500 }
    );
  } finally {
    db.release();
  }
}
