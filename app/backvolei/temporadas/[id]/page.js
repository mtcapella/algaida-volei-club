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

import { api } from "@/libs/api"; // Importa la función api

import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

// importa traducciones

import { useTranslation } from "react-i18next";

import { ImageTokenContext } from "@/app/components/imageTokenProvider"; // Importa el contexto del token de imagen

import styles from "../temporadas.module.css"; // Importa los estilos específicos

// helper que devuelve el icono según el tipo de documento
const docIcon = {
  dni: "pi pi-id-card",
  lopd: "pi pi-shield",
  usoimagenes: "pi pi-image",
};

export default function SeasonDetail({ params }) {
  const { t } = useTranslation();
  const { id } = usePromise(params); // extrae el id de los params

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
      const res = await api(`/api/seasons/${id}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSeason(data);
    } catch (err) {
      toast.current.show({
        severity: "error",
        summary: t("seasons.error"),
        detail: t("seasons.seasonCantBeLoaded"),
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

  /* templates varios */
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
        icon="pi pi-wallet"
        className="p-button-text p-button-warning"
        onClick={() => handlePay(row)}
        tooltip={t("seasons.markAsPaid")}
      />
    ) : null;

  /* actualizar pago */
  const handlePay = async (row) => {
    if (
      !window.confirm(
        `${t("seasons.markAsPaidMessage")} ${row.first_name} ${
          row.last_name
        }. ${t("seasons.thisActionCantBeUndo")}`
      )
    )
      return;

    try {
      const res = await api(`/api/seasons/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId: row.playerId }),
      });
      if (!res.ok) throw new Error();
      toast.current.show({
        severity: "success",
        summary: t("seasons.paymentUpdated"),
        detail: `${row.first_name} ${row.last_name} ${t(
          "seasons.paymentUpdatedCorrectly"
        )}`,
        life: 3000,
      });
      fetchSeason();
    } catch (err) {
      toast.current.show({
        severity: "error",
        summary: t("seasons.error"),
        detail: t("seasons.cantUpdatePayment"),
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
        <TabPanel header={t("categories.players")}>
          <div className={`${styles.inputSearchWrapper} p-mb-4`}>
            <i className={`pi pi-search ${styles.inputSearchIcon}`} />
            <InputText
              className={styles.inputSearchInput}
              value={playersFilter}
              onChange={(e) => setPlayersFilter(e.target.value)}
              placeholder={t("buttons.searchPlayer")}
            />
          </div>
          <DataTable
            value={season?.players || []}
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 20]}
            globalFilter={playersFilter}
            emptyMessage={t("seasons.cantFindPlayers")}
          >
            <Column field="first_name" header={t("players.name")} sortable />
            <Column field="last_name" header={t("players.surname")} sortable />
            <Column field="dni" header={t("players.dni")} sortable />
            <Column
              field="date_of_birth"
              header={t("players.birthDate")}
              body={(row) => row.date_of_birth?.split("T")[0]}
              sortable
            />
            <Column header="Docs" body={documentBody} />
          </DataTable>
        </TabPanel>

        {/* TAB Equipos */}
        <TabPanel header={t("seasons.teams")}>
          <div className={`${styles.inputSearchWrapper} p-mb-4`}>
            <i className={`pi pi-search ${styles.inputSearchIcon}`} />
            <InputText
              className={styles.inputSearchInput}
              value={playersFilter}
              onChange={(e) => setTeamsFilter(e.target.value)}
              placeholder={t("buttons.searchPlayer")}
            />
          </div>

          <DataTable
            value={season?.teams || []}
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 20]}
            globalFilter={teamsFilter}
            emptyMessage={t("seasons.cantFindTeams")}
          >
            <Column field="name" header={t("teams.team")} sortable />
            <Column field="coach_name" header={t("teams.trainer")} sortable />
            <Column field="category" header={t("teams.category")} sortable />
            <Column
              field="totalPlayers"
              header={t("teams.numberOfPlayers")}
              sortable
            />
          </DataTable>
        </TabPanel>

        {/* TAB Pagos */}
        <TabPanel header={t("dashboard.payments")}>
          <div className={`${styles.inputSearchWrapper} p-mb-4`}>
            <i className={`pi pi-search ${styles.inputSearchIcon}`} />
            <InputText
              className={styles.inputSearchInput}
              value={playersFilter}
              onChange={(e) => setPaymentsFilter(e.target.value)}
              placeholder={t("buttons.searchPlayer")}
            />
          </div>

          <DataTable
            value={season?.payments || []}
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 20]}
            globalFilter={paymentsFilter}
            emptyMessage={t("seasons.canFindPayments")}
          >
            <Column field="first_name" header={t("players.name")} sortable />
            <Column field="last_name" header={t("players.surname")} sortable />
            <Column
              field="totalDue"
              header={t("players.total")}
              body={(row) => Number(row.totalDue).toFixed(2)}
              sortable
            />
            <Column
              field="totalPaid"
              header={t("payments.payed")}
              body={(row) => Number(row.totalPaid).toFixed(2)}
              sortable
            />
            <Column field="status" header={t("seasons.status")} sortable />
            <Column header={t("seasons.actions")} body={payButtonBody} />
          </DataTable>
        </TabPanel>
      </TabView>
    </div>
  );
}
