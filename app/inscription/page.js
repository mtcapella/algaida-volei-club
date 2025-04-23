"use client";

import React, { useRef } from "react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { Stepper } from "primereact/stepper";
import { StepperPanel } from "primereact/stepperpanel";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { RadioButton } from "primereact/radiobutton";

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
      // campos del formulario
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
      // campos de tutor legal
      guardianFirstName: "",
      guardianLastName: "",
      guardianDni: "",
      guardianPhone: "",
      guardianEmail: "",
      guardianRelationship: "",
      // variables de consentimiento
      acceptLOPD: false,
      acceptEthics: false,
      consentWeb: null,
      consentInstagram: null,
      consentOthers: null,
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
    try {
      // validamos DNI y foto localmente
      const valid = await trigger(["dni", "dniFile"]);
      if (!valid) return;

      const dniVal = getValues("dni").toUpperCase();
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

  // Paso 3 → Datos personales
  const onNextFromPersonal = async () => {
    const fields = ["first_name", "last_name", "email", "phone"];
    if (isMinor) {
      fields.push(
        "guardianFirstName",
        "guardianLastName",
        "guardianDni",
        "guardianPhone",
        "guardianEmail"
      );
    }
    if (await trigger(fields)) stepperRef.current.nextCallback();
  };

  // Paso 4 → Confirmaciones legales
  const onNextFromLegal = async () => {
    const fields = [
      "acceptLOPD",
      "acceptEthics",
      "consentWeb",
      "consentInstagram",
      "consentOthers",
    ];
    if (await trigger(fields)) stepperRef.current.nextCallback();
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
                    rules={
                      isMinor
                        ? {
                            required: "El email del tutor es obligatorio",
                            pattern: {
                              value: /^\S+@\S+\.\S+$/,
                              message: "Email inválido",
                            },
                          }
                        : {}
                    }
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
                    rules={
                      isMinor ? { required: "Debes indicar el parentesco" } : {}
                    }
                    render={({ field, fieldState }) => (
                      <>
                        <select {...field} className={styles.input}>
                          <option value="">Selecciona parentesco</option>
                          <option value="padre">Padre</option>
                          <option value="madre">Madre</option>
                          <option value="tutor">Tutor</option>
                        </select>
                        {fieldState.error && (
                          <small className={styles.error}>
                            {fieldState.error.message}
                          </small>
                        )}
                      </>
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
                onClick={onNextFromPersonal}
              />
            </div>
          </StepperPanel>

          {/* === Panel 4: Confirmaciones legales === */}
          <StepperPanel header="4. Confirmaciones legales">
            <div className={styles.panelContent}>
              {/* LOPD */}
              <Controller
                name="acceptLOPD"
                control={methods.control}
                rules={{ required: "Debes aceptar la LOPD" }}
                render={({ field }) => (
                  <div className={styles.checkbox}>
                    <input
                      type="checkbox"
                      id="acceptLOPD"
                      {...field}
                      checked={field.value}
                    />
                    <label htmlFor="acceptLOPD">
                      He leído y acepto la&nbsp;
                      <a href="/lopd" target="_blank">
                        política de protección de datos (LOPD)
                      </a>
                    </label>
                  </div>
                )}
              />
              {errors.acceptLOPD && (
                <small className={styles.error}>
                  {errors.acceptLOPD.message}
                </small>
              )}

              {/* Código ético */}
              <Controller
                name="acceptEthics"
                control={methods.control}
                rules={{ required: "Debes aceptar el Código Ético" }}
                render={({ field }) => (
                  <div className={styles.checkbox}>
                    <input
                      type="checkbox"
                      id="acceptEthics"
                      {...field}
                      checked={field.value}
                    />
                    <label htmlFor="acceptEthics">
                      He leído y acepto el&nbsp;
                      <a href="/codigo-etico" target="_blank">
                        Código Ético y buenas prácticas
                      </a>
                    </label>
                  </div>
                )}
              />
              {errors.acceptEthics && (
                <small className={styles.error}>
                  {errors.acceptEthics.message}
                </small>
              )}

              {/* Consentimientos de imagen */}
              <fieldset className={styles.fieldset}>
                <legend>
                  Autorización para uso de imagen del/de la jugador/a en canales
                  oficiales del club
                </legend>

                <Controller
                  name="consentWeb"
                  control={methods.control}
                  rules={{ required: "Debes responder sobre la web" }}
                  render={({ field }) => (
                    <div className={styles.radioGroup}>
                      <label>¿Autoriza publicación en la página web?</label>
                      <div>
                        <RadioButton
                          inputId="webYes"
                          value="yes"
                          {...field}
                          onChange={(e) => field.onChange(e.value)}
                          checked={field.value === "yes"}
                        />
                        <label htmlFor="webYes">Sí</label>
                        <RadioButton
                          inputId="webNo"
                          value="no"
                          {...field}
                          onChange={(e) => field.onChange(e.value)}
                          checked={field.value === "no"}
                        />
                        <label htmlFor="webNo">No</label>
                      </div>
                    </div>
                  )}
                />
                {errors.consentWeb && (
                  <small className={styles.error}>
                    {errors.consentWeb.message}
                  </small>
                )}

                <Controller
                  name="consentInstagram"
                  control={methods.control}
                  rules={{ required: "Debes responder sobre Instagram" }}
                  render={({ field }) => (
                    <div className={styles.radioGroup}>
                      <label>
                        ¿Autoriza publicación en Facebook e Instagram?
                      </label>
                      <div>
                        <RadioButton
                          inputId="instaYes"
                          value="yes"
                          {...field}
                          onChange={(e) => field.onChange(e.value)}
                          checked={field.value === "yes"}
                        />
                        <label htmlFor="instaYes">Sí</label>
                        <RadioButton
                          inputId="instaNo"
                          value="no"
                          {...field}
                          onChange={(e) => field.onChange(e.value)}
                          checked={field.value === "no"}
                        />
                        <label htmlFor="instaNo">No</label>
                      </div>
                    </div>
                  )}
                />
                {errors.consentInstagram && (
                  <small className={styles.error}>
                    {errors.consentInstagram.message}
                  </small>
                )}

                <Controller
                  name="consentOthers"
                  control={methods.control}
                  rules={{ required: "Debes responder sobre otras redes" }}
                  render={({ field }) => (
                    <div className={styles.radioGroup}>
                      <label>
                        ¿Autoriza uso en otras redes sociales oficiales?
                      </label>
                      <div>
                        <RadioButton
                          inputId="otherYes"
                          value="yes"
                          {...field}
                          onChange={(e) => field.onChange(e.value)}
                          checked={field.value === "yes"}
                        />
                        <label htmlFor="otherYes">Sí</label>
                        <RadioButton
                          inputId="otherNo"
                          value="no"
                          {...field}
                          onChange={(e) => field.onChange(e.value)}
                          checked={field.value === "no"}
                        />
                        <label htmlFor="otherNo">No</label>
                      </div>
                    </div>
                  )}
                />
                {errors.consentOthers && (
                  <small className={styles.error}>
                    {errors.consentOthers.message}
                  </small>
                )}
              </fieldset>
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
                onClick={onNextFromLegal}
              />
            </div>
          </StepperPanel>
        </Stepper>
      </div>
    </FormProvider>
  );
}
