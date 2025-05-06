"use client";

/* Team details page – con desasignación usando PUT /api/assign-player { teamId: null } */

import React, { use as usePromise, useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
import { Toast } from "primereact/toast";
import { ProgressSpinner } from "primereact/progressspinner";
import { Dialog } from "primereact/dialog";

import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

export default function TeamPage({ params }) {
  const { id } = usePromise(params);

  const [team, setTeam] = useState(null);
  const [globalFilter, setGlobalFilter] = useState("");
  const [loading, setLoading] = useState(false);

  // assign modal state
  const [assignDialogVisible, setAssignDialogVisible] = useState(false);
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [loadingAvailable, setLoadingAvailable] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [assigning, setAssigning] = useState(false);
  const [removingId, setRemovingId] = useState(null); // playerId que se está quitando

  const dt = useRef(null);
  const toast = useRef(null);

  /* --------------------------- helpers --------------------------------- */
  const fetchTeam = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/teams/${id}`);
      if (!res.ok) throw new Error("Error al cargar el equipo");
      const data = await res.json();
      setTeam(data);
    } catch (err) {
      console.error(err);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "No se pudo cargar la información del equipo.",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  /* ---------- asignar jugadora ----------------------------------------- */
  const openAssignDialog = async () => {
    if (!team) return;
    setAssignDialogVisible(true);
    setLoadingAvailable(true);
    try {
      const res = await fetch(
        `/api/available/${encodeURIComponent(team.categoryName)}`
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      setAvailablePlayers(data);
    } catch (err) {
      console.error(err);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "No se pudo cargar la lista de jugadoras disponibles.",
        life: 3000,
      });
      setAvailablePlayers([]);
    } finally {
      setLoadingAvailable(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedPlayer) return;
    setAssigning(true);
    try {
      const res = await fetch(`/api/assign-player`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId: selectedPlayer.playerId,
          teamId: Number(id),
        }),
      });
      if (!res.ok) throw new Error();
      toast.current?.show({
        severity: "success",
        summary: "Jugadora asignada",
        detail: "La jugadora se ha añadido al equipo.",
        life: 3000,
      });
      setAssignDialogVisible(false);
      setSelectedPlayer(null);
      fetchTeam();
    } catch (err) {
      console.error(err);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "No se pudo asignar la jugadora.",
        life: 3000,
      });
    } finally {
      setAssigning(false);
    }
  };

  /* --------- quitar jugadora ------------------------------------------- */
  const handleRemove = async (rowData) => {
    const ok = window.confirm(
      `¿Quieres eliminar a ${rowData.first_name} ${rowData.last_name} del equipo?`
    );
    if (!ok) return;
    console.log("eliminar", rowData);
    setRemovingId(rowData.playerId);
    try {
      const res = await fetch(`/api/assign-player`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId: rowData.playerId,
          teamId: null,
        }),
      });
      if (!res.ok) throw new Error();
      toast.current?.show({
        severity: "success",
        summary: "Jugadora eliminada",
        detail: "La jugadora ha sido eliminada del equipo.",
        life: 3000,
      });
      fetchTeam();
    } catch (err) {
      console.error(err);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "No se pudo eliminar la jugadora.",
        life: 3000,
      });
    } finally {
      setRemovingId(null);
    }
  };

  /* ------------------ render helpers ----------------------------------- */
  const leftToolbarTemplate = () => (
    <div className="flex gap-2">
      <Button
        label="Refrescar"
        icon="pi pi-refresh"
        className="p-button-secondary"
        onClick={fetchTeam}
        disabled={loading}
      />
      <Button
        label="Exportar CSV"
        icon="pi pi-file"
        className="p-button-success"
        onClick={() => dt.current.exportCSV()}
        disabled={!team?.players?.length}
      />
    </div>
  );

  const rightToolbarTemplate = () => (
    <Button
      label="Añadir jugadora"
      icon="pi pi-user-plus"
      className="p-button-primary"
      onClick={openAssignDialog}
      disabled={!team}
    />
  );

  const deleteBodyTemplate = (rowData) => (
    <Button
      icon={
        removingId === rowData.playerId
          ? "pi pi-spin pi-spinner"
          : "pi pi-trash"
      }
      className="p-button-text p-button-danger"
      disabled={removingId === rowData.playerId}
      onClick={() => handleRemove(rowData)}
      tooltip="Eliminar jugadora"
      tooltipOptions={{ position: "top" }}
    />
  );

  /* -------------------------- UI --------------------------------------- */
  if (loading && !team) {
    return (
      <div
        className="flex justify-content-center align-items-center"
        style={{ height: "80vh" }}
      >
        <ProgressSpinner />
      </div>
    );
  }

  return (
    <div className="p-m-4">
      <Toast ref={toast} />

      {team && (
        <>
          <h1 className="mb-3 text-2xl font-semibold">{team.teamName}</h1>
          <p className="mb-4 text-sm text-color-secondary">
            {team.categoryName}
            {team.coachName ? ` · Entrenador/a: ${team.coachName}` : ""}
          </p>
        </>
      )}

      <Toolbar
        className="p-mb-3"
        left={leftToolbarTemplate}
        right={rightToolbarTemplate}
      />

      <div className="p-input-icon-left p-mb-3">
        <i className="pi pi-search" />
        <InputText
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Buscar jugadora..."
        />
      </div>

      <DataTable
        ref={dt}
        value={team?.players || []}
        paginator
        rows={10}
        rowsPerPageOptions={[5, 10, 20]}
        globalFilter={globalFilter}
        emptyMessage="No se encontraron jugadoras en este equipo."
      >
        <Column field="first_name" header="Nombre" sortable />
        <Column field="last_name" header="Apellido" sortable />
        <Column field="dni" header="DNI" sortable />
        <Column
          header="Acciones"
          body={deleteBodyTemplate}
          style={{ width: "4rem" }}
        />
      </DataTable>

      {/* Dialogo asignar jugadora */}
      <Dialog
        header="Añadir jugadora al equipo"
        visible={assignDialogVisible}
        style={{ width: "500px" }}
        modal
        onHide={() => {
          setAssignDialogVisible(false);
          setSelectedPlayer(null);
        }}
      >
        {loadingAvailable ? (
          <div className="flex justify-content-center">
            <ProgressSpinner />
          </div>
        ) : (
          <>
            <DataTable
              value={availablePlayers}
              selectionMode="single"
              selection={selectedPlayer}
              onSelectionChange={(e) => setSelectedPlayer(e.value)}
              dataKey="playerId"
              emptyMessage="No hay jugadoras disponibles."
              paginator
              rows={5}
              rowsPerPageOptions={[5, 10]}
              className="p-mb-2"
            >
              <Column selectionMode="single" style={{ width: "3rem" }} />
              <Column field="firstName" header="Nombre" sortable />
              <Column field="lastName" header="Apellido" sortable />
            </DataTable>

            <div className="flex justify-content-end gap-2 mt-3">
              <Button
                label="Cancelar"
                className="p-button-text"
                onClick={() => setAssignDialogVisible(false)}
              />
              <Button
                label="Guardar"
                icon="pi pi-check"
                disabled={!selectedPlayer || assigning}
                loading={assigning}
                onClick={handleAssign}
              />
            </div>
          </>
        )}
      </Dialog>
    </div>
  );
}
