"use client";

import i18n from "../i18nextInit.js";
import { useTranslation } from "react-i18next";

import styles from "./sectionclub.module.css";

export default function SectionClub() {
  const { t } = useTranslation();

  return (
    <section className={styles.sectionClub} id="club">
      <h2>{t("club.title")}</h2>
      <div className={styles.grid}>
        <div className={styles.card}>
          <h3>{t("club.titleColumn1")}</h3>
          <p>{t("club.column1")}</p>
        </div>
        <div className={styles.card}>
          <h3>{t("club.titleColumn2")}</h3>
          <p>{t("club.column2")}</p>
        </div>
      </div>
    </section>
  );
}
