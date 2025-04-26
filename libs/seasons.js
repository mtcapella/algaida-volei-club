import pool from "../libs/mysql.js";

export async function getActiveSeason() {
  const conn = await pool.getConnection();
  try {
    const [[row]] = await conn.query(
      `SELECT id
           FROM seasons
          WHERE is_active = 1
          LIMIT 1`
    );
    if (!row) throw new Error("No hay temporada activa");
    return row.id;
  } finally {
    conn.release();
  }
}
