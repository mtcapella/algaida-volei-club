"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card } from "primereact/card";
import { Toolbar } from "primereact/toolbar";
import { Button } from "primereact/button";

import { Toast } from "primereact/toast";
import { ProgressSpinner } from "primereact/progressspinner";
import Link from "next/link";

import styles from "./temporadas.module.css";

import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

import { useTranslation } from "react-i18next";

export default function SeasonsPage() {
  const { t } = useTranslation();
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [form, setForm] = useState({
    name: "",
    startDate: null,
    endDate: null,
  });
  const toast = useRef(null);

  /** helpers */
  const fetchSeasons = async () => {
    try {
      setLoading(true);
      const base = process.env.NEXT_PUBLIC_DOMAIN;
      const res = await fetch(`${base}/api/seasons`);
      const data = await res.json();
      setSeasons(data);
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: t("seasons.cantLoadSeasons"),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeasons();
  }, []);

  /** create season */
  const submitSeason = async () => {
    if (!form.name || !form.startDate || !form.endDate) {
      toast.current.show({ severity: "warn", summary: "Faltan datos" });
      return;
    }
    try {
      const base = process.env.NEXT_PUBLIC_DOMAIN;
      const response = await fetch(`${base}/api/seasons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          startDate: form.startDate?.toISOString().split("T")[0],
          endDate: form.endDate?.toISOString().split("T")[0],
        }),
      });
      if (!response.ok) throw new Error();
      toast.current.show({
        severity: "success",
        summary: "Temporada creada",
      });
      setDialogVisible(false);
      setForm({ name: "", startDate: null, endDate: null });
      fetchSeasons();
    } catch {
      toast.current.show({ severity: "error", summary: "No se pudo crear" });
    }
  };

  const leftToolbar = () => (
    <div className="flex gap-2">
      <Button
        icon="pi pi-refresh"
        label={t("buttons.update")}
        className="p-button-secondary"
        onClick={fetchSeasons}
      />
    </div>
  );

  return (
    <div className={styles.container}>
      <Toast ref={toast} />
      <Toolbar left={leftToolbar} className="mb-4" />

      {loading ? (
        <div className={styles.center}>
          <ProgressSpinner />
        </div>
      ) : (
        <div className={styles.wrapper}>
          {seasons.map((s) => (
            <Card key={s.id} className={styles.card}>
              <div className={styles.cardContent}>
                {/* Si is_active = 1 se muestra el texto si is_active = 0 se pone un link  */}
                {s.is_active ? (
                  <h3>{s.name}</h3>
                ) : (
                  <Link
                    href={`/backvolei/temporadas/${s.id}`}
                    className={styles.link}
                  >
                    <h3>{s.name}</h3>
                  </Link>
                )}

                <div className={styles.status}>
                  <span
                    className={s.is_active ? styles.active : styles.inactive}
                  >
                    {s.is_active ? t("seasons.active") : t("seasons.finished")}
                  </span>
                </div>
                <p>
                  {s.totalPlayers} {t("seasons.players")}{" "}
                </p>
                <p>
                  {s.totalTeams} {t("seasons.teams")}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
