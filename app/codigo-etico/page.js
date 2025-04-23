"use client";
import { useTranslation } from "react-i18next";

export default function CodigoEtico() {
  const { t } = useTranslation();
  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1>{t("legalPages.ethicCode.title")}</h1>
      {t("legalPages.ethicCode.sections", {
        returnObjects: true,
      }).map((section, index) => (
        <section key={index} style={{ marginBottom: "1.5rem" }}>
          <h2>{section.heading}</h2>
          <p style={{ whiteSpace: "pre-line" }}>{section.content}</p>
        </section>
      ))}
    </div>
  );
}
