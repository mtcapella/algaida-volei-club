import Stripe from "stripe";
import { NextResponse } from "next/server";
//import { marcarPagoComoRealizado } from '@/libs/db'; // <-- tu función para actualizar

const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET);

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const session_id = searchParams.get("session_id");

    if (!session_id) {
      return NextResponse.json(
        { message: "session_id no proporcionado" },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { message: "Pago no completado" },
        { status: 402 }
      );
    }

    const metadata = session.metadata || {};
    const dni = metadata.dni;

    console.log("metadata", metadata);

    if (!dni) {
      return NextResponse.json(
        { message: "DNI no encontrado en metadata" },
        { status: 400 }
      );
    }

    // 🔧 Aquí actualizas en tu base de datos
    //const jugador = await marcarPagoComoRealizado(dni); // tú defines esta función

    return NextResponse.json({
      success: true,
      name: jugador?.nombre || "Jugador/a",
    });
  } catch (err) {
    console.error("Error verificando sesión de Stripe:", err);
    return NextResponse.json(
      { message: "Error del servidor" },
      { status: 500 }
    );
  }
}
