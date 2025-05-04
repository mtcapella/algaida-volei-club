import { NextResponse } from "next/server";
import pool from "@/libs/mysql";
import { getActiveSeason } from "@/libs/seasons";
import { getCategoryIdByBirthDate } from "@/libs/category";

export async function POST(request) {
  const data = await request.json();
  const conn = await pool.getConnection();
  await conn.beginTransaction();

  try {
    // 1) Normalizar la fecha de nacimiento
    const dob = new Date(data.birthDate);
    const dateOfBirth = [
      dob.getFullYear(),
      String(dob.getMonth() + 1).padStart(2, "0"),
      String(dob.getDate()).padStart(2, "0"),
    ].join("-");

    // 2) INSERT / UPDATE en players
    let playerId;
    if (data.exists) {
      await conn.query(
        `UPDATE players SET email = ?, phone = ?, photo_url = ? WHERE id = ?`,
        [data.email, data.phone, data.photoUrl || null, data.playerId]
      );
      playerId = data.playerId;
    } else {
      const [resPlayer] = await conn.query(
        `INSERT INTO players
         (first_name, last_name, date_of_birth, dni, email, phone, photo_url, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          data.first_name,
          data.last_name,
          dateOfBirth,
          data.dni,
          data.email,
          data.phone,
          data.photoUrl || null,
        ]
      );
      playerId = resPlayer.insertId;
    }

    // 3) CREAR INSCRIPCIÓN
    const seasonId = await getActiveSeason();
    const categoryId = await getCategoryIdByBirthDate(data.birthDate);

    const totalFee = data.totalFee;
    const splitPaymentFlag = data.splitPayment ? 1 : 0;
    const lotteryFlag = data.participateLottery ? 1 : 0;
    const teamId = data.teamId ?? null;

    await conn.query(
      `INSERT INTO registrations
       (player_id, season_id, team_id, category_id, registered_at,
        total_fee, split_payment, participate_lottery)
       VALUES (?, ?, ?, ?, NOW(), ?, ?, ?)`,
      [
        playerId,
        seasonId,
        teamId,
        categoryId,
        totalFee,
        splitPaymentFlag,
        lotteryFlag,
      ]
    );

    // 4) TUTOR LEGAL
    if (data.isMinor) {
      await conn.query(
        `INSERT INTO legal_guardians
         (player_id, season_id, first_name, last_name, dni, phone, email, relationship, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          playerId,
          seasonId,
          data.guardianFirstName,
          data.guardianLastName,
          data.guardianDni,
          data.guardianPhone,
          data.guardianEmail,
          data.guardianRelationship,
        ]
      );
    }

    // 5) DOCUMENTOS
    const docs = [
      { type: "lopd", url: data.lopdUrl },
      { type: "usoimagenes", url: data.imageUrl },
      { type: "dni", url: data.dniUrl },
    ];

    for (const doc of docs) {
      if (doc.url) {
        await conn.query(
          `INSERT INTO documents (player_id, season_id, doc_type, file_url, uploaded_at)
           VALUES (?, ?, ?, ?, NOW())`,
          [playerId, seasonId, doc.type, doc.url]
        );
      }
    }

    // 6) PAGO
    const stripeId = data.stripePaymentId || `demo_${Date.now()}`;
    await conn.query(
      `INSERT INTO payments
         (player_id, season_id, amount, paid_at, stripe_payment_id)
       VALUES (?, ?, ?, NOW(), ?)`,
      [playerId, seasonId, data.amount, stripeId]
    );

    await conn.commit();

    return NextResponse.json({ success: true, playerId }); // Devolvemos el ID del jugador
  } catch (err) {
    await conn.rollback();
    console.error(err);
    return NextResponse.json(
      { error: "Error al crear la inscripción" },
      { status: 500 }
    );
  } finally {
    conn.release();
  }
}

export async function GET() {
  return NextResponse.json({ message: "Use POST" }, { status: 405 });
}
