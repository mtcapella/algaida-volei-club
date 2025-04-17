"use client";
import i18n from "../i18nextInit.js";
import { useTranslation } from "react-i18next";
import styles from "./SectionUbicacion.module.css";

export default function SectionUbicacion() {
  const { t } = useTranslation();
  return (
    <section id="ubicacion" className={styles.sectionUbicacion}>
      <h2 className={styles.title}>{t("location.title")}</h2>
      <div className={styles.mapContainer}>
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3075.8683944184713!2d2.890974484195515!3d39.562574933943985!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1297b92cc6690685%3A0x13772b2de2652e7f!2sPavell%C3%B3%20Andreu%20Trobat!5e0!3m2!1ses!2ses!4v1744924384391!5m2!1ses!2ses"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={t("location.mapTitle")}
        />
      </div>
    </section>
  );
}
