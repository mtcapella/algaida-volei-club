"use client";

import React, { useRef } from "react";
import { useForm, FormProvider, Controller, get } from "react-hook-form";
import { Stepper } from "primereact/stepper";
import { StepperPanel } from "primereact/stepperpanel";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { RadioButton } from "primereact/radiobutton";

import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import styles from "./inscription.module.css";
import generateLOPD from "@/libs/lopdPdf";
import generateImageUse from "@/libs/imagePdf";
import { uploadFile } from "@/libs/upload";

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
      // opciones de pago
      participateLottery: false,
      splitPayment: false,
    },
    shouldUnregister: false, // para que no se borren los valores de los campos al cambiar de panel
  });

  const {
    trigger,
    watch,
    getValues,
    setError,
    clearErrors,
    formState: { errors },
  } = methods;

  // cálculo de edad y detección de menor
  const birthDate = watch("birthDate");
  const age = birthDate
    ? Math.floor(
        (new Date() - new Date(birthDate).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000)
      )
    : null;
  const isMinor = age !== null && age < 18;

  // funcion de navigeacion entre paneles

  const onNext = async (fields = []) => {
    const valid = fields.length ? await trigger(fields) : true;
    if (valid) stepperRef.current.nextCallback();
  };

  const onFinalSubmit = async (data) => {
    // 1) Validar todos los campos requeridos
    const campos = [
      "birthDate",
      "dni",
      "dniFile",
      "first_name",
      "last_name",
      "email",
      "phone",
      ...(isMinor
        ? [
            "guardianFirstName",
            "guardianLastName",
            "guardianDni",
            "guardianPhone",
            "guardianEmail",
            "guardianRelationship",
          ]
        : []),
      "acceptLOPD",
      "acceptEthics",
      "consentWeb",
      "consentInstagram",
      "consentOthers",
    ];

    const valid = await trigger(campos);
    if (!valid) {
      // llevar al panel 4 si falla
      stepperRef.current.goToStep(3);
      return;
    }

    console.log("¡Formulario correcto!", data);

    // 2) Generar los PDFs
    const lopdFile = await generateLOPD(data);
    const imageFile = await generateImageUse(data);

    // 3) Subir los tres archivos en paralelo
    const [lopdUrl, imageUrl, dniUrl] = await Promise.all([
      uploadFile(lopdFile, "lopd"),
      uploadFile(imageFile, "images"),
      uploadFile(data.dniFile, "dni"),
    ]);

    // 4) Calcular cuotas
    const participateLottery = watch("participateLottery");
    const splitPayment = watch("splitPayment");
    const priceBase = 400;
    const lotteryDiscount = 20;
    const totalSingle = participateLottery
      ? priceBase - lotteryDiscount
      : priceBase;
    const firstSplit = participateLottery ? 250 - lotteryDiscount : 250;

    // 5) Definir el amount a pagar ahora
    const amount = splitPayment ? firstSplit : totalSingle;

    // 6) Montar el payload
    const payload = {
      ...data,
      lopdUrl,
      imageUrl,
      dniUrl,
      // datos de pago
      amount,
      totalFee: totalSingle,
      splitPayment,
      participateLottery,
    };
    console.log("Payload a enviar:", payload);

    // 7) Enviar al endpoint
    const resp = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      const err = await resp.json();
      console.error("Error inscripción:", err);
      alert("Hubo un problema al inscribir. Comprueba la consola.");
      return;
    }

    // 8) Éxito
    alert(
      "Inscripción realizada correctamente. Recibirás un email con la confirmación y el enlace de pago."
    );
  };
  // claculos para el resumen de la inscripción y el pago

  const priceBase = 400;
  const lotteryDiscount = 20;
  const participateLottery = watch("participateLottery");
  const splitPayment = watch("splitPayment");
  const hasDebt = watch("hasDebt");
  const pendingAmount = watch("pendingAmount");

  // se calcula el total a pagar en función de si participa en la lotería
  const totalSingle = participateLottery
    ? priceBase - lotteryDiscount
    : priceBase;

  const firstSplit = participateLottery ? 250 - lotteryDiscount : 250;

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onFinalSubmit)}>
        <div className={styles.inscriptionCard}>
          <Stepper
            ref={stepperRef}
            orientation="vertical"
            readOnly
            linear
            className={styles.stepperContainer}
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
                  type="button"
                  label="Siguiente"
                  icon="pi pi-arrow-right"
                  onClick={() => onNext(["birthDate"])}
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
                  type="button"
                  label="Atrás"
                  severity="secondary"
                  icon="pi pi-arrow-left"
                  onClick={() => stepperRef.current.prevCallback()}
                />
                <Button
                  type="button"
                  label="Siguiente"
                  icon="pi pi-arrow-right"
                  onClick={async () => {
                    // 1) validamos formato
                    const ok = await trigger(["dni", "dniFile"]);
                    if (!ok) return;

                    const val = getValues("dni").toUpperCase();
                    try {
                      const res = await fetch(`/api/check-user/${val}`);
                      const data = await res.json();

                      if (data.exists && data.registered) {
                        setError("api", {
                          type: "manual",
                          message:
                            "Ya estás inscrito/a en la temporada activa.",
                        });
                        return;
                      }
                      // si existe pero no está inscrito, o no existe:
                      clearErrors("api");
                      // aquí pasamos el array para que onNext valide dni y dniFile antes de avanzar
                      onNext(["dni", "dniFile"]);
                    } catch {
                      setError("api", {
                        type: "manual",
                        message: "Error al comprobar el DNI. Intenta de nuevo.",
                      });
                    }
                  }}
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
                        isMinor
                          ? { required: "Debes indicar el parentesco" }
                          : {}
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
                  type="button"
                  label="Atrás"
                  severity="secondary"
                  icon="pi pi-arrow-left"
                  onClick={() => stepperRef.current.prevCallback()}
                />
                <Button
                  type="button"
                  label="Siguiente"
                  icon="pi pi-arrow-right"
                  onClick={() =>
                    onNext(
                      isMinor
                        ? [
                            "first_name",
                            "last_name",
                            "email",
                            "phone",
                            "guardianFirstName",
                            "guardianLastName",
                            "guardianDni",
                            "guardianPhone",
                            "guardianEmail",
                            "guardianRelationship",
                          ]
                        : ["first_name", "last_name", "email", "phone"]
                    )
                  }
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
                  render={({ field, fieldState }) => (
                    <div className={styles.checkbox}>
                      <input
                        type="checkbox"
                        id="acceptLOPD"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                      <label htmlFor="acceptLOPD">
                        He leído y acepto la&nbsp;
                        <a
                          href="/lopd"
                          className={styles.link}
                          target="_blank"
                          rel="noreferrer"
                        >
                          política de protección de datos (LOPD)
                        </a>
                      </label>
                      {fieldState.error && (
                        <small className={styles.error}>
                          {fieldState.error.message}
                        </small>
                      )}
                    </div>
                  )}
                />

                {/* Código ético */}
                <Controller
                  name="acceptEthics"
                  control={methods.control}
                  rules={{ required: "Debes aceptar el Código Ético" }}
                  render={({ field, fieldState }) => (
                    <div className={styles.checkbox}>
                      <input
                        type="checkbox"
                        id="acceptEthics"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                      <label htmlFor="acceptEthics">
                        He leído y acepto el&nbsp;
                        <a
                          href="/codigo-etico"
                          className={styles.link}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Código Ético
                        </a>
                      </label>
                      {fieldState.error && (
                        <small className={styles.error}>
                          {fieldState.error.message}
                        </small>
                      )}
                    </div>
                  )}
                />

                {/* Consentimientos de imagen */}
                <fieldset className={styles.fieldset}>
                  <legend>
                    Autorización para&nbsp;
                    <a
                      href="/uso-imagenes"
                      className={styles.link}
                      target="_blank"
                      rel="noreferrer"
                    >
                      uso de imagen&nbsp;
                    </a>
                    del/de la jugador/a en canales oficiales del club
                  </legend>

                  {[
                    {
                      name: "consentWeb",
                      label: "¿Autoriza publicación en la página web?",
                    },
                    {
                      name: "consentInstagram",
                      label: "¿Autoriza publicación en Facebook e Instagram?",
                    },
                    {
                      name: "consentOthers",
                      label: "¿Autoriza uso en otras redes sociales oficiales?",
                    },
                  ].map(({ name, label }) => (
                    <Controller
                      key={name}
                      name={name}
                      control={methods.control}
                      rules={{ required: `Debes responder sobre "${label}"` }}
                      render={({ field, fieldState }) => (
                        <div className={styles.radioGroup}>
                          <label>{label}</label>
                          <div>
                            <RadioButton
                              inputId={`${name}Yes`}
                              name={field.name}
                              value="yes"
                              checked={field.value === "yes"}
                              onChange={(e) => field.onChange(e.value)}
                            />
                            <label htmlFor={`${name}Yes`}>Sí</label>

                            <RadioButton
                              inputId={`${name}No`}
                              name={field.name}
                              value="no"
                              checked={field.value === "no"}
                              onChange={(e) => field.onChange(e.value)}
                            />
                            <label htmlFor={`${name}No`}>No</label>
                          </div>
                          {fieldState.error && (
                            <small className={styles.error}>
                              {fieldState.error.message}
                            </small>
                          )}
                        </div>
                      )}
                    />
                  ))}
                </fieldset>
              </div>

              <div className={styles.panelNav}>
                <Button
                  type="button"
                  label="Atrás"
                  severity="secondary"
                  icon="pi pi-arrow-left"
                  onClick={() => stepperRef.current.prevCallback()}
                />
                <Button
                  type="button"
                  label="Siguiente"
                  icon="pi pi-arrow-right"
                  onClick={() =>
                    onNext([
                      "acceptLOPD",
                      "acceptEthics",
                      "consentWeb",
                      "consentInstagram",
                      "consentOthers",
                    ])
                  }
                />
              </div>
            </StepperPanel>
            {/* === Panel 5: Resumen y pago === */}
            <StepperPanel header="5. Resumen y pago">
              <div className={styles.panelContent}>
                <h4>Resumen de tu inscripción</h4>
                <p>
                  <strong>Nombre:</strong> {getValues("first_name")}{" "}
                  {getValues("last_name")}
                </p>
                <p>
                  <strong>Importe total:</strong>{" "}
                  {!splitPayment
                    ? `${totalSingle} € en un único pago`
                    : `Primer pago: ${firstSplit} €, resto ${
                        priceBase - 250
                      } € fuera de esta plataforma`}
                </p>

                {/* Lotería */}
                <div className={styles.checkbox}>
                  <Controller
                    name="participateLottery"
                    control={methods.control}
                    render={({ field }) => (
                      <input
                        type="checkbox"
                        id="participateLottery"
                        {...field}
                        checked={field.value}
                      />
                    )}
                  />
                  <label htmlFor="participateLottery">
                    Participar en la lotería (– {lotteryDiscount} €)
                  </label>
                </div>

                {/* Fraccionar */}
                <div className={styles.checkbox}>
                  <Controller
                    name="splitPayment"
                    control={methods.control}
                    render={({ field }) => (
                      <input
                        type="checkbox"
                        id="splitPayment"
                        {...field}
                        checked={field.value}
                      />
                    )}
                  />
                  <label htmlFor="splitPayment">
                    Fraccionar pago (250 € ahora)
                  </label>
                </div>

                {/* Bloqueo por deuda */}
                {hasDebt && (
                  <div className={styles.error}>
                    Tienes una deuda pendiente de {pendingAmount} €. <br />
                    Ponte en contacto con el club.
                  </div>
                )}
              </div>

              <div className={styles.panelNav}>
                <Button
                  type="button"
                  label="Atrás"
                  severity="secondary"
                  icon="pi pi-arrow-left"
                  onClick={() => stepperRef.current.prevCallback()}
                />

                <Button
                  label="Pagar"
                  icon="pi pi-credit-card"
                  type="submit"
                  disabled={hasDebt}
                />
              </div>
            </StepperPanel>
          </Stepper>
        </div>
      </form>
    </FormProvider>
  );
}
