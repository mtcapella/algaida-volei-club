"use client";

import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
import { Toast } from "primereact/toast";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";

import { api } from "@/libs/api"; // Importa la función api

import i18n from "../../i18nextInit.js";
import { useTranslation } from "react-i18next";

import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

import styles from "./equipos.module.css";

export default function Teams() {
  // i18n para la traduccion de los textos
  const { t } = useTranslation();
  // estados y refs de la pagina equipos
  const [teams, setTeams] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedTeams, setSelectedTeams] = useState(null);

  // modales y formularios dentro de los modales
  const emptyTeam = { id: null, name: "", coachName: "", categoryId: null };
  const [teamForm, setTeamForm] = useState(emptyTeam);
  const [newDialogVisible, setNewDialogVisible] = useState(false);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const dt = useRef(null);
  const toast = useRef(null);

  // contantes de las categorias hardcodeadas para el dropdown
  // en un futuro se podrian obtener de la base de datos o de un endpoint
  const categories = [
    { id: 1, name: "Alevín" },
    { id: 2, name: "Infantil" },
    { id: 3, name: "Cadete" },
    { id: 4, name: "Juvenil" },
    { id: 5, name: "Sénior" },
  ];

  // use effect para cargar los equipos al iniciar la pagina
  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const res = await api(`/api/teams`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setTeams(data);
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: t("teams.errorOnLoading"),
        detail: t("teams.errorOnLoadindMesage"),
        life: 3000,
      });
    }
  };

  /* ---------------- CRUD --------------- */
  const openNewDialog = () => {
    setTeamForm(emptyTeam);
    setNewDialogVisible(true);
  };

  const openEditDialog = (team) => {
    setTeamForm({
      id: team.id,
      name: team.name,
      coachName: team.coach_name || "",
      categoryId: team.categoryId ?? null,
    });
    setEditDialogVisible(true);
  };

  const handleSaveNew = async () => {
    if (!teamForm.name || !teamForm.categoryId) return;
    setSubmitting(true);
    try {
      const res = await api(`/api/teams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: teamForm.name.trim(),
          coachName: teamForm.coachName.trim() || null,
          categoryId: teamForm.categoryId,
        }),
      });
      if (!res.ok) throw new Error();
      toast.current.show({
        severity: "success",
        summary: t("teams.teamCreated"),
        detail: t("teams.teamCreatedCorrectly"),
        life: 3000,
      });
      setNewDialogVisible(false);
      fetchTeams();
    } catch (err) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: t("teams.cantCreateTeam"),
        life: 3000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!teamForm.name || !teamForm.categoryId) return;
    setSubmitting(true);
    try {
      const res = await api(`/api/teams/${teamForm.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: teamForm.name.trim(),
          coachName: teamForm.coachName.trim() || null,
          categoryId: teamForm.categoryId,
        }),
      });
      if (!res.ok) throw new Error();
      toast.current.show({
        severity: "success",
        summary: t("teams.teamUpdated"),
        detail: t("teams.changesSaved"),
        life: 3000,
      });
      setEditDialogVisible(false);
      fetchTeams();
    } catch (err) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: t("teams.teamNotUpdated"),
        life: 3000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (team) => {
    const confirmDelete = window.confirm(
      `¿${t("teams.deleateTeam")} "${team.name}"? ${t(
        "teams.actionCantBeUndo"
      )}`
    );
    if (!confirmDelete) return;
    try {
      const res = await api(`/api/teams/${team.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      toast.current.show({
        severity: "success",
        summary: "Equipo eliminado",
        detail: `${t("teams.theTeam")} ${team.name} ${t(
          "teams.hasDeletedCorrectly"
        )}`,
        life: 3000,
      });
      setTeams((prev) => prev.filter((t) => t.id !== team.id));
    } catch (err) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: t("teams.cantDeleteTeam"),
        life: 3000,
      });
    }
  };

  /* render acciones */
  const actionsBody = (rowData) => (
    <div className={styles.documentsIcons}>
      <Button
        icon="pi pi-eye"
        className="p-button-text p-button-info"
        // al clicar deberia redigirigir a la pagina de detalles del equipo /backvolei/equipos/[id]
        onClick={() => {
          window.location.href = `/backvolei/equipos/${rowData.id}`;
        }}
      />
      <Button
        icon="pi pi-pencil"
        className="p-button-text p-button-warning"
        onClick={() => openEditDialog(rowData)}
      />
      <Button
        icon="pi pi-trash"
        className="p-button-text p-button-danger"
        onClick={() => handleDelete(rowData)}
      />
    </div>
  );

  // render de la pagina
  return (
    <div className="p-4">
      <Toast ref={toast} />

      <Toolbar
        className="mb-4"
        left={() => (
          <div className={styles.flexGap2}>
            <Button
              label={t("buttons.update")}
              icon="pi pi-refresh"
              className="p-button-secondary"
              onClick={fetchTeams}
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
            label={t("buttons.newTeam")}
            icon="pi pi-plus"
            className="p-button-primary"
            onClick={openNewDialog}
          />
        )}
      />

      <div className={`${styles.inputSearchWrapper} p-mb-4`}>
        <i className={`pi pi-search ${styles.inputSearchIcon}`} />
        <InputText
          className={styles.inputSearchInput}
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder={t("buttons.searchPlayer")}
        />
      </div>

      <DataTable
        ref={dt}
        value={teams}
        paginator
        rows={10}
        rowsPerPageOptions={[5, 10, 20]}
        globalFilter={globalFilter}
        selection={selectedTeams}
        onSelectionChange={(e) => setSelectedTeams(e.value)}
        emptyMessage={t("teams.notFindTeams")}
        dataKey="id"
      >
        <Column selectionMode="multiple" headerStyle={{ width: "3em" }} />
        <Column field="name" header={t("players.name")} sortable />
        <Column field="coach_name" header={t("teams.trainer")} sortable />
        <Column field="categoryName" header={t("teams.category")} sortable />
        <Column
          field="totalPlayers"
          header={t("teams.numberOfPlayers")}
          sortable
          style={{ width: "8rem", textAlign: "center" }}
        />
        <Column header={t("players.actions")} body={actionsBody} />
      </DataTable>

      {/* Dialog Nuevo */}
      <Dialog
        header={t("buttons.newTeam")}
        visible={newDialogVisible}
        style={{ width: 400 }}
        modal
        className="p-fluid"
        onHide={() => setNewDialogVisible(false)}
      >
        <div className={styles.formContainer}>
          <div className="field">
            <label>{t("players.name")}</label>
            <InputText
              value={teamForm.name}
              onChange={(e) =>
                setTeamForm({ ...teamForm, name: e.target.value })
              }
            />
          </div>
          <div className="field">
            <label>{t("teams.trainer")}</label>
            <InputText
              value={teamForm.coachName}
              onChange={(e) =>
                setTeamForm({ ...teamForm, coachName: e.target.value })
              }
            />
          </div>
          <div className="field">
            <label>{t("teams.category")}</label>
            <Dropdown
              value={teamForm.categoryId}
              options={categories.map((c) => ({ label: c.name, value: c.id }))}
              onChange={(e) =>
                setTeamForm({ ...teamForm, categoryId: e.value })
              }
              placeholder={t("teams.selectCategory")}
            />
          </div>
          <Button
            label={t("buttons.save")}
            onClick={handleSaveNew}
            disabled={submitting}
            className="mt-2"
          />
        </div>
      </Dialog>

      {/* Modal de Editar */}
      <Dialog
        header={t("teams.editTeam")}
        visible={editDialogVisible}
        style={{ width: 400 }}
        modal
        className="p-fluid"
        onHide={() => setEditDialogVisible(false)}
      >
        <div className={styles.formContainer}>
          <div className="field">
            <label>{t("players.name")}</label>
            <InputText
              value={teamForm.name}
              onChange={(e) =>
                setTeamForm({ ...teamForm, name: e.target.value })
              }
            />
          </div>
          <div className="field">
            <label>{t("teams.trainer")}</label>
            <InputText
              value={teamForm.coachName}
              onChange={(e) =>
                setTeamForm({ ...teamForm, coachName: e.target.value })
              }
            />
          </div>
          <div className="field">
            <label>{t("teams.category")}</label>
            <Dropdown
              value={teamForm.categoryId}
              options={categories.map((c) => ({ label: c.name, value: c.id }))}
              onChange={(e) =>
                setTeamForm({ ...teamForm, categoryId: e.value })
              }
              placeholder={t("teams.selectCategory")}
            />
          </div>
          <Button
            label={t("buttons.save")}
            onClick={handleSaveEdit}
            disabled={submitting}
            className="mt-2"
          />
        </div>
      </Dialog>
    </div>
  );
}
