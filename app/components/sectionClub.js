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
          {t("club.column1")
            .split("\n")
            .map((line, i) => (
              <p key={`col1-${i}`}>{line}</p>
            ))}
        </div>
        <div className={styles.card}>
          <h3>{t("club.titleColumn2")}</h3>
          {t("club.column2")
            .split("\n")
            .map((line, i) => (
              <p key={`col2-${i}`}>{line}</p>
            ))}
        </div>
      </div>
    </section>
  );
}
