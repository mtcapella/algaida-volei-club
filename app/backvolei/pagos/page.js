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

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const dt = useRef(null);
  const toast = useRef(null);

  /* ---------------- fetch helpers ---------------- */
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
        detail: "No se pudieron cargar los pagos.",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  /* ------------- update payment --------------- */
  const handleUpdatePayment = async (row) => {
    const confirm = window.confirm(
      `Vas a actualizar el pago de ${row.first_name} ${row.last_name}.\nEsta acción es irreversible. ¿Continuar?`
    );
    if (!confirm) return;

    try {
      setLoading(true);
      const base = process.env.NEXT_PUBLIC_DOMAIN;
      const res = await fetch(`${base}/api/payments/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId: row.playerId }),
      });
      if (!res.ok) throw new Error();
      toast.current?.show({
        severity: "success",
        summary: "Pago actualizado",
        detail: `El pago de ${row.first_name} ${row.last_name} ha sido marcado como completado.`,
        life: 3000,
      });
      fetchPayments();
    } catch (err) {
      console.error(err);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "No se pudo actualizar el pago.",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- toolbar ------------------- */
  const leftToolbarTemplate = () => (
    <div className="flex gap-2">
      <Button
        label="Refrescar"
        icon="pi pi-refresh"
        className="p-button-secondary"
        onClick={fetchPayments}
        disabled={loading}
      />
      <Button
        label="Exportar CSV"
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
      <h1 className="mb-3 text-2xl font-semibold">Pagos temporada actual</h1>

      <Toolbar className="p-mb-3" left={leftToolbarTemplate} />

      <div className="p-input-icon-left p-mb-3">
        <i className="pi pi-search" />
        <InputText
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Buscar jugador..."
        />
      </div>

      <DataTable
        ref={dt}
        value={payments}
        paginator
        rows={10}
        rowsPerPageOptions={[5, 10, 20]}
        globalFilter={globalFilter}
        emptyMessage="No se encontraron pagos."
      >
        <Column field="first_name" header="Nombre" sortable />
        <Column field="last_name" header="Apellido" sortable />
        <Column field="dni" header="DNI" sortable />
        <Column
          field="total_fee"
          header="Cuota (€)"
          body={(row) => Number(row.total_fee).toFixed(2)}
          sortable
        />
        <Column
          field="totalPaid"
          header="Pagado (€)"
          body={(row) => Number(row.totalPaid).toFixed(2)}
          sortable
        />
        <Column
          field="debt"
          header="Deuda (€)"
          body={(row) => row.debt.toFixed(2)}
          sortable
        />
        <Column
          header="Acciones"
          body={(row) =>
            row.split_payment === 1 ? (
              <Button
                icon="pi pi-wallet"
                className="p-button-text p-button-warning"
                onClick={() => handleUpdatePayment(row)}
                tooltip="Actualizar pago"
                tooltipOptions={{ position: "top" }}
              />
            ) : null
          }
        />
      </DataTable>
    </div>
  );
}
