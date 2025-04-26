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

    // 1. Jugadores registrados
    const [playersResult] = await db.execute(
      `SELECT 
          p.id AS playerId,
          p.photo_url,
          p.first_name,
          p.last_name,
          p.dni,
          p.date_of_birth,
          t.name AS teamName,
          c.name AS categoryName,
          CONCAT(g.first_name, ' ', g.last_name) AS guardianName,
          g.phone AS guardianPhone,
          IFNULL(SUM(pay.amount), 0) AS totalPaid
       FROM players p
       INNER JOIN registrations r ON r.player_id = p.id
       LEFT JOIN teams t ON r.team_id = t.id -- 🔥 aquí cambiamos a LEFT JOIN
       INNER JOIN categories c ON r.category_id = c.id
       LEFT JOIN legal_guardians g ON g.player_id = p.id AND g.season_id = r.season_id
       LEFT JOIN payments pay ON pay.registration_id = r.id
       WHERE r.season_id = ?
       GROUP BY 
         p.id, p.photo_url, p.first_name, p.last_name, p.dni, p.date_of_birth, t.name, c.name, g.first_name, g.last_name, g.phone
       ORDER BY p.last_name ASC`,
      [seasonId]
    );

    // 2. Documentos
    const [documentsResult] = await db.execute(
      `SELECT 
          r.player_id,
          d.doc_type,
          d.file_url
       FROM documents d
       INNER JOIN registrations r ON r.id = d.registration_id
       WHERE r.season_id = ?`,
      [seasonId]
    );

    const documentsMap = {};
    documentsResult.forEach((doc) => {
      if (!documentsMap[doc.player_id]) {
        documentsMap[doc.player_id] = {};
      }
      documentsMap[doc.player_id][doc.doc_type] = doc.file_url;
    });

    const cuotaBase = 200;
    const players = playersResult.map((player) => ({
      playerId: player.playerId,
      photoUrl: player.photo_url,
      firstName: player.first_name,
      lastName: player.last_name,
      dni: player.dni,
      dateOfBirth: player.date_of_birth,
      team: player.teamName || "Sin equipo", // 🔥 si no tiene equipo, devolvemos "Sin equipo"
      category: player.categoryName,
      guardian: player.guardianName || null,
      guardianPhone: player.guardianPhone || null,
      paymentStatus:
        parseFloat(player.totalPaid) >= cuotaBase ? "Paid" : "Pending",
      documents: {
        dniUrl: documentsMap[player.playerId]?.dni || null,
        lopdUrl: documentsMap[player.playerId]?.lopd || null,
        usoImagenesUrl: documentsMap[player.playerId]?.usoimagenes || null,
      },
    }));

    return NextResponse.json(players);
  } catch (error) {
    console.error("DB error:", error);
    return NextResponse.json(
      { error: "Error al cargar jugadores", detail: error.message },
      { status: 500 }
    );
  } finally {
    db.release();
  }
}
