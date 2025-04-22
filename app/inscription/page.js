"use client";

import React, { useRef } from "react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { Stepper } from "primereact/stepper";
import { StepperPanel } from "primereact/stepperpanel";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import styles from "./inscription.module.css";

export default function InscriptionPage() {
  const stepperRef = useRef(null);

  // inicializamos el formulario con react-hook-form
  const methods = useForm({
    defaultValues: {
      // campos del formulario
      birthDate: null,
      dni: "",
      player: null,
      registration: null,
      exists: false,
      playerId: null,
      first_name: "",
      last_name: "",
      hasDebt: false,
      pendingAmount: 0,
      email: "",
      phone: "",
      // campos de tutor legal en caso de ser menor
      guardianFirstName: "",
      guardianLastName: "",
      guardianDni: "",
      guardianPhone: "",
      guardianRelationship: "",
    },
  });

  const {
    trigger,
    setValue,
    getValues,
    setError,
    clearErrors,
    formState: { errors },
  } = methods;

  // Avanza si birthDate es válido
  const onNextFromBirth = async () => {
    if (await trigger("birthDate")) {
      stepperRef.current.nextCallback();
    }
  };

  return (
    <FormProvider {...methods}>
      <div className={styles.inscriptionCard}>
        <Stepper
          ref={stepperRef}
          orientation="vertical"
          style={{ maxWidth: "600px", margin: "0 auto" }}
        >
          {/* === Panel 1: Fecha de nacimiento === */}
          <StepperPanel header="1. Fecha nacimiento">
            <div className={styles.panelContent}>
              <label htmlFor="birthDate">Fecha de nacimiento*</label>
              <Controller
                name="birthDate"
                control={methods.control}
                rules={{
                  required: "La fecha es obligatoria",
                  validate: (v) =>
                    v <= new Date() || "No puede ser una fecha futura",
                }}
                render={({ field, fieldState }) => (
                  <>
                    <Calendar
                      id="birthDate"
                      value={field.value}
                      onChange={(e) => field.onChange(e.value)}
                      showIcon
                      dateFormat="dd/mm/yy"
                      placeholder="dd/mm/aaaa"
                    />
                    {fieldState.error && (
                      <small className={styles.error}>
                        {fieldState.error.message}
                      </small>
                    )}
                  </>
                )}
              />
            </div>
            <div className={styles.panelNav}>
              <Button
                label="Siguiente"
                icon="pi pi-arrow-right"
                iconPos="right"
                onClick={onNextFromBirth}
              />
            </div>
          </StepperPanel>

          {/* === Panel 2: DNI / Existencia y foto DNI === */}
          <StepperPanel header="2. DNI / Existencia">
            <div className={styles.panelContent}>
              {/* DNI */}
              <label htmlFor="dni">DNI*</label>
              <Controller
                name="dni"
                control={methods.control}
                rules={{
                  required: "El DNI es obligatorio",
                  pattern: {
                    value: /^[0-9A-Z]{8,9}$/,
                    message: "Formato de DNI inválido",
                  },
                }}
                render={({ field, fieldState }) => (
                  <>
                    <input
                      id="dni"
                      type="text"
                      {...field}
                      className={styles.input}
                      placeholder="12345678A"
                    />
                    {fieldState.error && (
                      <small className={styles.error}>
                        {fieldState.error.message}
                      </small>
                    )}
                  </>
                )}
              />

              {/* Foto del DNI */}
              <label htmlFor="dniFile">Foto del DNI*</label>
              <Controller
                name="dniFile"
                control={methods.control}
                rules={{
                  required: "Debes subir la foto del DNI",
                  validate: (file) =>
                    (file && file.type.startsWith("image/")) ||
                    "Solo se permiten imágenes",
                  validate: (file) =>
                    (file && file.size <= 2 * 1024 * 1024) ||
                    "La imagen no puede superar los 2 MB",
                }}
                render={({ field, fieldState }) => (
                  <>
                    <input
                      id="dniFile"
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        field.onChange(e.target.files?.[0] ?? null)
                      }
                    />
                    {fieldState.error && (
                      <small className={styles.error}>
                        {fieldState.error.message}
                      </small>
                    )}
                  </>
                )}
              />

              {/* Error de API */}
              {errors.api && (
                <small className={styles.error}>{errors.api.message}</small>
              )}
            </div>

            <div className={styles.panelNav}>
              <Button
                label="Atrás"
                severity="secondary"
                icon="pi pi-arrow-left"
                onClick={() => stepperRef.current.prevCallback()}
              />

              <Button
                label="Siguiente"
                icon="pi pi-arrow-right"
                iconPos="right"
                onClick={async () => {
                  // 1️⃣ validamos formato DNI y foto
                  const ok = await trigger(["dni", "dniFile"]);
                  if (!ok) return;

                  // 2️⃣ llamamos a la API
                  const dniVal = getValues("dni").toUpperCase();
                  try {
                    const res = await fetch(`/api/check-user/${dniVal}`);
                    const data = await res.json();

                    // 3️⃣ seteamos todos los valores en el form
                    setValue("exists", data.exists);
                    setValue("player", data.player ?? null);
                    setValue(
                      "registration",
                      data.registered ? data.registration : null
                    );
                    setValue("hasDebt", data.hasDebt ?? false);
                    setValue("pendingAmount", data.pendingAmount ?? 0);
                    if (data.exists && data.registered) {
                      // bloqueo si ya está en temporada activa
                      setError("api", {
                        type: "manual",
                        message: "Ya estás inscrito/a en la temporada activa.",
                      });
                      return;
                    }

                    // 4️⃣ limpiamos error previo y pasamos al siguiente panel
                    clearErrors("api");
                    stepperRef.current.nextCallback();
                  } catch (err) {
                    setError("api", {
                      type: "manual",
                      message: "Error al comprobar el DNI. Intenta de nuevo.",
                    });
                  }
                }}
              />
            </div>
          </StepperPanel>

          {/* Paneles siguientes… */}
          <StepperPanel header="3. Datos personales">{/* … */}</StepperPanel>
          <StepperPanel header="4. Confirmar y enviar">{/* … */}</StepperPanel>
        </Stepper>
      </div>
    </FormProvider>
  );
}
