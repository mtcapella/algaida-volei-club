import { NextResponse } from "next/server";
import pool from "@/libs/mysql";

export async function POST(request) {
  const db = await pool.getConnection();

  // vemos que nos llega por el post
  const body = await request.json();
  const { start_date, end_date } = body;

  // obetenemos el nombre de la temporada cogiendo el año actual y el siguiente ejmeplo Temporada 2023 - 2024 de las variables start_date y end_date

  const seasonName = `Temporada ${new Date(
    start_date
  ).getFullYear()} - ${new Date(end_date).getFullYear()}`;

  try {
    await db.beginTransaction();

    // 1. Llamar al procedimiento para pasar deudas al histórico
    await db.query("CALL archive_debts()");

    // 2. Desactivar la temporada actual
    await db.query("UPDATE seasons SET is_active = 0 WHERE is_active = 1");

    // 3. Crear la nueva temporada como activa
    const [result] = await db.query(
      `INSERT INTO seasons (name, start_date, end_date, is_active) VALUES (?, ?, ?, 1)`,
      [seasonName, start_date, end_date]
    );

    if (result.affectedRows === 0) {
      throw new Error("No se pudo crear la nueva temporada");
    }

    await db.commit();

    return NextResponse.json({
      success: true,
      message: "Nueva temporada creada y deudas archivadas.",
    });
  } catch (error) {
    await db.rollback();
    console.error("Error al cerrar y crear temporada:", error);
    return NextResponse.json(
      {
        error: "Error al cerrar y crear nueva temporada",
        detail: error.message,
      },
      { status: 500 }
    );
  } finally {
    db.release();
  }
}
