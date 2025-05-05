import Stripe from "stripe";
import { NextResponse } from "next/server";
import { paymentUpdate } from "@/libs/paymentUpdate";

const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET);

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const session_id = searchParams.get("session_id");

    if (!session_id) {
      return NextResponse.json(
        { success: false, message: "Falta session_id" },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);

    // Extraer datos útiles
    const {
      id: stripe_session_id,
      payment_intent,
      customer,
      customer_details,
      amount_total,
      currency,
      payment_status,
      created,
      metadata,
    } = session;

    const dni = metadata?.dni;
    const playerId = metadata?.playerId;
    const name = customer_details?.name || metadata?.name;
    const email = customer_details?.email || metadata?.email;

    // Definir estado local según pago
    let status;

    if (payment_status === "paid") {
      status = "completed";
    } else if (payment_status === "unpaid" || payment_status === "canceled") {
      status = "cancelled";
    } else {
      status = "pending";
    }

    // Guardar el estado en la DB
    await paymentUpdate(stripe_session_id, playerId, status);

    return NextResponse.json({
      success: true,
      stripe_session_id,
      payment_intent,
      stripe_customer_id: customer,
      amount_total,
      currency,
      status, // nuestro estado interno
      stripe_status: payment_status, // estado de Stripe
      created: new Date(created * 1000).toISOString(),
      dni,
      playerId,
      name,
      email,
    });
  } catch (err) {
    console.error("Error al verificar sesión:", err);
    return NextResponse.json(
      { success: false, message: "Error del servidor" },
      { status: 500 }
    );
  }
}
