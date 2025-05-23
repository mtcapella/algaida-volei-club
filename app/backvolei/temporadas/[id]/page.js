"use client";

import React, {
  use as usePromise,
  useState,
  useEffect,
  useRef,
  useContext,
} from "react";
import { TabView, TabPanel } from "primereact/tabview";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { ProgressSpinner } from "primereact/progressspinner";

import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

import { ImageTokenContext } from "@/app/components/imageTokenProvider"; // Importa el contexto del token de imagen

// helper que devuelve el icono según el tipo de documento
const docIcon = {
  dni: "pi pi-id-card",
  lopd: "pi pi-shield",
  usoimagenes: "pi pi-image",
};

export default function SeasonDetail({ params }) {
  const { id } = usePromise(params);

  const [season, setSeason] = useState(null);
  const { token, loading } = useContext(ImageTokenContext);
  const [loadingFetch, setLoadingFetch] = useState(false);

  // filtros para las tablas
  const [playersFilter, setPlayersFilter] = useState("");
  const [teamsFilter, setTeamsFilter] = useState("");
  const [paymentsFilter, setPaymentsFilter] = useState("");

  const toast = useRef(null);

  // fetchear la temporada que llega por params
  const fetchSeason = async () => {
    setLoadingFetch(true);
    try {
      const base = process.env.NEXT_PUBLIC_DOMAIN;
      const res = await fetch(`${base}/api/seasons/${id}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSeason(data);
    } catch (err) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "No se pudo cargar la temporada.",
        life: 4000,
      });
    } finally {
      setLoadingFetch(false);
    }
  };

  useEffect(() => {
    fetchSeason();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // helper para crear la url de las imágenes de firebase con el token
  const createUrl = (path) => {
    if (!path || !token) return "";
    return `https://firebasestorage.googleapis.com/v0/b/algaida-volei-club.firebasestorage.app/o/${encodeURIComponent(
      path
    )}?alt=media&token=${token}`;
  };

  /* -------- body templates -------- */
  const documentBody = (row) => {
    /* convierte string → array y filtra nulls */
    let docs = [];

    if (Array.isArray(row.documents)) {
      docs = row.documents;
    } else if (
      typeof row.documents === "string" &&
      row.documents.trim().startsWith("[")
    ) {
      try {
        docs = JSON.parse(row.documents);
      } catch {
        docs = [];
      }
    }

    docs = docs.filter((d) => d && d.url);

    if (!docs.length) return <span className="text-xs opacity-60">–</span>;

    return (
      <div className="flex gap-2">
        {docs.map((doc) => (
          <Button
            key={doc.url}
            icon={docIcon[doc.type] ?? "pi pi-file"}
            className="p-button-text"
            onClick={() => window.open(createUrl(doc.url), "_blank")}
            tooltip={doc.type?.toUpperCase()}
            tooltipOptions={{ position: "top" }}
          />
        ))}
      </div>
    );
  };

  const payButtonBody = (row) =>
    row.status === "pending" ? (
      <Button
        icon="pi pi-check"
        className="p-button-success p-button-text"
        onClick={() => handlePay(row)}
        tooltip="Marcar pagado"
      />
    ) : null;

  /* -------- PUT pago -------- */
  const handlePay = async (row) => {
    if (
      !window.confirm(
        `Vas a marcar como pagado a ${row.first_name} ${row.last_name}. Esta acción es irreversible. ¿Continuar?`
      )
    )
      return;

    try {
      const base = process.env.NEXT_PUBLIC_DOMAIN;
      const res = await fetch(`${base}/api/seasons/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId: row.playerId }),
      });
      if (!res.ok) throw new Error();
      toast.current.show({
        severity: "success",
        summary: "Pago actualizado",
        detail: `${row.first_name} ${row.last_name} marcado como pagado.`,
        life: 3000,
      });
      fetchSeason();
    } catch (err) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "No se pudo actualizar el pago.",
        life: 3000,
      });
    }
  };

  /* -------- render -------- */
  if (loadingFetch && loading && !season) {
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
      {season && (
        <h1 className="mb-4 text-2xl font-semibold">{season.seasonName}</h1>
      )}

      <TabView>
        {/* TAB Jugadores */}
        <TabPanel header="Jugadores">
          <div className="p-input-icon-left p-mb-3">
            <i className="pi pi-search" />
            <InputText
              value={playersFilter}
              onChange={(e) => setPlayersFilter(e.target.value)}
              placeholder="Buscar jugadora..."
            />
          </div>
          <DataTable
            value={season?.players || []}
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 20]}
            globalFilter={playersFilter}
            emptyMessage="No se encontraron jugadoras"
          >
            <Column field="first_name" header="Nombre" sortable />
            <Column field="last_name" header="Apellido" sortable />
            <Column field="dni" header="DNI" sortable />
            <Column
              field="date_of_birth"
              header="F. Nacimiento"
              body={(row) => row.date_of_birth?.split("T")[0]}
              sortable
            />
            <Column header="Docs" body={documentBody} />
          </DataTable>
        </TabPanel>

        {/* TAB Equipos */}
        <TabPanel header="Equipos">
          <div className="p-input-icon-left p-mb-3">
            <i className="pi pi-search" />
            <InputText
              value={teamsFilter}
              onChange={(e) => setTeamsFilter(e.target.value)}
              placeholder="Buscar equipo..."
            />
          </div>
          <DataTable
            value={season?.teams || []}
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 20]}
            globalFilter={teamsFilter}
            emptyMessage="No se encontraron equipos"
          >
            <Column field="name" header="Equipo" sortable />
            <Column field="coach_name" header="Entrenador/a" sortable />
            <Column field="category" header="Categoría" sortable />
            <Column field="totalPlayers" header="# Jugadoras" sortable />
          </DataTable>
        </TabPanel>

        {/* TAB Pagos */}
        <TabPanel header="Pagos">
          <div className="p-input-icon-left p-mb-3">
            <i className="pi pi-search" />
            <InputText
              value={paymentsFilter}
              onChange={(e) => setPaymentsFilter(e.target.value)}
              placeholder="Buscar pago..."
            />
          </div>
          <DataTable
            value={season?.payments || []}
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 20]}
            globalFilter={paymentsFilter}
            emptyMessage="No se encontraron pagos"
          >
            <Column field="first_name" header="Nombre" sortable />
            <Column field="last_name" header="Apellido" sortable />
            <Column
              field="totalDue"
              header="Total (€)"
              body={(row) => Number(row.totalDue).toFixed(2)}
              sortable
            />
            <Column
              field="totalPaid"
              header="Pagado (€)"
              body={(row) => Number(row.totalPaid).toFixed(2)}
              sortable
            />
            <Column field="status" header="Estado" sortable />
            <Column header="Acciones" body={payButtonBody} />
          </DataTable>
        </TabPanel>
      </TabView>
    </div>
  );
}
