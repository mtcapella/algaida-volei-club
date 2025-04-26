"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

import styles from "./backLayout.module.css";

import { auth } from "@/libs/firebase";
import { signOut } from "firebase/auth";

export default function BackLayout({ children, onLogout }) {
  const path = usePathname(); // para saber la ruta actual y aplicar estilos
  const router = useRouter(); // para redirigir al usuario después de cerrar sesión

  // helper para aplicar estilos a los enlaces
  const linkClass = (href) =>
    `${styles.link} ${path === href ? styles.active : ""}`;

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <Image src="/img/logo.jpg" alt="Logo" width={50} height={50} />
        </div>
        <nav>
          <ul>
            <li>
              <Link href="/backvolei" className={linkClass("/backvolei")}>
                <i className={`pi pi-chart-bar ${styles.menuIcon}`}></i>
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                href="/backvolei/jugadores"
                className={`${styles.link} ${
                  path.startsWith("/backvolei/jugadores") ? styles.active : ""
                }`}
              >
                <i className={`pi pi-users ${styles.menuIcon}`}></i>
                Jugadores
              </Link>
            </li>
            <li>
              <Link
                href="/backvolei/equipos"
                className={`${styles.link} ${
                  path.startsWith("/backvolei/equipos") ? styles.active : ""
                }`}
              >
                <i className={`pi pi-briefcase ${styles.menuIcon}`}></i>
                Equipos
              </Link>
            </li>
            <li>
              <Link
                href="/backvolei/categorias"
                className={`${styles.link} ${
                  path.startsWith("/backvolei/categorias") ? styles.active : ""
                }`}
              >
                <i className={`pi pi-tags ${styles.menuIcon}`}></i>
                Categorías
              </Link>
            </li>
            <li>
              <Link
                href="/backvolei/temporadas"
                className={`${styles.link} ${
                  path.startsWith("/backvolei/temporadas") ? styles.active : ""
                }`}
              >
                <i className={`pi pi-calendar ${styles.menuIcon}`}></i>
                Temporadas
              </Link>
            </li>
            <li>
              <Link
                href="/backvolei/ajustes"
                className={`${styles.link} ${
                  path.startsWith("/backvolei/ajustes") ? styles.active : ""
                }`}
              >
                <i className={`pi pi-cog ${styles.menuIcon}`}></i>
                Ajustes
              </Link>
            </li>
          </ul>
          <div className={styles.logout}>
            <button
              className={styles.logoutButton}
              onClick={onLogout}
              type="button"
            >
              <i className={`pi pi-sign-out ${styles.menuIcon}`}></i>
              Cerrar sesión
            </button>
          </div>
        </nav>
      </aside>

      <div className={styles.content}>
        <header className={styles.header}>
          <h1>Panel Administrativo</h1>
        </header>
        <section className={styles.body}>{children}</section>
      </div>
    </div>
  );
}
