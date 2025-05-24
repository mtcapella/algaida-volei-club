"use client";

import React, { useState, useEffect, useRef, useContext } from "react";
import { useForm, Controller } from "react-hook-form";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
import { Toast } from "primereact/toast";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { ProgressSpinner } from "primereact/progressspinner";
import { useTranslation } from "react-i18next";

import { api } from "@/libs/api"; // Importa la configuración de la API

import { ImageTokenContext } from "@/app/components/imageTokenProvider"; // Importa el contexto del token de imagen

import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

import styles from "./jugadores.module.css";
import Image from "next/image";

export default function Players() {
  const { t } = useTranslation();
  // estados y refs
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedPlayers, setSelectedPlayers] = useState(null);
  const [playerToEdit, setPlayerToEdit] = useState(null);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [newDialogVisible, setNewDialogVisible] = useState(false);
  const [checkingDni, setCheckingDni] = useState(false);
  const [dniChecked, setDniChecked] = useState(false);
  const { token, loading } = useContext(ImageTokenContext);

  const dt = useRef(null);
  const toast = useRef(null);

  // react-hook-form datos del formulario de nuevo jugador
  const {
    control,
    register,
    handleSubmit,
    setValue,
    reset,
    getValues,
    setError,
    formState: { errors, isSubmitting },
  } = useForm();

  // use effect para cargar jugadores y equipos al inicio
  useEffect(() => {
    fetchPlayers();
    fetchTeams();
  }, []);

  const fetchPlayers = async () => {
    const res = await api(`/api/players`);
    const data = await res.json();
    console.log(data);
    setPlayers(data);
  };

  const fetchTeams = async () => {
    const res = await api(`/api/teams`);
    const data = await res.json();
    setTeams(data);
  };

  /*helpers */
  const handleDelete = async (playerId, playerName) => {
    try {
      const response = await api(`/api/players/${playerId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        toast.current.show({
          severity: "success",
          summary: t("buttons.playerDeleted"),
          detail: `${t("buttons.thePlayer")} ${playerName} ${t(
            "buttons.hasDeleted"
          )}.`,
          life: 3000,
        });
        setPlayers((prev) => prev.filter((p) => p.playerId !== playerId));
      } else throw new Error();
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: t("players.cantDeletePLayer"),
        life: 3000,
      });
    }
  };

  // helper para crear ulr de firebase en base al token

  const createUrl = (path) => {
    if (!path || !token) return "";
    return `https://firebasestorage.googleapis.com/v0/b/algaida-volei-club.firebasestorage.app/o/${encodeURIComponent(
      path
    )}?alt=media&token=${token}`;
  };
  // Helper para determinar el icono de cada documento
  const docIcon = {
    dni: "pi pi-id-card", // DNI / pasaporte
    usoimagenes: "pi pi-image", // Cesión de uso de imagen
    lopd: "pi pi-shield", // LOPD
  };

  const getIconClass = (type) => docIcon[type] ?? "pi pi-file"; // fallback

  // helper para abrir el dialogo de editar jugador
  // y pre‑rellenar los campos
  const openEditDialog = (player) => {
    setPlayerToEdit({
      playerId: player.playerId,
      firstName: player.firstName,
      lastName: player.lastName,
      teamId: teams.find((t) => t.name === player.team)?.id || null,
      dateOfBirth: player.dateOfBirth ? new Date(player.dateOfBirth) : null,
    });
    setEditDialogVisible(true);
  };

  const handleSaveEdit = async () => {
    try {
      const { playerId, firstName, lastName, teamId, dateOfBirth } =
        playerToEdit;
      const response = await api(`/api/players/${playerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          dateOfBirth: dateOfBirth
            ? dateOfBirth.toISOString().split("T")[0]
            : null,
          teamId,
        }),
      });

      if (response.ok) {
        toast.current.show({
          severity: "success",
          summary: t("players.playerUpdated"),
          detail: t("players.changesSaved"),
          life: 3000,
        });
        setEditDialogVisible(false);
        fetchPlayers();
      } else throw new Error();
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: t("players.playerNotUpdated"),
        life: 3000,
      });
    }
  };

  // helper para comporbar el DNI / NIE
  const handleCheckDni = async () => {
    const dni = getValues("dni")?.toUpperCase().trim();
    if (!dni || checkingDni) return;

    setCheckingDni(true);
    try {
      const base = process.env.NEXT_PUBLIC_DOMAIN;
      const res = await api(`/api/check-user/${dni}`);
      const data = await res.json();

      // reset de errores previos
      setError("dni", {});

      if (data.exists && data.registered) {
        toast.current.show({
          severity: "error",
          summary: t("players.playerRegistered"),
          detail: t("players.playerHasRegistered"),
          life: 3000,
        });
        setError("dni", {
          type: "duplicated",
          message: t("players.playerHasRegistered"),
        });
        setDniChecked(false);
        return;
      }

      if (data.exists && data.hasDebt) {
        toast.current.show({
          severity: "error",
          summary: t("players.playerWithDebt"),
          detail: t("players.playerHasDebt"),
          life: 3000,
        });
        setError("dni", { type: "debt", message: t("players.playerWithDebt") });
        setDniChecked(false);
        return;
      }

      if (data.exists) {
        // pre‑rellenamos y marcamos flag
        setValue("firstName", data.player.first_name);
        setValue("lastName", data.player.last_name);
        setValue("playerId", data.player.playerId);
        setValue("exists", true);
        toast.current.show({
          severity: "info",
          summary: t("players.playerFind"),
          detail: t("players.completeOtherData"),
          life: 3000,
        });
      } else {
        // jugador nuevo
        setValue("exists", false);
        toast.current.show({
          severity: "success",
          summary: t("players.newPlayer"),
          detail: t("players.playerNotFindYouCanCreate"),
          life: 3000,
        });
      }
      setDniChecked(true);
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: t("players.cantCheckPlayer"),
        life: 3000,
      });
      setDniChecked(false);
    } finally {
      setCheckingDni(false);
    }
  };

  /* -------------------------------- submit ------------------------------- */
  const onSubmit = async (data) => {
    // Si aún no validamos el DNI, hazlo
    if (!dniChecked) {
      await handleCheckDni();
      // Si la comprobación falló o generó error abortamos
      if (!dniChecked) return;
    }

    try {
      const response = await api(`/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          first_name: data.firstName.trim(),
          last_name: data.lastName.trim(),
          dni: data.dni.toUpperCase().trim(),
          birthDate: data.dateOfBirth
            ? data.dateOfBirth.toISOString().split("T")[0]
            : null,
          lopdUrl: null,
          imageUrl: null,
          dniUrl: null,
          totalFee: 400,
          amount: 400,
          participateLottery: false,
          splitPayment: false,
          isMinor: false,
          status: "completed",
        }),
      });

      if (response.ok) {
        toast.current.show({
          severity: "success",
          summary: t("players.playerCreated"),
          detail: t("players.playerCreatedCorrectly"),
          life: 3000,
        });
        setNewDialogVisible(false);
        fetchPlayers();
        reset();
        setDniChecked(false);
      } else throw new Error();
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: t("players.cantRegisterPlayer"),
        life: 3000,
      });
    }
  };
  if (loading) {
    return <ProgressSpinner />;
  }
  /* ----------------------------------------------------------------------- */
  return (
    <div className={styles.container}>
      <Toast ref={toast} />

      {/* toolboar de acciones */}
      <Toolbar
        className="p-mb-4"
        left={() => (
          <div className={styles.flexGap2}>
            <Button
              label={t("buttons.update")}
              icon="pi pi-refresh"
              className="p-button-secondary"
              onClick={fetchPlayers}
            />
            <Button
              label={t("buttons.exportCSV")}
              icon="pi pi-file"
              className="p-button-success"
              onClick={() => dt.current.exportCSV()}
            />
          </div>
        )}
        right={() => (
          <Button
            label={t("buttons.newPlayer")}
            icon="pi pi-user-plus"
            className="p-button-primary"
            onClick={() => setNewDialogVisible(true)}
          />
        )}
      />

      {/* Filtro */}

      <div className={`${styles.inputSearchWrapper} p-mb-4`}>
        <i className={`pi pi-search ${styles.inputSearchIcon}`} />
        <InputText
          className={styles.inputSearchInput}
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder={t("buttons.searchPlayer")}
        />
      </div>

      {/* Data table de los juagadores */}
      <DataTable
        ref={dt}
        value={players}
        paginator
        rows={10}
        rowsPerPageOptions={[5, 10, 20]}
        globalFilter={globalFilter}
        selection={selectedPlayers}
        onSelectionChange={(e) => setSelectedPlayers(e.value)}
        emptyMessage={t("buttons.dontFindPlayer")}
      >
        <Column selectionMode="multiple" headerStyle={{ width: "3em" }} />
        <Column
          field="photoUrl"
          header={t("players.photo")}
          body={(rowData) => (
            <Image
              src={createUrl(rowData.photoUrl) || "/img/logo.png"}
              alt={rowData.firstName + " " + rowData.lastName}
              width={50}
              height={80}
              className="rounded-full"
            />
          )}
        />
        <Column field="firstName" header={t("players.name")} sortable />
        <Column field="lastName" header={t("players.surname")} sortable />
        <Column field="dni" header={t("players.dni")} sortable />
        <Column field="category" header={t("teams.category")} sortable />
        <Column field="team" header={t("teams.category")} sortable />
        <Column field="paymentStatus" header={t("teams.team")} sortable />
        <Column
          field="documents"
          header={t("players.document")}
          body={(rowData) => (
            <div className={styles.flex}>
              {rowData.documents.map((doc) => (
                <Button
                  key={doc.type}
                  icon={getIconClass(doc.type)}
                  className="p-button-text"
                  onClick={() => {
                    const url = createUrl(doc.file_url);
                    if (url) window.open(url, "_blank");
                  }}
                  tooltip={doc.type.toUpperCase()}
                  tooltipOptions={{ position: "top" }}
                />
              ))}
            </div>
          )}
        />

        <Column
          header={t("players.actions")}
          body={(rowData) => (
            <div className={styles.flex}>
              <Button
                icon="pi pi-pencil"
                className="p-button-text p-button-warning"
                onClick={() => openEditDialog(rowData)}
              />
              <Button
                icon="pi pi-trash"
                className="p-button-text p-button-danger"
                onClick={() =>
                  handleDelete(rowData.playerId, rowData.firstName)
                }
              />
            </div>
          )}
        />
      </DataTable>

      {/* ------------------------- Modal de editar ------------------------- */}
      <Dialog
        header={t("players.editPlayer")}
        visible={editDialogVisible}
        style={{ width: "450px" }}
        modal
        className="p-fluid"
        onHide={() => setEditDialogVisible(false)}
      >
        {playerToEdit && (
          <div className={styles.formContainer}>
            <div className="field">
              <label>{t("players.name")}</label>
              <InputText
                value={playerToEdit.firstName}
                onChange={(e) =>
                  setPlayerToEdit({
                    ...playerToEdit,
                    firstName: e.target.value,
                  })
                }
              />
            </div>
            <div className="field">
              <label>{t("players.surname")}</label>
              <InputText
                value={playerToEdit.lastName}
                onChange={(e) =>
                  setPlayerToEdit({ ...playerToEdit, lastName: e.target.value })
                }
              />
            </div>
            <div className="field">
              <label>{t("teams.team")}</label>
              <Dropdown
                value={playerToEdit.teamId}
                options={teams.map((team) => ({
                  label: team.name,
                  value: team.id,
                }))}
                onChange={(e) =>
                  setPlayerToEdit({ ...playerToEdit, teamId: e.value })
                }
                placeholder={t("teams.selectTeam")}
              />
            </div>
            <div className="field">
              <label>{t("players.birthDate")}</label>
              <Calendar
                value={playerToEdit.dateOfBirth}
                onChange={(e) =>
                  setPlayerToEdit({ ...playerToEdit, dateOfBirth: e.value })
                }
                showIcon
                dateFormat="yy-mm-dd"
              />
            </div>

            <Button label={t("buttons.save")} onClick={handleSaveEdit} />
          </div>
        )}
      </Dialog>

      {/* ------------------------- Dialog Nuevo ------------------------- */}
      <Dialog
        header={t("buttons.newPlayer")}
        visible={newDialogVisible}
        style={{ width: "450px" }}
        modal
        className="p-fluid"
        onHide={() => {
          setNewDialogVisible(false);
          reset();
          setDniChecked(false);
        }}
      >
        <form
          onSubmit={handleSubmit(onSubmit)}
          className={styles.formContainer}
        >
          {/* DNI */}
          <div className="field">
            <label>{t("players.dni")}</label>
            <div className={styles.flexGap2}>
              <Controller
                name="dni"
                control={control}
                defaultValue=""
                rules={{
                  required: {
                    value: true,
                    message: t("inscription.form.dniError"),
                  },
                }}
                render={({ field }) => (
                  <InputText
                    {...field}
                    className={errors.dni && "p-invalid"}
                    onBlur={(e) => {
                      field.onBlur();
                      handleCheckDni();
                    }}
                  />
                )}
              />
              <Button
                icon="pi pi-search"
                className="p-button-secondary"
                type="button"
                onClick={handleCheckDni}
              />
              {checkingDni && (
                <ProgressSpinner style={{ width: "20px", height: "20px" }} />
              )}
            </div>
          </div>

          {/* Nombre */}
          <div className="field">
            <label>{t("inscription.form.name")}</label>
            <Controller
              name="firstName"
              control={control}
              defaultValue=""
              rules={{ required: t("inscription.form.nameError") }}
              render={({ field }) => <InputText {...field} />}
            />
          </div>

          {/* Apellido */}
          <div className="field">
            <label> {t("inscription.form.surname")}</label>
            <Controller
              name="lastName"
              control={control}
              defaultValue=""
              rules={{ required: t("inscription.form.surnameError") }}
              render={({ field }) => <InputText {...field} />}
            />
          </div>

          {/* Email */}
          <div className="field">
            <label>{t("inscription.form.email")}</label>
            <InputText {...register("email")} />
          </div>

          {/* Teléfono */}
          <div className="field">
            <label>{t("inscription.form.phone")}</label>
            <InputText {...register("phone")} />
          </div>

          {/* Equipo */}
          <div className="field">
            <label>{t("teams.team")}</label>
            <Controller
              name="teamId"
              control={control}
              defaultValue={null}
              rules={{ required: t("teams.teamIsMandatory") }}
              render={({ field }) => (
                <Dropdown
                  {...field} // value y onChange ya unidos a RHF
                  options={teams.map((t) => ({
                    label: t.name,
                    value: t.id,
                  }))}
                  placeholder={t("teams.selectTeam")}
                  className={errors.teamId && "p-invalid"}
                />
              )}
            />
          </div>

          {/* Fecha nacimiento */}
          <div className="field">
            <label>{t("players.birthDate")}</label>
            <Controller
              name="dateOfBirth"
              control={control}
              defaultValue={null}
              render={({ field }) => (
                <Calendar
                  {...field}
                  value={field.value}
                  onChange={(e) => field.onChange(e.value)}
                  showIcon
                  dateFormat="yy-mm-dd"
                />
              )}
            />
          </div>

          <Button
            type="submit"
            label={checkingDni ? t("players.checking") : t("buttons.save")}
            disabled={checkingDni || isSubmitting}
            className="mt-2"
          />
        </form>
      </Dialog>
    </div>
  );
}
