import pool from "@/libs/mysql";
import { getActiveSeason } from "@/libs/seasons";

export async function paymentUpdate(stripeSessionId, playerId, status) {
  const db = await pool.getConnection();
  try {
    const seasonId = await getActiveSeason();

    const [result] = await db.execute(
      `UPDATE payments 
       SET stripe_payment_id = ?, status = ?
       WHERE player_id = ? AND season_id = ?`,
      [stripeSessionId, status, playerId, seasonId]
    );

    return result.affectedRows > 0;
  } catch (err) {
    console.error("Error actualizando el pago de Stripe:", err);
    return false;
  } finally {
    db.release();
  }
}
