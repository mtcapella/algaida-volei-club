"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card } from "primereact/card";
import { Toolbar } from "primereact/toolbar";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { Toast } from "primereact/toast";
import { ProgressSpinner } from "primereact/progressspinner";

import styles from "./temporadas.module.css";

import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

export default function SeasonsPage() {
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
      const res = await fetch("/api/seasons");
      const data = await res.json();
      setSeasons(data);
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "No se pudieron cargar las temporadas",
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
      const response = await fetch("/api/seasons", {
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
        label="Refrescar"
        className="p-button-secondary"
        onClick={fetchSeasons}
      />
    </div>
  );

  const rightToolbar = () => (
    <Button
      icon="pi pi-plus"
      label="Nueva temporada"
      className="p-button-primary"
      onClick={() => setDialogVisible(true)}
    />
  );

  return (
    <div className={styles.container}>
      <Toast ref={toast} />
      <Toolbar left={leftToolbar} right={rightToolbar} className="mb-4" />

      {loading ? (
        <div className={styles.center}>
          <ProgressSpinner />
        </div>
      ) : (
        <div className={styles.wrapper}>
          {seasons.map((s) => (
            <Card key={s.id} className={styles.card}>
              <div className={styles.cardContent}>
                <h3>{s.name}</h3>
                <div className={styles.status}>
                  <span
                    className={s.is_active ? styles.active : styles.inactive}
                  >
                    {s.is_active ? "Activa" : "Finalizada"}
                  </span>
                </div>
                <p>{s.totalPlayers} Jugadores</p>
                <p>{s.totalTeams} Equipos</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        header="Nueva temporada"
        visible={dialogVisible}
        style={{ width: 400 }}
        modal
        onHide={() => setDialogVisible(false)}
        className="p-fluid"
      >
        <div className="field">
          <label>Nombre</label>
          <InputText
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div className="field">
          <label>Fecha inicio</label>
          <Calendar
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.value })}
            showIcon
            dateFormat="yy-mm-dd"
          />
        </div>
        <div className="field">
          <label>Fecha fin</label>
          <Calendar
            value={form.endDate}
            onChange={(e) => setForm({ ...form, endDate: e.value })}
            showIcon
            dateFormat="yy-mm-dd"
          />
        </div>
        <Button label="Guardar" onClick={submitSeason} className="mt-2" />
      </Dialog>
    </div>
  );
}
