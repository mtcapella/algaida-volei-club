"use client";

import React, { useRef } from "react";
import { useForm, FormProvider, Controller, set } from "react-hook-form";
import { Stepper } from "primereact/stepper";
import { StepperPanel } from "primereact/stepperpanel";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { RadioButton } from "primereact/radiobutton";
import { Toast } from "primereact/toast";
import { Dropdown } from "primereact/dropdown";

import { Checkbox } from "primereact/checkbox";

import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import styles from "./inscription.module.css";
import generateLOPD from "@/libs/lopdPdf";
import generateImageUse from "@/libs/imagePdf";
import { uploadFile } from "@/libs/upload";
import { InputText } from "primereact/inputtext";

import i18n from "../i18nextInit.js";
import { useTranslation } from "react-i18next";

import Tesseract from "tesseract.js";
import { verifyOCR } from "@/libs/verifyOCR";

export default function InscriptionPage() {
  const { t } = useTranslation();
  const stepperRef = useRef(null);
  const toast = useRef(null);

  // Estados para los botones de carga
  const [checking, setChecking] = React.useState(false);
  const [paying, setPaying] = React.useState(false);

  /*───────────────────────────────────────────────────────────────*/
  /*  Form state                                                   */
  /*───────────────────────────────────────────────────────────────*/

  const methods = useForm({
    mode: "onTouched",
    defaultValues: {
      birthDate: null,
      dni: "",
      dniFile: null,
      photoFile: null,
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
      // tutor legal
      guardianFirstName: "",
      guardianLastName: "",
      guardianDni: "",
      guardianPhone: "",
      guardianEmail: "",
      guardianRelationship: "",
      // consentimientos
      acceptLOPD: false,
      acceptEthics: false,
      consentWeb: null,
      consentInstagram: null,
      consentOthers: null,
      // pago
      participateLottery: false,
      splitPayment: false,
    },
    shouldUnregister: false,
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

  /*───────────────────────────────────────────────────────────────*/
  /*  Utilidades                                                   */
  /*───────────────────────────────────────────────────────────────*/

  const birthDate = watch("birthDate");
  const age = birthDate
    ? Math.floor(
        (new Date() - new Date(birthDate).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000)
      )
    : null;
  const isMinor = age !== null && age < 18;

  const onNext = async (fields = []) => {
    const valid = fields.length ? await trigger(fields) : true;
    if (valid) stepperRef.current.nextCallback();
  };

  /*───────────────────────────────────────────────────────────────*/
  /*  Envío final                                                  */
  /*───────────────────────────────────────────────────────────────*/

  const onFinalSubmit = async (data) => {
    if (data.hasDebt) {
      toast.current.show({
        severity: "error",
        summary: "Deuda pendiente",
        detail: "No puedes inscribirte hasta saldar la deuda.",
        life: 5000,
      });
      return;
    }
    try {
      setPaying(true);
      const campos = [
        "birthDate",
        "dni",
        "dniFile",
        "photoFile",
        "first_name",
        "last_name",
        "email",
        "phone",
        "playerId",
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
        stepperRef.current.goToStep(3);
        return;
      }

      /*───────────────────────────*/
      /*  Generar PDFs y subir ficheros  */
      /*───────────────────────────*/

      const lopdFile = await generateLOPD(data);
      const imageFile = await generateImageUse(data);

      const [lopdUrl, imageUrl, dniUrl, photoUrl] = await Promise.all([
        uploadFile(lopdFile, "lopd"),
        uploadFile(imageFile, "images"),
        uploadFile(data.dniFile, "dni"),
        uploadFile(data.photoFile, "photos"), // 📷 nueva subida
      ]);

      const participateLottery = watch("participateLottery");
      const splitPayment = watch("splitPayment");
      const priceBase = 400;
      const lotteryDiscount = 20;
      const totalSingle = participateLottery
        ? priceBase - lotteryDiscount
        : priceBase;
      const firstSplit = participateLottery ? 250 - lotteryDiscount : 250;
      const amount = splitPayment ? firstSplit : totalSingle;

      // Payload para el registro del usuario

      const payload = {
        ...data,
        lopdUrl,
        imageUrl,
        dniUrl,
        photoUrl, // 📷 nueva URL
        amount,
        totalFee: totalSingle,
        splitPayment,
        participateLottery,
      };

      const resp = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const err = await resp.json();
        console.error(err);
        alert("Hubo un error al inscribir. Revisa la consola.");
        return;
      }

      const { playerId } = await resp.json(); // ID del jugador para Stripe

      // ➜ Ahora generamos la sesión de pago con Stripe
      const fullName = `${data.first_name} ${data.last_name}`;

      const stripeRes = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName,
          email: data.email,
          dni: data.dni,
          amount: amount * 100, // en céntimos
          playerId,
        }),
      });

      const stripeData = await stripeRes.json();

      if (!stripeRes.ok || !stripeData.url) {
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: "No se pudo redirigir a Stripe",
          life: 5000,
        });
        setPaying(false); // detenemos el spinner
        return;
      }

      // Redirigir a Stripe

      window.location.href = stripeData.url; // redirección: no hace falta reset
    } catch (err) {
      console.error(err);
      toast.current.show({ severity: "error", summary: "Error en el pago" });
      setPaying(false);
    }
  };

  /*───────────────────────────────────────────────────────────────*/
  /*  Resumen de totales                                            */
  /*───────────────────────────────────────────────────────────────*/

  const priceBase = 400;
  const lotteryDiscount = 20;
  const participateLottery = watch("participateLottery");
  const splitPayment = watch("splitPayment");
  const hasDebt = watch("hasDebt");
  const pendingAmount = watch("pendingAmount");

  const totalSingle = participateLottery
    ? priceBase - lotteryDiscount
    : priceBase;
  const firstSplit = participateLottery ? 250 - lotteryDiscount : 250;

  /*───────────────────────────────────────────────────────────────*/
  /*  Render                                                        */
  /*───────────────────────────────────────────────────────────────*/

  return (
    <FormProvider {...methods}>
      <Toast ref={toast} />
      <form
        onSubmit={methods.handleSubmit(onFinalSubmit)}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.preventDefault();
        }}
      >
        <div className={styles.inscriptionCard}>
          <Stepper
            ref={stepperRef}
            orientation="vertical"
            readOnly
            linear
            className={styles.stepperContainer}
          >
            {/* ────────────────── Paso 1 */}
            <StepperPanel header={`1. ${t("inscription.form.birthDate")}`}>
              <div className={styles.panelContent}>
                <label htmlFor="birthDate">
                  {t("inscription.form.birthDate")}*
                </label>
                <Controller
                  name="birthDate"
                  control={methods.control}
                  rules={{
                    required: t("inscription.form.birthDateError"),
                    validate: (v) =>
                      v <= new Date() || t("inscription.form.futureDateError"),
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
                  label={t("buttons.next")}
                  icon="pi pi-arrow-right"
                  onClick={() => onNext(["birthDate"])}
                />
              </div>
            </StepperPanel>

            {/* ────────────────── Paso 2 */}
            <StepperPanel header={`2. ${t("inscription.form.dni")}`}>
              <div className={styles.panelContent}>
                <label htmlFor="dni">{t("inscription.form.dni")}*</label>
                <Controller
                  name="dni"
                  control={methods.control}
                  rules={{
                    required: t("inscription.form.dniError"),
                    pattern: {
                      value: /^[XYZ]?\d{7,8}[A-Z]$/,
                      message: t("inscription.form.dniInvalid"),
                    },
                  }}
                  render={({ field, fieldState }) => (
                    <>
                      <InputText
                        id="dni"
                        type="text"
                        {...field}
                        className={styles.input}
                        placeholder={t("inscription.form.dniPlaceholder")}
                      />
                      {fieldState.error && (
                        <small className={styles.error}>
                          {fieldState.error.message}
                        </small>
                      )}
                    </>
                  )}
                />

                {/* Foto DNI */}
                <label htmlFor="dniFile">
                  {t("inscription.form.dniImage")}*
                </label>
                <Controller
                  name="dniFile"
                  control={methods.control}
                  rules={{
                    required: t("inscription.form.dniImageError"),
                    validate: {
                      isImage: (file) =>
                        file?.type.startsWith("image/") ||
                        t("inscription.form.dniImageInvalid"),
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

                {/* Subir foto del jugador */}

                <label htmlFor="photoFile">
                  {t("inscription.form.playerImage")}*
                </label>
                <Controller
                  name="photoFile"
                  control={methods.control}
                  rules={{
                    required: t("inscription.form.playerImageError"),
                    validate: {
                      isImage: (file) =>
                        file?.type.startsWith("image/") ||
                        t("inscription.form.playerImageInvalid"),
                      maxSize: (file) =>
                        file?.size <= 2 * 1024 * 1024 ||
                        t("inscription.form.playerImageSize"),
                    },
                  }}
                  render={({ field, fieldState }) => (
                    <>
                      <input
                        id="photoFile"
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
                  label={t("buttons.back")}
                  severity="secondary"
                  icon="pi pi-arrow-left"
                  onClick={() => stepperRef.current.prevCallback()}
                />

                <Button
                  type="button"
                  label={t("buttons.next")}
                  icon="pi pi-arrow-right"
                  loading={checking} /* ← muestra spinner dentro del botón */
                  disabled={checking}
                  onClick={async () => {
                    const dniVal = getValues("dni").toUpperCase();
                    const file = getValues("dniFile");
                    setChecking(true);

                    try {
                      // Verificamos primero si hay deudas o el jugador ya está registrado
                      const res = await fetch(`/api/check-user/${dniVal}`);
                      const data = await res.json();

                      // Comprobamos si el jugador tiene deudas pendientes
                      if (data.exists && data.hasDebt) {
                        setValue("hasDebt", true);
                        setError("api", {
                          type: "manual",
                          message: t("inscription.form.playerHasDebt"),
                        });
                        toast.current.show({
                          severity: "error",
                          summary: t("inscription.form.playerHasDebt"),
                          detail: t("inscription.form.playerNeedSolveDebt"),
                        });
                        return;
                      }

                      // Comprobamos si el jugador ya está inscrito en la temporada
                      if (data.exists && data.registered) {
                        setError("api", {
                          type: "manual",
                          message: t("inscription.form.playerExistSeason"),
                        });
                        return;
                      }

                      // Verificamos el OCR solo si hay una imagen
                      if (file) {
                        toast.current.show({
                          severity: "info",
                          summary: "Verificando DNI...",
                          detail: t("inscription.form.OCRwaiting"),
                        });

                        // Llamamos al helper de OCR
                        const detectedDNI = await verifyOCR(file);
                        console.log("DNI detectado por OCR:", detectedDNI);

                        if (!detectedDNI) {
                          toast.current.show({
                            severity: "error",
                            summary: "Error OCR",
                            detail: t("inscription.form.OCRwaiting"),
                          });
                          return;
                        }

                        if (!detectedDNI.includes(dniVal)) {
                          toast.current.show({
                            severity: "error",
                            summary: "Error OCR",
                            detail: t("inscription.form.OCRNoMatch"),
                          });
                          return;
                        }
                      }

                      // Si todo está bien, pasamos al siguiente paso
                      clearErrors("api");
                      setValue("hasDebt", false);
                      if (data.exists) {
                        setValue("first_name", data.player.first_name);
                        setValue("last_name", data.player.last_name);
                        setValue("playerId", data.player.playerId);
                        setValue("exists", true);
                      }

                      // Valida campos del paso y avanza
                      const ok = await trigger(["dni", "dniFile", "photoFile"]);
                      if (ok) onNext(["dni", "dniFile", "photoFile"]);
                    } catch (err) {
                      console.error(err);
                      toast.current.show({
                        severity: "error",
                        summary: "Error",
                        detail: "Hubo un problema al verificar el DNI.",
                      });
                    } finally {
                      setChecking(false); // se restablece el estado
                    }
                  }}
                />
              </div>
            </StepperPanel>

            {/* === Panel 3: Datos personales === */}
            <StepperPanel header={`3. ${t("inscription.form.personalData")}`}>
              <div className={styles.panelContent}>
                {/* Nombre/apellidos (readonly si ya vienen seteados) */}
                <Controller
                  name="first_name"
                  control={methods.control}
                  rules={{ required: t("inscription.form.nameError") }}
                  render={({ field, fieldState }) => (
                    <>
                      <InputText
                        {...field}
                        placeholder={t("inscription.form.name")}
                        className={styles.input}
                        readOnly={getValues("exists")}
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
                  name="last_name"
                  control={methods.control}
                  rules={{ required: t("inscription.form.surnameError") }}
                  render={({ field, fieldState }) => (
                    <>
                      <InputText
                        {...field}
                        placeholder="Apellidos"
                        className={styles.input}
                        readOnly={getValues("exists")}
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
                  name="email"
                  control={methods.control}
                  rules={{
                    required: t("inscription.form.emailError"),
                    pattern: {
                      value: /^\S+@\S+\.\S+$/,
                      message: t("inscription.form.emailInvalid"),
                    },
                  }}
                  render={({ field, fieldState }) => (
                    <>
                      <InputText
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
                    required: t("inscription.form.phoneError"),
                    pattern: {
                      value: /^(?:(?:\+|00)34)?[6789]\d{8}$/,
                      message: t("inscription.form.phoneInvalid"),
                    },
                  }}
                  render={({ field, fieldState }) => (
                    <>
                      <InputText
                        {...field}
                        placeholder={t("inscription.form.phone")}
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
                    <h4>{t("inscription.form.legalGuardianData")}</h4>
                    <Controller
                      name="guardianFirstName"
                      control={methods.control}
                      rules={{
                        required: t("inscription.form.legalGuardianNameError"),
                      }}
                      render={({ field, fieldState }) => (
                        <>
                          <InputText
                            {...field}
                            placeholder={t(
                              "inscription.form.legalGuardianName"
                            )}
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
                      rules={{
                        required: t(
                          "inscription.form.legalGuardianSurnameError"
                        ),
                      }}
                      render={({ field, fieldState }) => (
                        <>
                          <InputText
                            {...field}
                            placeholder={t(
                              "inscription.form.legalGuardianSurname"
                            )}
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
                        required: t("inscription.form.legalGuardianDniError"),
                        pattern: {
                          value: /^[XYZ]?\d{7,8}[A-Z]$/,
                          message: t(
                            "inscription.form.legalGuardianDniInvalid"
                          ),
                        },
                      }}
                      render={({ field, fieldState }) => (
                        <>
                          <InputText
                            {...field}
                            placeholder={t("inscription.form.legalGuardianDni")}
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
                      rules={{
                        required: t("inscription.form.legalGuardianPhoneError"),
                        pattern: {
                          value: /^(?:(?:\+|00)34)?[6789]\d{8}$/,
                          message: t(
                            "inscription.form.legalGuardianPhoneInvalid"
                          ),
                        },
                      }}
                      render={({ field, fieldState }) => (
                        <>
                          <InputText
                            {...field}
                            placeholder={t(
                              "inscription.form.legalGuardianPhonePlaceholder"
                            )}
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
                              required: t(
                                "inscription.form.legalGuardianEmailError"
                              ),
                              pattern: {
                                value: /^\S+@\S+\.\S+$/,
                                message: t(
                                  "inscription.form.legalGuardianEmailInvalid"
                                ),
                              },
                            }
                          : {}
                      }
                      render={({ field, fieldState }) => (
                        <>
                          <InputText
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
                          ? {
                              required: t(
                                "inscription.form.legalGurdianRelationshipError"
                              ),
                            }
                          : {}
                      }
                      render={({ field, fieldState }) => (
                        <>
                          <Dropdown
                            {...field}
                            value={field.value}
                            onChange={(e) => field.onChange(e.value)}
                            options={[
                              {
                                label: t("inscription.form.father"),
                                value: "padre",
                              },
                              {
                                label: t("inscription.form.mother"),
                                value: "madre",
                              },
                              {
                                label: t("inscription.form.guardian"),
                                value: "tutor",
                              },
                            ]}
                            placeholder={t(
                              "inscription.form.legalGurdianRelationship"
                            )}
                            className={`${styles.dropdown} ${styles.input} ${
                              fieldState.error ? "p-invalid" : ""
                            }`}
                          />
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
                  label={t("buttons.back")}
                  severity="secondary"
                  icon="pi pi-arrow-left"
                  onClick={() => stepperRef.current.prevCallback()}
                />
                <Button
                  type="button"
                  label={t("buttons.next")}
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

            <StepperPanel
              header={`3. ${t("inscription.form.legalConfirmation")}`}
            >
              <div className={styles.panelContent}>
                {/* LOPD */}
                <Controller
                  name="acceptLOPD"
                  control={methods.control}
                  rules={{ required: "Debes aceptar la LOPD" }}
                  render={({ field, fieldState }) => (
                    <div className={styles.checkbox}>
                      <Checkbox
                        id="acceptLOPD"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                      <label className={styles.checkbox} htmlFor="acceptLOPD">
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
                      <Checkbox
                        id="acceptEthics"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                      <label className={styles.checkbox} htmlFor="acceptEthics">
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
                        <div>
                          <label>{label}</label>
                          <div className={styles.radioGroup}>
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
                  label={t("buttons.back")}
                  severity="secondary"
                  icon="pi pi-arrow-left"
                  onClick={() => stepperRef.current.prevCallback()}
                />
                <Button
                  type="button"
                  label={t("buttons.next")}
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
                <div>
                  <Controller
                    name="participateLottery"
                    control={methods.control}
                    render={({ field }) => (
                      <Checkbox
                        id="participateLottery"
                        {...field}
                        checked={field.value}
                      />
                    )}
                  />
                  <label
                    className={styles.checkbox}
                    htmlFor="participateLottery"
                  >
                    Participar en la lotería (– {lotteryDiscount} €)
                  </label>
                </div>

                {/* Fraccionar */}
                <div>
                  <Controller
                    name="splitPayment"
                    control={methods.control}
                    render={({ field }) => (
                      <Checkbox
                        id="splitPayment"
                        {...field}
                        checked={field.value}
                      />
                    )}
                  />
                  <label className={styles.checkbox} htmlFor="splitPayment">
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
                  label={t("buttons.back")}
                  severity="secondary"
                  icon="pi pi-arrow-left"
                  onClick={() => stepperRef.current.prevCallback()}
                />

                <Button
                  label={t("buttons.pay")}
                  icon="pi pi-credit-card"
                  type="submit"
                  disabled={hasDebt}
                  loading={paying}
                />
              </div>
            </StepperPanel>
          </Stepper>
        </div>
      </form>
    </FormProvider>
  );
}
