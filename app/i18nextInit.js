"use client";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Backend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import translationCA from "./../public/locales/ca.json";
import translationES from "./../public/locales/es.json";
import translationEN from "./../public/locales/en.json";

const fallbackLng = ["ca"];
const availableLanguages = ["ca", "es"];

const resources = {
  ca: {
    translation: translationCA,
  },
  es: {
    translation: translationES,
  },
  en: { translation: translationEN },
};

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    react: {
      useSuspense: false, //
    },
    resources,
    fallbackLng,

    detection: {
      checkWhitelist: true,
    },

    debug: false,

    whitelist: availableLanguages,

    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
