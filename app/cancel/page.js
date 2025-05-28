"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import styles from "./cancel.module.css";

import { useTranslation } from "react-i18next";

export default function CancelPageWrapper() {
  const { t } = useTranslation();
  return (
    <div className={styles.cancelPage}>
      <Suspense fallback={<p>{t("cancelPage.verifying")}</p>}>
        <CancelPage />
      </Suspense>
    </div>
  );
  // El Suspense es para que no se vea el loading de la página entera
}

function CancelPage() {
  const { t } = useTranslation();
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

  if (status === "loading") return <p>{t("cancelPage.verifying")}</p>;

  if (status === "error") {
    return (
      <div>
        <h2>{t("cancelPage.somethingWentWrong")}</h2>
        <p>{t("cancelPage.pleaseContact")}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1>{t("cancelPage.paymentCancelled")}</h1>
      <p>
        {playerName
          ? `${t("cancelPage.hello")} ${playerName}, ${t(
              "cancelPage.yourInscription"
            )}`
          : t("cancelPage.thePaymentWasCancelled")}
      </p>
      <p>${t("cancelPage.ifItsWasAMistake")}</p>
    </div>
  );
}
