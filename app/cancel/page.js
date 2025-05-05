"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function CancelPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [status, setStatus] = useState("loading");
  const [playerName, setPlayerName] = useState("");

  useEffect(() => {
    const verificarCancelacion = async () => {
      if (!sessionId) return setStatus("error");

      try {
        const res = await fetch(
          `/api/verify-checkout-session?session_id=${sessionId}`
        );
        const data = await res.json();

        if (res.ok && data.status === "cancelled") {
          setPlayerName(data.name || "");
          setStatus("cancelled");
        } else if (res.ok && data.status === "completed") {
          // Por si cancel te redirige cuando ya has pagado, lo tratamos también
          window.location.href = "/success?session_id=" + sessionId;
        } else {
          setStatus("error");
        }
      } catch (err) {
        console.error("Error al verificar cancelación:", err);
        setStatus("error");
      }
    };

    verificarCancelacion();
  }, [sessionId]);

  if (status === "loading") return <p>⏳ Verificando cancelación...</p>;

  if (status === "error") {
    return (
      <div style={{ padding: "2rem" }}>
        <h2>❌ Algo salió mal al procesar la cancelación.</h2>
        <p>Por favor, contacta con el club o vuelve a intentarlo más tarde.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1>❌ Pago cancelado</h1>
      <p>
        {playerName
          ? `Hola, ${playerName}, tu inscripción no se ha completado.`
          : "El pago ha sido cancelado y no se ha registrado la inscripción."}
      </p>
      <p>Si fue un error, puedes volver atrás e intentarlo de nuevo.</p>
    </div>
  );
}
