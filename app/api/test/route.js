import { NextResponse } from "next/server";

import pool from "@/libs/mysql";

export async function GET() {
  try {
    const db = await pool.getConnection();
    const query = "SELECT 1 + 1 AS solution";
    const [rows] = await db.execute(query);
    db.release();

    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json(
      {
        error: error,
      },
      { status: 500 }
    );
  }
}
