"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import styles from "./cancel.module.css";

export default function CancelPageWrapper() {
  return (
    <div className={styles.cancelPage}>
      <Suspense fallback={<p>⏳ Verificando cancelación...</p>}>
        <CancelPage />
      </Suspense>
    </div>
  );
  // El Suspense es para que no se vea el loading de la página entera
}

function CancelPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [status, setStatus] = useState("loading");
  const [playerName, setPlayerName] = useState("");

  useEffect(() => {
    const verificarCancelacion = async () => {
      if (!sessionId) return setStatus("error");

      try {
        const base = process.env.NEXT_PUBLIC_DOMAIN;
        const res = await fetch(
          `${base}/api/verify-checkout-session?session_id=${sessionId}`
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
      <div>
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
