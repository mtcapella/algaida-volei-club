"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card } from "primereact/card";
import { Toolbar } from "primereact/toolbar";
import { Button } from "primereact/button";

import { Toast } from "primereact/toast";
import { ProgressSpinner } from "primereact/progressspinner";
import Link from "next/link";

import styles from "./temporadas.module.css";

import { api } from "@/libs/api"; // Asegúrate de que este path sea correcto

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

      const res = await api(`/api/seasons`);
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
