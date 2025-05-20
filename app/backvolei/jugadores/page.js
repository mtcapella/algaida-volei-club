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

  console.log("Token de imagen:", token);

  console.log("token", token);

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
    const base = process.env.NEXT_PUBLIC_DOMAIN;
    const res = await fetch(`${base}/api/players`);
    const data = await res.json();
    console.log(data);
    setPlayers(data);
  };

  const fetchTeams = async () => {
    const base = process.env.NEXT_PUBLIC_DOMAIN;
    const res = await fetch(`${base}/api/teams`);
    const data = await res.json();
    setTeams(data);
  };

  /*helpers */
  const handleDelete = async (playerId, playerName) => {
    try {
      const base = process.env.NEXT_PUBLIC_DOMAIN;
      const response = await fetch(`${base}/api/players/${playerId}`, {
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
        detail: "No se pudo eliminar el jugador.",
        life: 3000,
      });
    }
  };

  // Helper para determinar el icono de cada documento
  const docIcon = {
    dni: "pi pi-id-card", // DNI / pasaporte
    usoimagenes: "pi pi-image", // Cesión de uso de imagen
    lopd: "pi pi-shield", // LOPD
  };

  const getIconClass = (type) => docIcon[type] ?? "pi pi-file"; // fallback

  /* ------------------------------ editar --------------------------------- */
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
      const base = process.env.NEXT_PUBLIC_DOMAIN;
      const response = await fetch(`${base}/api/players/${playerId}`, {
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
          summary: "Jugador actualizado",
          detail: "Los cambios han sido guardados.",
          life: 3000,
        });
        setEditDialogVisible(false);
        fetchPlayers();
      } else throw new Error();
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "No se pudo actualizar el jugador.",
        life: 3000,
      });
    }
  };

  /* --------------------------- comprobación DNI -------------------------- */
  const handleCheckDni = async () => {
    const dni = getValues("dni")?.toUpperCase().trim();
    if (!dni || checkingDni) return;

    setCheckingDni(true);
    try {
      const base = process.env.NEXT_PUBLIC_DOMAIN;
      const res = await fetch(`${base}/api/check-user/${dni}`);
      const data = await res.json();

      // reset de errores previos
      setError("dni", {});

      if (data.exists && data.registered) {
        toast.current.show({
          severity: "error",
          summary: "Jugador ya registrado",
          detail: "Ya inscrito en la temporada activa.",
          life: 3000,
        });
        setError("dni", { type: "duplicated", message: "Jugador ya inscrito" });
        setDniChecked(false);
        return;
      }

      if (data.exists && data.hasDebt) {
        toast.current.show({
          severity: "error",
          summary: "Jugador con deuda",
          detail: "Tiene pagos pendientes.",
          life: 3000,
        });
        setError("dni", { type: "debt", message: "Jugador con deudas" });
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
          summary: "Jugador encontrado",
          detail: "Completa los datos restantes.",
          life: 3000,
        });
      } else {
        // jugador nuevo
        setValue("exists", false);
        toast.current.show({
          severity: "success",
          summary: "Nuevo jugador",
          detail: "Jugador no encontrado. Puedes crearlo.",
          life: 3000,
        });
      }
      setDniChecked(true);
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "No se pudo comprobar el jugador.",
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
      const base = process.env.NEXT_PUBLIC_DOMAIN;
      const response = await fetch(`${base}/api/register`, {
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
          summary: "Jugador creado",
          detail: "Jugador registrado exitosamente.",
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
        detail: "No se pudo registrar el jugador.",
        life: 3000,
      });
    }
  };
  if (loading) {
    return <div>Cargando imágenes...</div>;
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
      <div className="p-input-icon-left p-mb-4">
        <i className="pi pi-search" />
        <InputText
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder={t("buttons.searchPlayer")}
        />
      </div>

      {/* Data table de los jeugadores */}
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
          header="Foto"
          body={(rowData) => (
            <Image
              src={rowData.photoUrl || "/img/default-avatar.png"}
              alt="Foto"
              width={50}
              height={50}
              className="rounded-full"
            />
          )}
        />
        <Column field="firstName" header="Nombre" sortable />
        <Column field="lastName" header="Apellido" sortable />
        <Column field="dni" header="DNI" sortable />
        <Column field="category" header="Categoría" sortable />
        <Column field="team" header="Equipo" sortable />
        <Column field="paymentStatus" header="Estado de Pago" sortable />
        <Column
          field="documents"
          header="Documentos"
          body={(rowData) => (
            <div className={styles.flex}>
              {rowData.documents.map((doc) => (
                <Button
                  key={doc.type}
                  icon={getIconClass(doc.type)}
                  className="p-button-text"
                  onClick={() => window.open(doc.file_url, "_blank")}
                  tooltip={doc.type.toUpperCase()}
                  tooltipOptions={{ position: "top" }}
                />
              ))}
            </div>
          )}
        />

        <Column
          header="Acciones"
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

      {/* ------------------------- Dialog Editar ------------------------- */}
      <Dialog
        header="Editar Jugador"
        visible={editDialogVisible}
        style={{ width: "450px" }}
        modal
        className="p-fluid"
        onHide={() => setEditDialogVisible(false)}
      >
        {playerToEdit && (
          <>
            <div className="field">
              <label>Nombre</label>
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
              <label>Apellido</label>
              <InputText
                value={playerToEdit.lastName}
                onChange={(e) =>
                  setPlayerToEdit({ ...playerToEdit, lastName: e.target.value })
                }
              />
            </div>
            <div className="field">
              <label>Equipo</label>
              <Dropdown
                value={playerToEdit.teamId}
                options={teams.map((team) => ({
                  label: team.name,
                  value: team.id,
                }))}
                onChange={(e) =>
                  setPlayerToEdit({ ...playerToEdit, teamId: e.value })
                }
                placeholder="Seleccionar equipo"
              />
            </div>
            <div className="field">
              <label>Fecha de nacimiento</label>
              <Calendar
                value={playerToEdit.dateOfBirth}
                onChange={(e) =>
                  setPlayerToEdit({ ...playerToEdit, dateOfBirth: e.value })
                }
                showIcon
                dateFormat="yy-mm-dd"
              />
            </div>

            <Button label="Guardar cambios" onClick={handleSaveEdit} />
          </>
        )}
      </Dialog>

      {/* ------------------------- Dialog Nuevo ------------------------- */}
      <Dialog
        header="Nuevo Jugador"
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
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* DNI */}
          <div className="field">
            <label>DNI</label>
            <div className={styles.flexGap2}>
              <Controller
                name="dni"
                control={control}
                defaultValue=""
                rules={{ required: "El DNI es obligatorio" }}
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
            <label>Nombre</label>
            <Controller
              name="firstName"
              control={control}
              defaultValue=""
              rules={{ required: "El nombre es obligatorio" }}
              render={({ field }) => <InputText {...field} />}
            />
          </div>

          {/* Apellido */}
          <div className="field">
            <label>Apellido</label>
            <Controller
              name="lastName"
              control={control}
              defaultValue=""
              rules={{ required: "El apellido es obligatorio" }}
              render={({ field }) => <InputText {...field} />}
            />
          </div>

          {/* Email */}
          <div className="field">
            <label>Email</label>
            <InputText {...register("email")} />
          </div>

          {/* Teléfono */}
          <div className="field">
            <label>Teléfono</label>
            <InputText {...register("phone")} />
          </div>

          {/* Equipo */}
          <div className="field">
            <label>Equipo</label>
            <Controller
              name="teamId"
              control={control}
              defaultValue={null}
              rules={{ required: "El equipo es obligatorio" }}
              render={({ field }) => (
                <Dropdown
                  {...field} // value y onChange ya unidos a RHF
                  options={teams.map((t) => ({
                    label: t.name,
                    value: t.id,
                  }))}
                  placeholder="Seleccionar equipo"
                  className={errors.teamId && "p-invalid"}
                />
              )}
            />
          </div>

          {/* Fecha nacimiento */}
          <div className="field">
            <label>Fecha de nacimiento</label>
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
            label={checkingDni ? "Comprobando..." : "Guardar"}
            disabled={checkingDni || isSubmitting}
            className="mt-2"
          />
        </form>
      </Dialog>
    </div>
  );
}
