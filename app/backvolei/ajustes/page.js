"use client";

import React, { useState, useRef } from "react";
import { Dropdown } from "primereact/dropdown";
import { RadioButton } from "primereact/radiobutton";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";

import styles from "./ajustes.module.css";

import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

export default function SettingsPage() {
  const toast = useRef(null);

  /** ------- estado local (solo para demo) ------- */
  const [language, setLanguage] = useState(null);
  const [closeSeasonChoice, setCloseSeasonChoice] = useState(null); // "yes" | "no"
  const [inscriptionsOpen, setInscriptionsOpen] = useState(null); // true | false

  /** ------- helpers ------- */
  const confirmAction = (question, actionLabel, cb) => {
    const ok = window.confirm(question);
    if (!ok) return;
    console.log(`[DEMO] ${actionLabel}`);
    toast.current.show({
      severity: "success",
      summary: "Acción simulada",
      detail: actionLabel,
      life: 2500,
    });
    cb?.();
  };

  /* --------------------------- UI --------------------------- */
  return (
    <div>
      {/** Idioma */}
      <div className={styles.block}>
        <Dropdown
          value={language}
          onChange={(e) => setLanguage(e.value)}
          options={[
            { label: "Español", value: "es" },
            { label: "Català", value: "ca" },
            { label: "English", value: "en" },
          ]}
          placeholder="Selecciona idioma"
          className="w-full"
        />
      </div>

      {/** Cerrar temporada */}
      <div className={styles.block}>
        <p style={{ marginBottom: "0.5rem" }}>Cerrar temporada actual</p>
        <div className={styles.inlineCenter} style={{ gap: "1.5rem" }}>
          <div>
            <RadioButton
              inputId="closeYes"
              value="yes"
              name="close"
              onChange={(e) => setCloseSeasonChoice(e.value)}
              checked={closeSeasonChoice === "yes"}
            />
            <label htmlFor="closeYes" style={{ marginLeft: ".3rem" }}>
              Sí
            </label>
          </div>
          <div>
            <RadioButton
              inputId="closeNo"
              value="no"
              name="close"
              onChange={(e) => setCloseSeasonChoice(e.value)}
              checked={closeSeasonChoice === "no"}
            />
            <label htmlFor="closeNo" style={{ marginLeft: ".3rem" }}>
              No
            </label>
          </div>
        </div>
        <Button
          label="Bloquear la edición de datos de la temporada en curso"
          className="p-button-sm p-button-danger mt-3"
          onClick={() =>
            confirmAction(
              "¿Seguro que deseas cerrar la temporada?",
              "Cerrar temporada",
              () => {}
            )
          }
        />
      </div>

      {/** Inscripciones */}
      <div className={styles.block}>
        <p style={{ marginBottom: "0.5rem" }}>Inscripciones</p>
        <div className={styles.inlineCenter} style={{ gap: "1rem" }}>
          <Button
            label="Abrir"
            className="p-button-sm p-button-success"
            onClick={() =>
              confirmAction(
                "¿Abrir inscripciones?",
                "Abrir inscripciones",
                () => {
                  setInscriptionsOpen(true);
                }
              )
            }
          />
          <Button
            label="Cerrar"
            className="p-button-sm p-button-danger"
            onClick={() =>
              confirmAction(
                "¿Cerrar inscripciones?",
                "Cerrar inscripciones",
                () => {
                  setInscriptionsOpen(false);
                }
              )
            }
          />
        </div>
        <small style={{ display: "block", marginTop: ".5rem" }}>
          Estado actual:{" "}
          {inscriptionsOpen === null
            ? "—"
            : inscriptionsOpen
            ? "Abierto"
            : "Cerrado"}
        </small>
      </div>

      <div className={styles.blockFuture}>
        Opciones futuras (logs, gestión de usuarios, etc.)
      </div>
    </div>
  );
}
