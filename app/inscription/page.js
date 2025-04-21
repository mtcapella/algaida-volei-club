"use client";

import React, { useRef } from "react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { Stepper } from "primereact/stepper";
import { StepperPanel } from "primereact/stepperpanel";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { FileUpload } from "primereact/fileupload";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import styles from "./inscription.module.css";

export default function InscriptionPage() {
  const stepperRef = useRef(null);

  // 1️⃣ Creamos el hook-form
  const methods = useForm({
    mode: "onTouched", // validación al tocar
    defaultValues: {
      birthDate: null,
      dni: "",
      player: null, // guardaremos el objeto jugador si existe
      registration: null, // guardaremos la info de registration si ha estado de alta en temporadas anteriores
    },
  });
  const {
    handleSubmit,
    trigger,
    formState: { errors },
  } = methods;

  // 2️⃣ Sólo avanzamos si la fecha es válida
  const onNextFromBirth = async () => {
    const valid = await trigger("birthDate");
    if (valid) {
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
                  validate: (value) =>
                    value <= new Date() || "No puede ser una fecha futura",
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
                onClick={async () => {
                  const valid = await methods.trigger("birthDate");
                  if (valid) stepperRef.current.nextCallback();
                }}
              />
            </div>
          </StepperPanel>

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
                  // 1️⃣ Validamos formato DNI
                  const valid = await methods.trigger("dni");
                  if (!valid) return;

                  const dniVal = methods.getValues("dni").toUpperCase();

                  try {
                    // 2️⃣ Llamamos a la API
                    const res = await fetch(`/api/check-user/${dniVal}`);
                    const data = await res.json();

                    if (!data.exists) {
                      // jugador nuevo
                      methods.setValue("player", null);
                      methods.setValue("registration", null);
                    } else {
                      // existe en tabla players
                      methods.setValue("player", data.player);
                      if (data.registered) {
                        // ya inscrito esta temporada ⇒ bloqueo
                        methods.setError("api", {
                          type: "manual",
                          message: "Ya está inscrito/a en la temporada activa.",
                        });
                        return;
                      } else {
                        // existe pero no inscrito ⇒ guardamos registration (nulo) y seguimos
                        methods.setValue("registration", null);
                      }
                    }

                    // limpiamos error previo y avanzamos
                    methods.clearErrors("api");
                    stepperRef.current.nextCallback();
                  } catch (err) {
                    methods.setError("api", {
                      type: "manual",
                      message: "Error al comprobar el DNI. Intenta de nuevo.",
                    });
                  }
                }}
              />
            </div>
          </StepperPanel>
        </Stepper>
      </div>
    </FormProvider>
  );
}
