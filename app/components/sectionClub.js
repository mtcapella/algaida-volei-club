"use client";

import i18n from "../i18nextInit.js";
import { useTranslation } from "react-i18next";

import styles from "./sectionclub.module.css";

export default function SectionClub() {
  return (
    <section className={styles.sectionClub} id="club">
      <h2>Club</h2>
      <div className={styles.grid}>
        <div className={styles.card}>
          <h3>Título Columna 1</h3>
          <p>
            Contenido descriptivo para la primera columna relacionado con el
            club. Aquí puedes poner información sobre la historia, misión o
            servicios del club.
          </p>
        </div>
        <div className={styles.card}>
          <h3>Título Columna 2</h3>
          <p>
            Contenido descriptivo para la segunda columna. Por ejemplo, detalles
            sobre instalaciones, actividades o noticias recientes del club.
          </p>
        </div>
      </div>
    </section>
  );
}
