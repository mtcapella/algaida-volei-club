"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [playerName, setPlayerName] = useState("");

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setError(true);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `/api/verify-checkout-session?session_id=${sessionId}`
        );
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Error al verificar");
        }
        console.log("data", data);

        setPlayerName(data.name || "Jugador/a");
        setLoading(false);
      } catch (err) {
        console.error("Error al verificar la sesión de Stripe:", err);
        setError(true);
        setLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId]);

  if (loading) {
    return (
      <div style={{ padding: "2rem" }}>
        <h2>⏳ Verificando tu pago...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "2rem" }}>
        <h2>❌ Hubo un error al verificar tu inscripción.</h2>
        <p>Por favor, contacta con el club o intenta de nuevo.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1>✅ ¡Pago completado!</h1>
      <p>
        Gracias, <strong>{playerName}</strong>, tu inscripción ha sido
        confirmada correctamente.
      </p>
    </div>
  );
}
