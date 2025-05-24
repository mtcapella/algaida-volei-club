"use client";

import React, { useState, useEffect, useRef } from "react";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import { ProgressSpinner } from "primereact/progressspinner";
import { useTranslation } from "react-i18next";
import { api } from "@/libs/api";
import styles from "./ajustes.module.css";

import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

export default function SettingsPage() {
  /* ---------- i18n ---------- */
  const { i18n } = useTranslation();
  const changeLang = (lng) => i18n.changeLanguage(lng);

  /* ---------- refs ---------- */
  const toast = useRef(null);

  /* ---------- state ---------- */
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [formEnabled, setFormEnabled] = useState(false);
  const [opensAt, setOpensAt] = useState(null);
  const [closesAt, setClosesAt] = useState(null);
  const [language, setLanguage] = useState(i18n.resolvedLanguage);

  /* nueva temporada modal */
  const [newSeasonVisible, setNewSeasonVisible] = useState(false);
  const [newStart, setNewStart] = useState(null);
  const [newEnd, setNewEnd] = useState(null);
  const [savingSeason, setSavingSeason] = useState(false);

  // fetcheamos el estado del formulario
  const getFormStatus = async () => {
    setLoadingStatus(true);
    try {
      const base = process.env.NEXT_PUBLIC_DOMAIN;
      const res = await fetch(`${base}/api/form/status`);
      const data = await res.json();
      setFormEnabled(data.enabled === 1);
      setOpensAt(new Date(data.opens_at));
      setClosesAt(new Date(data.closes_at));
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "No se pudo obtener el estado del formulario.",
        life: 3000,
      });
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    getFormStatus();
  }, []);

  // función para actualizar el estado del formulario
  const updateFormStatus = async (enabled) => {
    // validar fechas
    if (closesAt.getTime() <= opensAt.getTime()) {
      toast.current?.show({
        severity: "warn",
        summary: "Fechas no válidas",
        detail: "La fecha de cierre debe ser posterior a la de apertura.",
        life: 3000,
      });
      return;
    }

    if (
      !window.confirm(
        `¿Seguro que deseas ${enabled ? "abrir" : "cerrar"} las inscripciones?`
      )
    )
      return;

    try {
      const body = {
        opens_at: opensAt.toISOString(),
        closes_at: closesAt.toISOString(),
        enabled: enabled ? 1 : 0,
      };
      const base = process.env.NEXT_PUBLIC_DOMAIN;
      const res = await fetch(`${base}/api/form/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      toast.current?.show({
        severity: "success",
        summary: "Éxito",
        detail: `Inscripciones ${enabled ? "abiertas" : "cerradas"}`,
        life: 2500,
      });
      setFormEnabled(enabled);
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "No se pudo actualizar el estado.",
        life: 3000,
      });
    }
  };
  // crear nueva temporada y cerrar la actual
  const handleCreateSeason = async () => {
    if (!newStart || !newEnd) {
      toast.current?.show({
        severity: "warn",
        summary: "Fechas requeridas",
        detail: "Debes indicar inicio y fin.",
        life: 3000,
      });
      return;
    }

    // validar fechas
    if (newEnd.getTime() <= newStart.getTime()) {
      toast.current?.show({
        severity: "warn",
        summary: "Fechas no válidas",
        detail: "La fecha de cierre debe ser posterior a la de inicio.",
        life: 3000,
      });
      return;
    }

    if (
      !window.confirm(
        "Al crear una nueva temporada la actual se cerrará y las deudas se trasladarán. Esta acción es irreversible. ¿Continuar?"
      )
    )
      return;

    setSavingSeason(true);
    try {
      const body = {
        start_date: newStart.toISOString().split("T")[0],
        end_date: newEnd.toISOString().split("T")[0],
      };

      const res = await api(`/api/seasons/close-and-create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      toast.current?.show({
        severity: "success",
        summary: "Temporada creada",
        detail: "La nueva temporada se creó correctamente.",
        life: 3000,
      });
      setNewSeasonVisible(false);
      setNewStart(null);
      setNewEnd(null);
      // podríamos refrescar estado si fuera necesario
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "No se pudo crear la temporada.",
        life: 3000,
      });
    } finally {
      setSavingSeason(false);
    }
  };

  // funciones de renderizado
  if (loadingStatus) {
    return (
      <div className="flex justify-content-center" style={{ height: "60vh" }}>
        <ProgressSpinner />
      </div>
    );
  }

  return (
    <div>
      <Toast ref={toast} />

      {/* Idioma */}
      <div className={styles.block}>
        <Dropdown
          value={language}
          onChange={(e) => {
            setLanguage(e.value);
            changeLang(e.value);
          }}
          options={[
            { label: "Español", value: "es" },
            { label: "Català", value: "ca" },
            { label: "English", value: "en" },
          ]}
          placeholder="Selecciona idioma"
          className="w-full"
        />
      </div>

      {/* Inscripciones */}
      <div className={styles.block}>
        <p style={{ marginBottom: "0.5rem" }}>Inscripciones</p>
        <div className="grid" style={{ gap: "1rem" }}>
          <div className="col-12 md:col-6">
            <label>Abren el</label>
            <Calendar
              value={opensAt}
              onChange={(e) => setOpensAt(e.value)}
              showIcon
              dateFormat="yy-mm-dd"
            />
          </div>
          <div className="col-12 md:col-6">
            <label>Cierran el</label>
            <Calendar
              value={closesAt}
              onChange={(e) => setClosesAt(e.value)}
              showIcon
              dateFormat="yy-mm-dd"
            />
          </div>
        </div>
        <div className={styles.inlineCenter} style={{ gap: "1rem" }}>
          <Button
            label="Abrir"
            className="p-button-sm p-button-success"
            disabled={formEnabled}
            onClick={() => updateFormStatus(true)}
          />
          <Button
            label="Cerrar"
            className="p-button-sm p-button-danger"
            disabled={!formEnabled}
            onClick={() => updateFormStatus(false)}
          />
        </div>
        <small style={{ display: "block", marginTop: ".5rem" }}>
          Estado actual: {formEnabled ? "Abierto" : "Cerrado"}
        </small>
      </div>

      {/* Crear nueva temporada */}
      <div className={styles.block}>
        <p style={{ marginBottom: "0.5rem" }}>Nueva temporada</p>
        <Button
          label="Crear nueva temporada"
          icon="pi pi-plus-circle"
          className="p-button-sm"
          onClick={() => setNewSeasonVisible(true)}
        />
      </div>

      {/* Dialog nueva temporada */}
      <Dialog
        header="Crear nueva temporada"
        visible={newSeasonVisible}
        style={{ width: "420px" }}
        modal
        onHide={() => setNewSeasonVisible(false)}
      >
        <div className="p-fluid" style={{ gap: "1rem" }}>
          <label>Inicio</label>
          <Calendar
            value={newStart}
            onChange={(e) => setNewStart(e.value)}
            showIcon
            dateFormat="yy-mm-dd"
          />

          <label style={{ marginTop: "1rem" }}>Fin</label>
          <Calendar
            value={newEnd}
            onChange={(e) => setNewEnd(e.value)}
            showIcon
            dateFormat="yy-mm-dd"
          />

          <div
            className="flex justify-content-end mt-4"
            style={{ gap: "1rem" }}
          >
            <Button
              label="Cancelar"
              className="p-button-text p-button-sm"
              onClick={() => setNewSeasonVisible(false)}
              disabled={savingSeason}
            />
            <Button
              label="Guardar"
              icon="pi pi-check"
              className="p-button-sm"
              loading={savingSeason}
              onClick={handleCreateSeason}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
