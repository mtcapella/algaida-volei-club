"use client";

import React, { useState, useEffect, useRef } from "react";
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
import styles from "./pagos.module.css";

import { useTranslation } from "react-i18next";

export default function PaymentsPage() {
  const { t } = useTranslation();
  const [payments, setPayments] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const dt = useRef(null);
  const toast = useRef(null);

  // fetch pagos temporada actual
  const fetchPayments = async () => {
    setLoading(true);
    try {
      const base = process.env.NEXT_PUBLIC_DOMAIN;
      const res = await fetch(`${base}/api/payments/current`);
      if (!res.ok) throw new Error("Error al cargar pagos");
      const data = await res.json();
      // añade campo deuda precalculado (number)
      const withDebt = data.map((p) => ({
        ...p,
        debt: parseFloat(p.total_fee) - parseFloat(p.totalPaid),
      }));
      setPayments(withDebt);
    } catch (err) {
      console.error(err);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: t("payments.errorToloading"),
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  console.log(payments);
  /* ------------- update payment --------------- */
  const handleUpdatePayment = async (row) => {
    const confirm = window.confirm(
      `${t("payments.toUpdatePayment")} ${row.first_name} ${
        row.last_name
      }.\n${t("payments.thisActionCantBeUndo")}`
    );
    if (!confirm) return;

    try {
      setLoading(true);
      const base = process.env.NEXT_PUBLIC_DOMAIN;
      const res = await fetch(`${base}/api/payments/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId: row.playerId,
          amount: row.debt,
        }),
      });
      if (!res.ok) throw new Error("Error al actualizar el pago");
      toast.current?.show({
        severity: "success",
        summary: "Pago actualizado",
        detail: `${t("payments.thePayment")} ${row.first_name} ${
          row.last_name
        } ${t("payments.hasUpdated")}`,
        life: 3000,
      });
      fetchPayments();
    } catch (err) {
      console.error(err);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: t("payments.cantUpdatePayment"),
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  /* barra de herramietas */
  const leftToolbarTemplate = () => (
    <div className={styles.flexGap2}>
      <Button
        label={t("buttons.update")}
        icon="pi pi-refresh"
        className="p-button-secondary"
        onClick={fetchPayments}
        disabled={loading}
      />
      <Button
        label={t("buttons.exportCSV")}
        icon="pi pi-file"
        className="p-button-success"
        onClick={() => dt.current.exportCSV()}
        disabled={!payments.length}
      />
    </div>
  );

  /* ---------------- render ------------------- */
  if (loading && !payments.length) {
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
      <h1 className="mb-3 text-2xl font-semibold">
        {t("payments.paymentsForActualSeason")}
      </h1>

      <Toolbar className="p-mb-3" left={leftToolbarTemplate} />

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
        value={payments}
        paginator
        rows={10}
        rowsPerPageOptions={[5, 10, 20]}
        globalFilter={globalFilter}
        emptyMessage={t("payments.dontFindPayments")}
      >
        <Column field="first_name" header={t("payments.name")} sortable />
        <Column field="last_name" header={t("payments.name")} sortable />
        <Column field="dni" header={t("payments.dni")} sortable />
        <Column
          field="total_fee"
          header={t("payments.quote")}
          body={(row) => Number(row.total_fee).toFixed(2)}
          sortable
        />
        <Column
          field="totalPaid"
          header={t("payments.payed")}
          body={(row) => Number(row.totalPaid).toFixed(2)}
          sortable
        />
        <Column
          field="debt"
          header={t("payments.debt")}
          body={(row) => row.debt.toFixed(2)}
          sortable
        />
        <Column
          header={t("payments.actions")}
          body={(row) =>
            row.split_payment === 1 ? (
              <Button
                icon="pi pi-wallet"
                className="p-button-text p-button-warning"
                onClick={() => handleUpdatePayment(row)}
                tooltip={t("payments.updatePayment")}
                tooltipOptions={{ position: "top" }}
              />
            ) : null
          }
        />
      </DataTable>
    </div>
  );
}
