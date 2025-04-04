"use client";

import i18n from "../i18nextInit.js";
import { useTranslation } from "react-i18next";

export default function Navbar() {
  const { t } = useTranslation();
  return (
    <nav>
      <span>{t("home")}</span>
      <span>{t("club")}</span>
      <span>{t("location")}</span>
      <span>{t("sponsors")}</span>
      <span>{t("registrations")}</span>
    </nav>
  );
}
