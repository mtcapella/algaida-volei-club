import { NextResponse } from "next/server";
import pool from "@/libs/mysql";

export async function GET() {
  const db = await pool.getConnection();

  try {
    const [seasonResult] = await db.execute(
      `SELECT id FROM seasons WHERE is_active = 1 LIMIT 1`
    );

    if (seasonResult.length === 0) {
      return NextResponse.json(
        { error: "No hay temporada activa" },
        { status: 500 }
      );
    }

    const seasonId = seasonResult[0].id;

    // 1. Jugadores registrados en temporada activa (solo con registros válidos)
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
          r.split_payment AS splitPayment,
          r.participate_lottery AS participateLottery
       FROM players p
       INNER JOIN registrations r ON r.player_id = p.id
       LEFT JOIN teams t ON r.team_id = t.id
       INNER JOIN categories c ON r.category_id = c.id
       LEFT JOIN legal_guardians g ON g.player_id = p.id AND g.season_id = r.season_id
       WHERE r.season_id = ?
       ORDER BY p.last_name ASC`,
      [seasonId]
    );

    const playerIds = playersResult.map((p) => p.playerId);
    let documentsResult = [];

    if (playerIds.length > 0) {
      const [rawDocuments] = await db.execute(
        `SELECT player_id, doc_type, file_url, uploaded_at
         FROM documents
         WHERE season_id = ? AND player_id IN (${playerIds
           .map(() => "?")
           .join(",")})
         ORDER BY uploaded_at DESC`,
        [seasonId, ...playerIds]
      );

      const docMap = new Map();

      for (const doc of rawDocuments) {
        const key = `${doc.player_id}_${doc.doc_type}`;
        if (!docMap.has(key)) {
          docMap.set(key, {
            type: doc.doc_type,
            url: doc.file_url,
            playerId: doc.player_id,
          });
        }
      }

      documentsResult = Array.from(docMap.values());
    }

    const result = playersResult.map((p) => {
      const playerDocs = documentsResult
        .filter((d) => d.playerId === p.playerId)
        .map(({ type, url }) => ({ type, url }));

      const cuota = p.participateLottery ? 380 : 400;
      const paymentStatus = p.splitPayment === 1 ? "Pendiente" : "Pagado";

      return {
        playerId: p.playerId,
        photoUrl: p.photoUrl,
        firstName: p.firstName,
        lastName: p.lastName,
        dni: p.dni,
        dateOfBirth: p.dateOfBirth,
        team: p.team,
        category: p.category,
        guardian: p.guardian,
        guardianPhone: p.guardianPhone,
        paymentStatus,
        documents: playerDocs,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("DB error en GET /api/players:", error);
    return NextResponse.json(
      { error: "Error al cargar jugadores", detail: error.message },
      { status: 500 }
    );
  } finally {
    db.release();
  }
}
