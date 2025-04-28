"use client";

import React, { use as usePromise, useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
import { Toast } from "primereact/toast";
import { ProgressSpinner } from "primereact/progressspinner";

import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

export default function TeamsPage({ params }) {
  const { id } = usePromise(params); // /backvolei/equipos/[id]

  const [team, setTeam] = useState(null); // { teamId, teamName, coachName, categoryName, players: [] }
  const [globalFilter, setGlobalFilter] = useState("");
  const [loading, setLoading] = useState(false);

  const dt = useRef(null);
  const toast = useRef(null);

  // -------- fetch helpers --------------------------------------------------
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

  // first load & when id changes
  useEffect(() => {
    fetchTeam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  //---------------------------------- render --------------------------------

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
            {team.categoryName}{" "}
            {team.coachName ? `· Entrenador/a: ${team.coachName}` : ""}
          </p>
        </>
      )}

      <Toolbar className="p-mb-3" left={leftToolbarTemplate} />

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
      </DataTable>
    </div>
  );
}
