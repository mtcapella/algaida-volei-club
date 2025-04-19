"use client";

import Image from "next/image";
import styles from "./sectionInicio.module.css";

import i18n from "../i18nextInit.js";
import { useTranslation } from "react-i18next";

export default function SectionInicio() {
  const { t } = useTranslation();

  return (
    <section className={styles.sectionInicio}>
      <div className={styles.imageContainer}>
        <Image
          src="/img/hero.jpg"
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
