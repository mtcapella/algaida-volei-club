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

import stytles from "./jugadores.module.css";

export default function Players() {
  const [players, setPlayers] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedPlayers, setSelected] = useState(null);
  const dt = useRef(null);
  const toast = useRef(null);

  // Fetcheamos los jugadores desde la API
  useEffect(() => {
    fetch("/api/players")
      .then((res) => res.json())
      .then((data) => setPlayers(data));
  }, []);

  // Función para eliminar un jugador

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

        setPlayers((prevPlayers) =>
          prevPlayers.filter((player) => player.playerId !== playerId)
        );
      } else {
        throw new Error("Error al eliminar el jugador");
      }
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "No se pudo eliminar el jugador. Inténtalo de nuevo.",
        life: 3000,
      });
    }
  };

  // Modulo para exportar a CSV
  const exportCSV = () => {
    dt.current.exportCSV();
    toast.current.show({
      severity: "info",
      summary: "Exported",
      detail: "CSV file generated",
      life: 2000,
    });
  };

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
        className="p-button-success p-mr-2"
        onClick={exportCSV}
      />
    </>
  );

  // Column filters
  const nameFilterTemplate = (options) => {
    return (
      <InputText
        value={options.value}
        onChange={(e) => options.filter(e.target.value, options.index)}
        placeholder="Search by name"
      />
    );
  };

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
          placeholder="Global Search"
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
        onSelectionChange={(e) => setSelected(e.value)}
        globalFilter={globalFilter}
        emptyMessage="No players found"
      >
        <Column
          selectionMode="multiple"
          headerStyle={{ width: "3em" }}
        ></Column>
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
          filterPlaceholder="Cat."
        />
        <Column
          field="team"
          header="Equipo"
          sortable
          filter
          filterPlaceholder="Team"
        />
        <Column
          field="paymentStatus"
          header="Pagado?"
          sortable
          filter
          filterPlaceholder="Status"
        />
        <Column
          header="Acciones"
          body={(rowData) => (
            <div className={stytles.actionsIcons}>
              <Button
                icon="pi pi-pencil"
                className="p-button-text"
                onClick={() => {
                  console.log("Edit player:", rowData.playerId);
                }}
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
        <Column
          field="documents"
          header="Documentos"
          body={(rowData) => (
            <div className={stytles.documentsIcons}>
              {rowData.documents.dniUrl && (
                <a
                  href={rowData.documents.dniUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="pi pi-id-card" title="DNI"></i>
                </a>
              )}
              {rowData.documents.lopdUrl && (
                <a
                  href={rowData.documents.lopdUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="pi pi-lock" title="LOPD"></i>
                </a>
              )}
              {rowData.documents.usoImagenesUrl && (
                <a
                  href={rowData.documents.usoImagenesUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="pi pi-image" title="Uso de imágenes"></i>
                </a>
              )}
            </div>
          )}
        />
      </DataTable>
    </div>
  );
}
