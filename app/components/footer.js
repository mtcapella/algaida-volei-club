"use client";
import "primeicons/primeicons.css";
import { useTranslation } from "react-i18next";

import Link from "next/link";
import styles from "./footer.module.css";

export default function Footer() {
  const { i18n } = useTranslation();

  const changeLang = (lng) => {
    i18n.changeLanguage(lng);
    // opcionalmente guardar en localStorage o cookie
  };

  const { t } = useTranslation();

  return (
    <footer className={styles.footer}>
      <div className={styles.top}>
        {/* Iconos RRSS */}
        <div className={styles.socials}>
          <a
            href="https://facebook.com/algaidavolei"
            target="_blank"
            aria-label="Facebook"
          >
            <i className="pi pi-facebook" />
          </a>
          <a
            href="https://instagram.com/algaidavolei"
            target="_blank"
            aria-label="Instagram"
          >
            <i className="pi pi-instagram" />
          </a>
          <a
            href="https://twitter.com/algaidavolei"
            target="_blank"
            aria-label="Twitter"
          >
            <i className="pi pi-twitter" />
          </a>
        </div>
        {/* Selector de idioma */}
        <div className={styles.languages}>
          <button onClick={() => changeLang("es")}>ES</button>
          <button onClick={() => changeLang("ca")}>CA</button>
          <button onClick={() => changeLang("en")}>EN</button>
        </div>
      </div>

      <div className={styles.middle}>
        <p>© 2025 Algaida Volei Club</p>
        <p>Calle X, Ciudad, País</p>
        <p>
          <Link href="mailto:contacto@algaidavolei.es">
            contacto@algaidavolei.es
          </Link>{" "}
          | <Link href="tel:+34123456789">+34 123 456 789</Link>
        </p>
      </div>

      <div className={styles.bottom}>
        <Link href="/politica-privacidad">{t("footer.privatePolicy")}</Link>
        <Link href="/aviso-legal">{t("footer.legal")}</Link>
        <Link href="/cookies">{t("footer.cookies")}</Link>
      </div>
    </footer>
  );
}
