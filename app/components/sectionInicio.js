"use client";

import Image from "next/image";
import styles from "./SectionInicio.module.css";

import i18n from "../i18nextInit.js";
import { useTranslation } from "react-i18next";

export default function SectionInicio() {
  const { t } = useTranslation();

  return (
    <section className={styles.sectionInicio}>
      <div className={styles.imageContainer}>
        {/* Utilizamos el componente Image con layout fill para cubrir el contenedor */}
        <Image
          src="/img/logo.jpg" // Por ahora usamos el logo provisional; luego lo cambias
          alt="Algaida Volei Club"
          fill
          className={styles.backgroundImage}
        />
        <div className={styles.overlay}>
          <h1>{t("home.title")}</h1>
        </div>
      </div>
    </section>
  );
}
