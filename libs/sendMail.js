import { getActiveSeason } from "@/libs/seasons";
import pool from "@/libs/mysql";
import { ref, getDownloadURL } from "firebase/storage";
import { storage } from "@/libs/firebase";

const buildSecureFirebaseUrl = (path, token) => {
  if (!path || !token) return "";
  return `https://firebasestorage.googleapis.com/v0/b/algaida-volei-club.firebasestorage.app/o/${encodeURIComponent(
    path
  )}?alt=media&token=${token}`;
};

export async function sendMail({ playerId, dni, name, email, total_pago }) {
  const seasonId = await getActiveSeason();
  const db = await pool.getConnection();

  try {
    // Obtener últimos 2 documentos por orden descendente
    const [docs] = await db.execute(
      `SELECT file_url
       FROM documents
       WHERE player_id = ? AND season_id = ? AND doc_type != 'dni'
       ORDER BY uploaded_at DESC
       LIMIT 2`,
      [playerId, seasonId]
    );

    // Obtener token temporal desde el primer documento (si hay)
    let token = null;
    if (docs.length > 0) {
      const fileRef = ref(storage, docs[0].file_url);
      const url = await getDownloadURL(fileRef);
      token = new URL(url).searchParams.get("token");
    }

    const docUrls = docs.map((doc) =>
      buildSecureFirebaseUrl(doc.file_url, token)
    );

    const body = {
      name,
      email,
      dni,
      total_pago: total_pago / 100,
      docs: docUrls,
    };

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
