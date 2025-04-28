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

import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

export default function Teams() {
  /* ---------------- state ---------------- */
  const [teams, setTeams] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedTeams, setSelectedTeams] = useState(null);

  // dialogs & form
  const emptyTeam = { id: null, name: "", coachName: "", categoryId: null };
  const [teamForm, setTeamForm] = useState(emptyTeam);
  const [newDialogVisible, setNewDialogVisible] = useState(false);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const dt = useRef(null);
  const toast = useRef(null);

  /* ----------- constantes ------------- */
  const categories = [
    { id: 3, name: "Alevín" },
    { id: 4, name: "Infantil" },
    { id: 5, name: "Cadete" },
    { id: 6, name: "Juvenil" },
    { id: 9, name: "Sénior" },
  ];

  /* ----------- fetch list on mount ------------- */
  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const res = await fetch("/api/teams");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setTeams(data);
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: "Error al cargar",
        detail: "No se pudieron obtener los equipos.",
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
      const res = await fetch("/api/teams", {
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
        summary: "Equipo creado",
        detail: "Equipo creado correctamente.",
        life: 3000,
      });
      setNewDialogVisible(false);
      fetchTeams();
    } catch (err) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "No se pudo crear el equipo.",
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
      const res = await fetch(`/api/teams/${teamForm.id}`, {
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
        summary: "Equipo actualizado",
        detail: "Cambios guardados.",
        life: 3000,
      });
      setEditDialogVisible(false);
      fetchTeams();
    } catch (err) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "No se pudo actualizar el equipo.",
        life: 3000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (team) => {
    const confirmDelete = window.confirm(
      `¿Eliminar el equipo "${team.name}"? Esta acción no se puede deshacer.`
    );
    if (!confirmDelete) return;
    try {
      const res = await fetch(`/api/teams/${team.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.current.show({
        severity: "success",
        summary: "Equipo eliminado",
        detail: `El equipo ${team.name} se ha eliminado correctamente.`,
        life: 3000,
      });
      setTeams((prev) => prev.filter((t) => t.id !== team.id));
    } catch (err) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "No se pudo eliminar el equipo.",
        life: 3000,
      });
    }
  };

  /* render acciones */
  const actionsBody = (rowData) => (
    <div className="flex gap-2">
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

  /* ------------- UI -------------- */
  return (
    <div className="p-4">
      <Toast ref={toast} />

      <Toolbar
        className="mb-4"
        left={() => (
          <div className="flex gap-2">
            <Button
              label="Refrescar"
              icon="pi pi-refresh"
              className="p-button-secondary"
              onClick={fetchTeams}
            />
            <Button
              label="Exportar CSV"
              icon="pi pi-file"
              className="p-button-success"
              onClick={() => dt.current.exportCSV()}
            />
          </div>
        )}
        right={() => (
          <Button
            label="Nuevo Equipo"
            icon="pi pi-plus"
            className="p-button-primary"
            onClick={openNewDialog}
          />
        )}
      />

      <div className="p-input-icon-left mb-3">
        <i className="pi pi-search" />
        <InputText
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Buscar equipo..."
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
        emptyMessage="No se encontraron equipos."
        dataKey="id"
      >
        <Column selectionMode="multiple" headerStyle={{ width: "3em" }} />
        <Column field="name" header="Nombre" sortable />
        <Column field="coach_name" header="Entrenador" sortable />
        <Column field="categoryName" header="Categoría" sortable />
        <Column
          field="totalPlayers"
          header="# Jugadores"
          sortable
          style={{ width: "8rem", textAlign: "center" }}
        />
        <Column header="Acciones" body={actionsBody} />
      </DataTable>

      {/* Dialog Nuevo */}
      <Dialog
        header="Nuevo Equipo"
        visible={newDialogVisible}
        style={{ width: 400 }}
        modal
        className="p-fluid"
        onHide={() => setNewDialogVisible(false)}
      >
        <div className="field">
          <label>Nombre</label>
          <InputText
            value={teamForm.name}
            onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
          />
        </div>
        <div className="field">
          <label>Entrenador</label>
          <InputText
            value={teamForm.coachName}
            onChange={(e) =>
              setTeamForm({ ...teamForm, coachName: e.target.value })
            }
          />
        </div>
        <div className="field">
          <label>Categoría</label>
          <Dropdown
            value={teamForm.categoryId}
            options={categories.map((c) => ({ label: c.name, value: c.id }))}
            onChange={(e) => setTeamForm({ ...teamForm, categoryId: e.value })}
            placeholder="Seleccionar categoría"
          />
        </div>
        <Button
          label="Guardar"
          onClick={handleSaveNew}
          disabled={submitting}
          className="mt-2"
        />
      </Dialog>

      {/* Dialog Editar */}
      <Dialog
        header="Editar Equipo"
        visible={editDialogVisible}
        style={{ width: 400 }}
        modal
        className="p-fluid"
        onHide={() => setEditDialogVisible(false)}
      >
        <div className="field">
          <label>Nombre</label>
          <InputText
            value={teamForm.name}
            onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
          />
        </div>
        <div className="field">
          <label>Entrenador</label>
          <InputText
            value={teamForm.coachName}
            onChange={(e) =>
              setTeamForm({ ...teamForm, coachName: e.target.value })
            }
          />
        </div>
        <div className="field">
          <label>Categoría</label>
          <Dropdown
            value={teamForm.categoryId}
            options={categories.map((c) => ({ label: c.name, value: c.id }))}
            onChange={(e) => setTeamForm({ ...teamForm, categoryId: e.value })}
            placeholder="Seleccionar categoría"
          />
        </div>
        <Button
          label="Guardar cambios"
          onClick={handleSaveEdit}
          disabled={submitting}
          className="mt-2"
        />
      </Dialog>
    </div>
  );
}
