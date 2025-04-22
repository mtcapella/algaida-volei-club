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

  const methods = useForm({
    mode: "onTouched",
    defaultValues: {
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
      guardianFirstName: "",
      guardianLastName: "",
      guardianDni: "",
      guardianPhone: "",
      guardianRelationship: "",
    },
  });

  const {
    trigger,
    watch,
    setValue,
    getValues,
    setError,
    clearErrors,
    formState: { errors },
  } = methods;

  // Panel 1: fecha...
  const onNextFromBirth = async () => {
    if (await trigger("birthDate")) stepperRef.current.nextCallback();
  };

  // Panel 2: DNI...
  const onNextFromDni = async () => {
    if (!(await trigger("dni"))) return;
    const dniVal = getValues("dni").toUpperCase();
    try {
      const res = await fetch(`/api/check-user/${dniVal}`);
      const data = await res.json();

      if (!data.exists) {
        setValue("player", null);
        setValue("registration", null);
        setValue("exists", false);
      } else {
        setValue("exists", true);
        setValue("player", data.player);
        setValue("playerId", data.player.playerId);
        if (data.registered) {
          setError("api", {
            type: "manual",
            message: "Ya está inscrito/a en la temporada activa.",
          });
          return;
        }
        // si hay deuda, la guardamos
        setValue("hasDebt", data.hasDebt || false);
        setValue("pendingAmount", data.pendingAmount || 0);
        clearErrors("api");
      }
      stepperRef.current.nextCallback();
    } catch {
      setError("api", {
        type: "manual",
        message: "Error al comprobar el DNI. Intenta de nuevo.",
      });
    }
  };

  // Helper para calcular edad
  const birthDate = watch("birthDate");
  const age = birthDate
    ? Math.floor(
        (new Date() - new Date(birthDate).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000)
      )
    : null;
  const isMinor = age !== null && age < 18;

  return (
    <FormProvider {...methods}>
      <div className={styles.inscriptionCard}>
        <Stepper
          ref={stepperRef}
          orientation="vertical"
          style={{ maxWidth: "600px", margin: "0 auto" }}
        >
          {/* === 1. Fecha nacimiento === */}
          <StepperPanel header="1. Fecha nacimiento">
            {/* ...igual que antes */}
            <div className={styles.panelNav}>
              <Button
                label="Siguiente"
                icon="pi pi-arrow-right"
                onClick={onNextFromBirth}
              />
            </div>
          </StepperPanel>

          {/* === 2. DNI / Existencia === */}
          <StepperPanel header="2. DNI / Existencia">
            {/* ...igual que antes */}
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
                onClick={onNextFromDni}
              />
            </div>
          </StepperPanel>

          {/* === 3. Datos personales === */}
          <StepperPanel header="3. Datos personales">
            <div className={styles.panelContent}>
              {/* Autocompletamos nombre/apellidos si existe */}
              <Controller
                name="first_name"
                control={methods.control}
                render={({ field }) => (
                  <input
                    {...field}
                    placeholder="Nombre"
                    readOnly={!!getValues("exists")}
                    className={styles.input}
                  />
                )}
              />
              <Controller
                name="last_name"
                control={methods.control}
                render={({ field }) => (
                  <input
                    {...field}
                    placeholder="Apellidos"
                    readOnly={!!getValues("exists")}
                    className={styles.input}
                  />
                )}
              />

              {/* Email */}
              <Controller
                name="email"
                control={methods.control}
                rules={{
                  required: "El email es obligatorio",
                  pattern: {
                    value: /^\S+@\S+\.\S+$/,
                    message: "Formato de email inválido",
                  },
                }}
                render={({ field, fieldState }) => (
                  <>
                    <input
                      {...field}
                      placeholder="ejemplo@dominio.com"
                      className={styles.input}
                    />
                    {fieldState.error && (
                      <small className={styles.error}>
                        {fieldState.error.message}
                      </small>
                    )}
                  </>
                )}
              />

              {/* Teléfono jugador */}
              <Controller
                name="phone"
                control={methods.control}
                rules={{
                  required: "El teléfono es obligatorio",
                  pattern: {
                    value: /^[0-9()+\s-]{7,20}$/,
                    message: "Teléfono inválido",
                  },
                }}
                render={({ field, fieldState }) => (
                  <>
                    <input
                      {...field}
                      placeholder="Teléfono"
                      className={styles.input}
                    />
                    {fieldState.error && (
                      <small className={styles.error}>
                        {fieldState.error.message}
                      </small>
                    )}
                  </>
                )}
              />

              {/* Si es menor, pedimos datos del tutor */}
              {isMinor && (
                <>
                  <h4>Datos del tutor legal</h4>
                  <Controller
                    name="guardianFirstName"
                    control={methods.control}
                    rules={{ required: "Nombre del tutor obligatorio" }}
                    render={({ field, fieldState }) => (
                      <>
                        <input
                          {...field}
                          placeholder="Nombre tutor"
                          className={styles.input}
                        />
                        {fieldState.error && (
                          <small className={styles.error}>
                            {fieldState.error.message}
                          </small>
                        )}
                      </>
                    )}
                  />
                  <Controller
                    name="guardianLastName"
                    control={methods.control}
                    rules={{ required: "Apellidos del tutor obligatorios" }}
                    render={({ field, fieldState }) => (
                      <>
                        <input
                          {...field}
                          placeholder="Apellidos tutor"
                          className={styles.input}
                        />
                        {fieldState.error && (
                          <small className={styles.error}>
                            {fieldState.error.message}
                          </small>
                        )}
                      </>
                    )}
                  />
                  <Controller
                    name="guardianDni"
                    control={methods.control}
                    rules={{
                      required: "DNI del tutor obligatorio",
                      pattern: {
                        value: /^[0-9A-Z]{8,9}$/,
                        message: "Formato de DNI inválido",
                      },
                    }}
                    render={({ field, fieldState }) => (
                      <>
                        <input
                          {...field}
                          placeholder="DNI tutor"
                          className={styles.input}
                        />
                        {fieldState.error && (
                          <small className={styles.error}>
                            {fieldState.error.message}
                          </small>
                        )}
                      </>
                    )}
                  />
                  <Controller
                    name="guardianPhone"
                    control={methods.control}
                    rules={{ required: "Teléfono del tutor obligatorio" }}
                    render={({ field, fieldState }) => (
                      <>
                        <input
                          {...field}
                          placeholder="Teléfono tutor"
                          className={styles.input}
                        />
                        {fieldState.error && (
                          <small className={styles.error}>
                            {fieldState.error.message}
                          </small>
                        )}
                      </>
                    )}
                  />
                  <Controller
                    name="guardianRelationship"
                    control={methods.control}
                    render={({ field }) => (
                      <input
                        {...field}
                        placeholder="Parentesco (padre/madre/etc.)"
                        className={styles.input}
                      />
                    )}
                  />
                </>
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
                onClick={async () => {
                  // validamos los campos de este panel
                  const campos = ["first_name", "last_name", "email", "phone"];
                  if (isMinor) {
                    campos.push(
                      "guardianFirstName",
                      "guardianLastName",
                      "guardianDni",
                      "guardianPhone"
                    );
                  }
                  const ok = await trigger(campos);
                  if (ok) stepperRef.current.nextCallback();
                }}
              />
            </div>
          </StepperPanel>

          {/* === Panel 4: Confirmar y enviar === */}
          <StepperPanel header="4. Confirmar y enviar">{/* … */}</StepperPanel>
        </Stepper>
      </div>
    </FormProvider>
  );
}
