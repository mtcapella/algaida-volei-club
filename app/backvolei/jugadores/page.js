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
import { Calendar } from "primereact/calendar";

import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

import styles from "./jugadores.module.css";

export default function Players() {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedPlayers, setSelectedPlayers] = useState(null);
  const [playerToEdit, setPlayerToEdit] = useState(null);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const dt = useRef(null);
  const toast = useRef(null);

  // Cargar jugadores
  useEffect(() => {
    fetchPlayers();
    fetchTeams();
  }, []);

  const fetchPlayers = async () => {
    const res = await fetch("/api/players");
    const data = await res.json();
    setPlayers(data);
  };

  const fetchTeams = async () => {
    const res = await fetch("/api/teams");
    const data = await res.json();
    setTeams(data);
  };

  const handleDelete = async (playerId, playerName) => {
    try {
      const response = await fetch(`/api/players/${playerId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.current.show({
          severity: "success",
          summary: "Jugador eliminado",
          detail: `El jugador ${playerName} ha sido eliminado.`,
          life: 3000,
        });
        setPlayers((prev) => prev.filter((p) => p.playerId !== playerId));
      } else {
        throw new Error("Error al eliminar jugador");
      }
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "No se pudo eliminar el jugador.",
        life: 3000,
      });
    }
  };

  const openEditDialog = (player) => {
    setPlayerToEdit({
      playerId: player.playerId,
      firstName: player.firstName,
      lastName: player.lastName,
      teamId: teams.find((t) => t.name === player.team)?.id || null,
      dateOfBirth: player.dateOfBirth ? new Date(player.dateOfBirth) : null, // convertir la fecha en objeto Date
    });
    setEditDialogVisible(true);
  };

  const handleSaveEdit = async () => {
    try {
      const { playerId, firstName, lastName, teamId, dateOfBirth } =
        playerToEdit;

      const response = await fetch(`/api/players/${playerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          dateOfBirth: dateOfBirth
            ? dateOfBirth.toISOString().split("T")[0]
            : null, // yyyy-MM-dd
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
      } else {
        throw new Error("Error al actualizar jugador");
      }
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "No se pudo actualizar el jugador.",
        life: 3000,
      });
    }
  };

  const editDialogFooter = (
    <div className={styles.modalFooter}>
      <Button
        label="Cancelar"
        icon="pi pi-times"
        onClick={() => setEditDialogVisible(false)}
        className="p-button-text"
      />
      <Button
        label="Guardar"
        icon="pi pi-check"
        onClick={handleSaveEdit}
        autoFocus
      />
    </div>
  );

  const leftToolbarTemplate = () => (
    <>
      <Button
        icon="pi pi-refresh"
        className="p-button-text"
        onClick={() => window.location.reload()}
      />
      <Button
        icon="pi pi-file"
        label="Export CSV"
        className="p-button-success p-ml-2"
        onClick={() => dt.current.exportCSV()}
      />
    </>
  );

  const nameFilterTemplate = (options) => (
    <InputText
      value={options.value}
      onChange={(e) => options.filter(e.target.value, options.index)}
      placeholder="Buscar por nombre"
    />
  );

  return (
    <div className="p-m-4">
      <Toast ref={toast} />
      <Toolbar className="p-mb-4" left={leftToolbarTemplate} />

      <div className="p-input-icon-left p-mb-3">
        <i className="pi pi-search" />
        <InputText
          type="search"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Búsqueda global"
        />
      </div>

      <DataTable
        ref={dt}
        value={players}
        paginator
        rows={10}
        rowsPerPageOptions={[5, 10, 20]}
        sortMode="multiple"
        selectionMode="checkbox"
        selection={selectedPlayers}
        onSelectionChange={(e) => setSelectedPlayers(e.value)}
        globalFilter={globalFilter}
        emptyMessage="No se encontraron jugadores"
      >
        <Column selectionMode="multiple" headerStyle={{ width: "3em" }} />
        <Column
          field="firstName"
          header="Nombre"
          sortable
          filter
          filterElement={nameFilterTemplate}
        />
        <Column
          field="lastName"
          header="Apellido"
          sortable
          filter
          filterElement={nameFilterTemplate}
        />
        <Column
          field="dni"
          header="DNI"
          sortable
          filter
          filterPlaceholder="DNI"
        />
        <Column
          field="category"
          header="Categoría"
          sortable
          filter
          filterPlaceholder="Categoría"
        />
        <Column
          field="team"
          header="Equipo"
          sortable
          filter
          filterPlaceholder="Equipo"
        />
        <Column
          field="paymentStatus"
          header="Pagado"
          sortable
          filter
          filterPlaceholder="Estado"
        />
        <Column
          header="Acciones"
          body={(rowData) => (
            <div className={styles.actionsIcons}>
              <Button
                icon="pi pi-pencil"
                className="p-button-text"
                onClick={() => openEditDialog(rowData)}
              />
              <Button
                icon="pi pi-trash"
                className="p-button-text p-button-danger"
                onClick={() =>
                  handleDelete(
                    rowData.playerId,
                    `${rowData.firstName} ${rowData.lastName}`
                  )
                }
              />
            </div>
          )}
        />
      </DataTable>

      {/* Modal de edición */}
      <Dialog
        header="Editar Jugador"
        visible={editDialogVisible}
        style={{ width: "450px" }}
        modal
        className="p-fluid"
        footer={editDialogFooter}
        onHide={() => setEditDialogVisible(false)}
      >
        {playerToEdit && (
          <div className={styles.formEdit}>
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
              <label>Fecha de nacimiento</label>
              <Calendar
                value={playerToEdit.dateOfBirth}
                onChange={(e) =>
                  setPlayerToEdit({ ...playerToEdit, dateOfBirth: e.value })
                }
                dateFormat="yy-mm-dd"
                showIcon
                showButtonBar
              />
            </div>

            <div className="field">
              <label>Equipo</label>
              <Dropdown
                value={playerToEdit.teamId}
                options={teams}
                optionLabel="name"
                optionValue="id"
                placeholder="Selecciona un equipo"
                onChange={(e) =>
                  setPlayerToEdit({ ...playerToEdit, teamId: e.value })
                }
              />
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
