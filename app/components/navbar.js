"use client";

import i18n from "../i18nextInit.js";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { usePathname } from "next/navigation";

import styles from "./navbar.module.css";

export default function Navbar() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <nav className={styles.navbar}>
      {/* Logo */}
      <div className={styles.logo}>
        <Image src="/img/logo.png" alt="Logo" width={100} height={100} />
      </div>

      {/* Desktop Navigation */}
      <div className={styles.desktopNav}>
        <Link href="/">
          <span className={styles.link}>{t("nav.home")}</span>
        </Link>
        <Link href="/#club">
          <span className={styles.link}>{t("nav.club")}</span>
        </Link>
        <Link href="/#ubicacion">
          <span className={styles.link}>{t("nav.location")}</span>
        </Link>
        <Link href="/#sponsors">
          <span className={styles.link}>{t("nav.sponsors")}</span>
        </Link>
        <Link href="/inscription">
          <span className={styles.link}>{t("nav.inscription")}</span>
        </Link>
      </div>

      {/* Mobile Navigation */}
      <div className={styles.mobileNav}>
        <Link href={isHome ? "/inscription" : "/"}>
          <span className={styles.link}>
            {isHome ? t("nav.inscription") : t("nav.home")}
          </span>
        </Link>
      </div>
    </nav>
  );
}
