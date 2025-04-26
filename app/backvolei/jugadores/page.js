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

  console.log("Jugadores:", players);

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

  // Toolbar left template
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
          field="name"
          header="Name"
          sortable
          filter
          filterElement={nameFilterTemplate}
          style={{ minWidth: "12rem" }}
        />
        <Column
          field="dni"
          header="DNI"
          sortable
          filter
          filterPlaceholder="DNI"
          style={{ minWidth: "8rem" }}
        />
        <Column
          field="category"
          header="Category"
          sortable
          filter
          filterPlaceholder="Cat."
          style={{ minWidth: "8rem" }}
        />
        <Column
          field="team"
          header="Team"
          sortable
          filter
          filterPlaceholder="Team"
          style={{ minWidth: "8rem" }}
        />
        <Column
          field="paymentStatus"
          header="Paid?"
          sortable
          filter
          filterPlaceholder="Status"
          style={{ minWidth: "6rem" }}
        />
        <Column
          header="Actions"
          body={(rowData) => (
            <Button
              icon="pi pi-pencil"
              className="p-button-text"
              onClick={() => {
                /* your edit fn */
              }}
            />
          )}
          style={{ width: "6rem" }}
        />
      </DataTable>
    </div>
  );
}
