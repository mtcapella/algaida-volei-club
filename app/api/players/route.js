export const runtime = "nodejs"; // Usar Node.js para este endpoint
import { requireFirebaseUser } from "@/libs/withAuth";
import { NextResponse } from "next/server";
import pool from "@/libs/mysql";
import { getActiveSeason } from "@/libs/seasons";

export async function GET(request) {
  try {
    await requireFirebaseUser(request);
  } catch (e) {
    // ③ verifica
    const msg = e.message === "NO_TOKEN" ? "Falta token" : "Token inválido";
    return NextResponse.json({ error: msg }, { status: 401 });
  }

  const db = await pool.getConnection();

  try {
    const seasonId = await getActiveSeason();

    // Jugadores registrados con pago completado
    const [playersResult] = await db.execute(
      `SELECT 
          p.id AS playerId,
          p.photo_url AS photoUrl,
          p.first_name AS firstName,
          p.last_name AS lastName,
          p.dni,
          p.date_of_birth AS dateOfBirth,
          t.name AS team,
          c.name AS category,
          CONCAT(g.first_name, ' ', g.last_name) AS guardian,
          g.phone AS guardianPhone,
          IFNULL(SUM(pay.amount), 0) AS totalPaid,
          r.participate_lottery,
          r.split_payment
       FROM players p
       INNER JOIN registrations r ON r.player_id = p.id
       LEFT JOIN teams t ON r.team_id = t.id
       INNER JOIN categories c ON r.category_id = c.id
       LEFT JOIN legal_guardians g ON g.player_id = p.id AND g.season_id = r.season_id
       INNER JOIN payments pay ON pay.player_id = p.id AND pay.season_id = r.season_id AND pay.status = 'completed'
       WHERE r.season_id = ?
       GROUP BY 
         p.id, p.photo_url, p.first_name, p.last_name, p.dni, p.date_of_birth, t.name, c.name, g.first_name, g.last_name, g.phone, r.participate_lottery, r.split_payment
       ORDER BY p.last_name ASC`,
      [seasonId]
    );

    // Mapear documentos por jugador
    const playerIds = playersResult.map((p) => p.playerId);
    let documentsMap = {};

    if (playerIds.length > 0) {
      const [documentsResult] = await db.execute(
        `SELECT player_id, doc_type AS type, file_url
         FROM documents
         WHERE season_id = ? AND player_id IN (${playerIds
           .map(() => "?")
           .join(",")})
         ORDER BY uploaded_at DESC`,
        [seasonId, ...playerIds]
      );

      documentsMap = documentsResult.reduce((acc, doc) => {
        if (!acc[doc.player_id]) acc[doc.player_id] = {};
        if (!acc[doc.player_id][doc.type]) {
          acc[doc.player_id][doc.type] = doc;
        }
        return acc;
      }, {});
    }

    const finalResult = playersResult.map((player) => {
      const cuotaBase = player.participate_lottery ? 380 : 400;
      const status =
        parseFloat(player.totalPaid) >= cuotaBase ? "Pagado" : "Pendiente";
      const docs = documentsMap[player.playerId]
        ? Object.values(documentsMap[player.playerId])
        : [];

      return {
        playerId: player.playerId,
        photoUrl: player.photoUrl,
        firstName: player.firstName,
        lastName: player.lastName,
        dni: player.dni,
        dateOfBirth: player.dateOfBirth,
        team: player.team,
        category: player.category,
        guardian: player.guardian,
        guardianPhone: player.guardianPhone,
        paymentStatus: status,
        documents: docs,
      };
    });

    return NextResponse.json(finalResult);
  } catch (error) {
    console.error("DB error en GET /players:", error);
    return NextResponse.json(
      { error: "Error al obtener jugadores" },
      { status: 500 }
    );
  } finally {
    db.release();
  }
}
