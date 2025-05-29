"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import styles from "./success.module.css";

import { useTranslation } from "react-i18next";

export default function SuccessPageWrapper() {
  const { t } = useTranslation();
  return (
    <div className={styles.successPage}>
      <Suspense fallback={<p>{t("successPage.verifying")}</p>}>
        <SuccessPage />
      </Suspense>
    </div>
  );
  // El Suspense es para que no se vea el loading de la página entera
}

function SuccessPage() {
  const { t } = useTranslation();
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
        const base = process.env.NEXT_PUBLIC_DOMAIN;
        const res = await fetch(
          `${base}/api/verify-checkout-session?session_id=${sessionId}`
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
      <div>
        <h2>{t("successPage.verifying")}</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.successPage}>
        <h2>{t("successPage.somethingWentWrong")}</h2>
        <p>{t("successPage.pleaseContact")}</p>
      </div>
    );
  }

  return (
    <div className={styles.successPage}>
      <h1>{t("successPage.paymentSuccess")}</h1>
      <p>
        {t("successPage.thanks")}, <strong>{playerName}</strong>,{" "}
        {t("successPage.paymentSuccessMessage")}
      </p>
    </div>
  );
}
