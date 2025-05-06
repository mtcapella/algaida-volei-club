import { getActiveSeason } from "@/libs/seasons";
import pool from "@/libs/mysql";

export async function sendMail({ playerId, dni, name, email, total_pago }) {
  const seasonId = await getActiveSeason();
  const db = await pool.getConnection();

  try {
    // Obtener URLs de documentos de la temporada activa
    const [docs] = await db.execute(
      `SELECT file_url
       FROM documents
       WHERE player_id = ? AND season_id = ?`,
      [playerId, seasonId]
    );

    const docUrls = docs.map((doc) => doc.file_url);

    // Montar el cuerpo del POST
    const body = {
      name,
      email,
      dni,
      total_pago: total_pago / 100, // Convertir a euros
      docs: docUrls,
    };

    console.log("Cuerpo del correo:", body);
    // Enviar POST al endpoint PHP
    const response = await fetch(
      "http://s1044554372.mialojamiento.es/mail.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );
    console.log("response", response);
    if (!response.ok) {
      console.error("Fallo al enviar el correo:", await response.text());
    }

    return response.ok;
  } catch (error) {
    console.error("Error al enviar correo de confirmación:", error);
    return false;
  } finally {
    db.release();
  }
}
