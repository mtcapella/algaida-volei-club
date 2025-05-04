import pool from "@/libs/mysql";

export async function getActiveSeason() {
  const db = await pool.getConnection();
  try {
    const [rows] = await db.query(
      `SELECT id FROM seasons WHERE is_active = 1 LIMIT 1`
    );
    if (rows.length === 0) throw new Error("No hay temporada activa");
    return rows[0].id;
  } finally {
    db.release();
  }
}
