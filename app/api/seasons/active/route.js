import { NextResponse } from "next/server";
import pool from "@/libs/mysql";

export async function GET(request) {
  const db = await pool.getConnection();

  try {
    const [seasons] = await db.execute(
      `select id, name from seasons where is_active = 1
         `
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
