"use client";
import React, { useEffect, useState } from "react";
import { ProgressSpinner } from "primereact/progressspinner";
import styles from "./dashboard.module.css";
import { api } from "@/libs/api"; // Asegúrate de que la ruta sea correcta
import { useTranslation } from "react-i18next";

export default function Dashboard() {
  const { t } = useTranslation();

  const [totalPlayers, setTotalPlayers] = useState(0);
  const [totalTeams, setTotalTeams] = useState(0);
  const [pagos, setPagos] = useState({ pagado: 0, pendiente: 0 });
  const [jugadoresPorCategoria, setJugadoresPorCategoria] = useState([]);
  const [loading, setLoading] = useState(true);

  // obtenemos los datos del dashboard desde la API
  // usando la cache no-store para que siempre se obtengan los datos actualizados

  const getDashboardData = async () => {
    // const base = process.env.NEXT_PUBLIC_DOMAIN;
    const res = await api("/api/dashboard");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    return res.json();
  };
  useEffect(() => {
    getDashboardData()
      .then((data) => {
        setTotalPlayers(data.totalPlayers);
        setTotalTeams(data.totalTeams);
        setPagos(data.pagos);
        setJugadoresPorCategoria(data.jugadoresPorCategoria);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <ProgressSpinner />;
  }
  return (
    <>
      <h2>{t("dashboard.title")}</h2>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <i className={`pi pi-users ${styles.statIcon}`}></i>
          <div className={styles.statTitle}>{t("dashboard.totalPlayers")}</div>
          <div className={styles.statValue}>{totalPlayers}</div>
        </div>
        <div className={styles.statCard}>
          <i className={`pi pi-briefcase ${styles.statIcon}`}></i>
          <div className={styles.statTitle}>{t("dashboard.totalPlayers")}</div>
          <div className={styles.statValue}>{totalTeams}</div>
        </div>
        <div className={styles.statCard}>
          <i className={`pi pi-money-bill ${styles.statIcon}`}></i>
          <div className={styles.statTitle}>{t("dashboard.payed")}</div>
          <div className={styles.statValue}>{pagos.pagado}</div>
        </div>
        <div className={styles.statCard}>
          <i className={`pi pi-clock ${styles.statIcon}`}></i>
          <div className={styles.statTitle}>
            {t("dashboard.paymetsPending")}
          </div>
          <div className={styles.statValue}>{pagos.pendiente}</div>
        </div>
      </div>

      <section className={styles.categoryList}>
        <h3>{t("dashboard.playersForCategory")}</h3>
        {jugadoresPorCategoria.map(({ category, totalPlayers }) => (
          <div key={category} className={styles.categoryItem}>
            • {category}: {totalPlayers}
          </div>
        ))}
      </section>
    </>
  );
}
