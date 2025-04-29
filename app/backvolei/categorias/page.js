"use client";

import React, { useEffect, useState, useRef } from "react";
import { Card } from "primereact/card";
import { ProgressSpinner } from "primereact/progressspinner";
import { Toast } from "primereact/toast";

import styles from "./categories.module.css";

import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

export default function CategoriesPage() {
  const toast = useRef(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "No se pudieron cargar las categorías",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.spinnerWrapper}>
        <ProgressSpinner />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Toast ref={toast} />
      <h1>Categorías</h1>
      <div className={styles.grid}>
        {categories.map((cat) => (
          <Card key={cat.id} title={cat.name} className={styles.card}>
            <p className="m-0 p-0">{cat.totalPlayers} Jugadores</p>
            <p className="m-0 p-0">{cat.totalTeams} Equipos</p>
            <p className={styles.percent}>{cat.percentage}% del total</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
