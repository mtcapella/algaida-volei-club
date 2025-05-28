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
  // Inicializamos i18n para traducciones

  const { i18n } = useTranslation();
  const changeLang = (lng) => i18n.changeLanguage(lng);
  const { t } = useTranslation();

  // referencia para el Toast
  const toast = useRef(null);

  // Estados para el formulario
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
        detail: t("settings.cantGetFormStatus"),
        life: 3000,
      });
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    getFormStatus();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // función para actualizar el estado del formulario
  const updateFormStatus = async (enabled) => {
    // validar fechas
    if (closesAt.getTime() <= opensAt.getTime()) {
      toast.current?.show({
        severity: "warn",
        summary: t("settings.invalitDate"),
        detail: t("settings.dateCanNot"),
        life: 3000,
      });
      return;
    }

    if (
      !window.confirm(
        `${t("settings.areYouSure")} ${
          enabled ? t("settings.open") : t("settings.close")
        } ${t("settings.theIncription")}`
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
        summary: t("settings.success"),
        detail: `${t("settings.inscrptions")} ${
          enabled ? t("settings.opened") : t("settings.closed")
        }`,
        life: 2500,
      });
      setFormEnabled(enabled);
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: t("settings.error"),
        detail: t("settings.cantUpdateStatus"),
        life: 3000,
      });
    }
  };
  // crear nueva temporada y cerrar la actual
  const handleCreateSeason = async () => {
    if (!newStart || !newEnd) {
      toast.current?.show({
        severity: "warn",
        summary: t("settings.dateRequired"),
        detail: t("settings.initDateAndEndDate"),
        life: 3000,
      });
      return;
    }

    // validar fechas
    if (newEnd.getTime() <= newStart.getTime()) {
      toast.current?.show({
        severity: "warn",
        summary: t("settings.datesNotValid"),
        detail: t("settings.closeDateBeforeInit"),
        life: 3000,
      });
      return;
    }

    if (!window.confirm(t("settings.closeSeasonWarning"))) return;

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
        summary: t("settings.seasonCreated"),
        detail: t("settings.seasonCreatedCorrectly"),
        life: 3000,
      });
      setNewSeasonVisible(false);
      setNewStart(null);
      setNewEnd(null);
      // podríamos refrescar estado si fuera necesario
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: t("settings.error"),
        detail: t("settings.cantCreateSeason"),
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
          placeholder={t("settings.selectLenguage")}
          className="w-full"
        />
      </div>

      {/* Inscripciones */}
      <div className={styles.block}>
        <p style={{ marginBottom: "0.5rem" }}>{t("settings.inscrptions")}</p>
        <div className={styles.dateContainer}>
          <div className="col-12 md:col-6">
            <label>{t("settings.openAt")}</label>
            <Calendar
              value={opensAt}
              onChange={(e) => setOpensAt(e.value)}
              showIcon
              dateFormat="yy-mm-dd"
            />
          </div>
          <div className="col-12 md:col-6">
            <label>{t("settings.closeAt")}</label>
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
            label={t("settings.open")}
            className="p-button-sm p-button-success"
            disabled={formEnabled}
            onClick={() => updateFormStatus(true)}
          />
          <Button
            label={t("settings.close")}
            className="p-button-sm p-button-danger"
            disabled={!formEnabled}
            onClick={() => updateFormStatus(false)}
          />
        </div>
        <small style={{ display: "block", marginTop: ".5rem" }}>
          {t("settings.actualStatus")}:{" "}
          {formEnabled ? t("settings.open2") : t("settings.close2")}
        </small>
      </div>

      {/* Crear nueva temporada */}
      <div className={styles.block}>
        <p style={{ marginBottom: "0.5rem" }}>{t("settings.newSeason")}</p>
        <Button
          label={t("settings.createNewSeason")}
          icon="pi pi-plus-circle"
          className="p-button-sm"
          onClick={() => setNewSeasonVisible(true)}
        />
      </div>

      {/* Dialog nueva temporada */}
      <Dialog
        header={t("settings.createNewSeason")}
        visible={newSeasonVisible}
        style={{ width: "420px" }}
        modal
        onHide={() => setNewSeasonVisible(false)}
      >
        <div className={styles.formContainer} style={{ gap: "1rem" }}>
          <label>{t("settings.start")}</label>
          <Calendar
            value={newStart}
            onChange={(e) => setNewStart(e.value)}
            showIcon
            dateFormat="yy-mm-dd"
          />

          <label style={{ marginTop: "1rem" }}>{t("settings.end")}</label>
          <Calendar
            value={newEnd}
            onChange={(e) => setNewEnd(e.value)}
            showIcon
            dateFormat="yy-mm-dd"
          />

          <div className={styles.buttonsContainer} style={{ gap: "1rem" }}>
            <Button
              label={t("settings.cancel")}
              className="p-button-text p-button-sm"
              onClick={() => setNewSeasonVisible(false)}
              disabled={savingSeason}
            />
            <Button
              label={t("settings.save")}
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
