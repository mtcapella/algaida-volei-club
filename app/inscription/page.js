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

  // Inicializamos react-hook-form con todos los campos
  const methods = useForm({
    mode: "onTouched",
    defaultValues: {
      birthDate: null,
      dni: "",
      dniFile: null,
      exists: false,
      player: null,
      registration: null,
      hasDebt: false,
      pendingAmount: 0,
      playerId: null,
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      guardianFirstName: "",
      guardianLastName: "",
      guardianDni: "",
      guardianPhone: "",
      guardianEmail: "",
      guardianRelationship: "",
    },
  });

  const {
    trigger,
    watch,
    getValues,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = methods;

  // Helper: cálculo de edad y detección de menor
  const birthDate = watch("birthDate");
  const age = birthDate
    ? Math.floor(
        (new Date() - new Date(birthDate).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000)
      )
    : null;
  const isMinor = age !== null && age < 18;

  // Panel 1 → Fecha de nacimiento
  const onNextFromBirth = async () => {
    if (await trigger("birthDate")) stepperRef.current.nextCallback();
  };

  // Panel 2 → DNI / Existencia + foto DNI
  const onNextFromDni = async () => {
    // validamos DNI y foto localmente
    const valid = await trigger(["dni", "dniFile"]);
    if (!valid) return;

    const dniVal = getValues("dni").toUpperCase();
    try {
      const res = await fetch(`/api/check-user/${dniVal}`);
      const data = await res.json();

      // seteamos en el form
      setValue("exists", data.exists);
      setValue("player", data.player ?? null);
      setValue("registration", data.registered ? data.registration : null);
      setValue("hasDebt", data.hasDebt ?? false);
      setValue("pendingAmount", data.pendingAmount ?? 0);
      if (data.exists) {
        setValue("playerId", data.player.playerId);
        setValue("first_name", data.player.first_name);
        setValue("last_name", data.player.last_name);
      }

      // si ya está inscrito en temporada activa → bloqueamos
      if (data.exists && data.registered) {
        setError("api", {
          type: "manual",
          message: "Ya estás inscrito/a en la temporada activa.",
        });
        return;
      }

      clearErrors("api");
      stepperRef.current.nextCallback();
    } catch (err) {
      setError("api", {
        type: "manual",
        message: "Error al comprobar el DNI. Intenta de nuevo.",
      });
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
          {/* === Panel 1: Fecha de nacimiento === */}
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
                onClick={onNextFromBirth}
              />
            </div>
          </StepperPanel>

          {/* === Panel 2: DNI / Existencia y foto DNI === */}
          <StepperPanel header="2. DNI / Existencia">
            <div className={styles.panelContent}>
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

              <label htmlFor="dniFile">Foto del DNI*</label>
              <Controller
                name="dniFile"
                control={methods.control}
                rules={{
                  required: "Debes subir la foto del DNI",
                  validate: {
                    isImage: (file) =>
                      file?.type.startsWith("image/") || "Solo imágenes",
                    maxSize: (file) =>
                      file?.size <= 2 * 1024 * 1024 || "Máx. 2 MB",
                  },
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
                onClick={onNextFromDni}
              />
            </div>
          </StepperPanel>

          {/* === Panel 3: Datos personales === */}
          <StepperPanel header="3. Datos personales">
            <div className={styles.panelContent}>
              {/* Nombre/apellidos (readonly si existe) */}
              <Controller
                name="first_name"
                control={methods.control}
                render={({ field }) => (
                  <input
                    {...field}
                    placeholder="Nombre"
                    className={styles.input}
                    readOnly={getValues("exists")}
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
                    className={styles.input}
                    readOnly={getValues("exists")}
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
                    message: "Email inválido",
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

              {/* Campos de tutor si es menor */}
              {isMinor && (
                <>
                  <h4>Datos del tutor legal</h4>
                  <Controller
                    name="guardianFirstName"
                    control={methods.control}
                    rules={{ required: "Nombre tutor obligatorio" }}
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
                    rules={{ required: "Apellidos tutor obligatorios" }}
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
                      required: "DNI tutor obligatorio",
                      pattern: {
                        value: /^[0-9A-Z]{8,9}$/,
                        message: "DNI inválido",
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
                    rules={{ required: "Teléfono tutor obligatorio" }}
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
                  {/* Email */}
                  <Controller
                    name="guardianEmail"
                    control={methods.control}
                    rules={{
                      required: "El email es obligatorio",
                      pattern: {
                        value: /^\S+@\S+\.\S+$/,
                        message: "Email inválido",
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
                  <Controller
                    name="guardianRelationship"
                    control={methods.control}
                    render={({ field }) => (
                      <input
                        {...field}
                        placeholder="Parentesco"
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
                  // validamos solo los campos de este panel
                  const campos = ["first_name", "last_name", "email", "phone"];
                  if (isMinor) {
                    campos.push(
                      "guardianFirstName",
                      "guardianLastName",
                      "guardianDni",
                      "guardianPhone"
                    );
                  }
                  if (await trigger(campos)) {
                    stepperRef.current.nextCallback();
                  }
                }}
              />
            </div>
          </StepperPanel>

          {/* === Panel 4: Confirmar y enviar === */}
          <StepperPanel header="4. Confirmar y enviar">
            {/* Aquí irá tu lógica de submit final */}
          </StepperPanel>
        </Stepper>
      </div>
    </FormProvider>
  );
}
