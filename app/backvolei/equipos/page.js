"use client";

import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
import { Toast } from "primereact/toast";

import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

export default function Equipos() {
  const [teams, setTeams] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedTeams, setSelectedTeams] = useState(null);
  const dt = useRef(null);
  const toast = useRef(null);

  /* --- fetch list on mount --- */
  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const res = await fetch("/api/teams");
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

  /* --- fake actions, just console.log for ahora --- */
  const handleNew = () => {
    console.log("Nuevo equipo – aún sin implementar");
  };

  const handleEdit = (team) => {
    console.log("Editar equipo", team);
  };

  const handleDelete = (team) => {
    console.log("Eliminar equipo", team);
  };

  /* --- renderers --- */
  const actionsBody = (rowData) => (
    <div className="flex gap-2">
      <Button
        icon="pi pi-pencil"
        className="p-button-text p-button-warning"
        onClick={() => handleEdit(rowData)}
      />
      <Button
        icon="pi pi-trash"
        className="p-button-text p-button-danger"
        onClick={() => handleDelete(rowData)}
      />
    </div>
  );

  return (
    <div className="p-4">
      <Toast ref={toast} />

      {/* toolbar */}
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
            onClick={handleNew}
          />
        )}
      />

      {/* search */}
      <div className="p-input-icon-left mb-3">
        <i className="pi pi-search" />
        <InputText
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Buscar equipo..."
        />
      </div>

      {/* table */}
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
        <Column
          field="totalPlayers"
          header="# Jugadores"
          sortable
          style={{ width: "8rem", textAlign: "center" }}
        />
        <Column header="Acciones" body={actionsBody} />
      </DataTable>
    </div>
  );
}
