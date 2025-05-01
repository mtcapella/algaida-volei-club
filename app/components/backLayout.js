"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import styles from "./backLayout.module.css";

export default function BackLayout({ children, onLogout }) {
  const path = usePathname();
  const router = useRouter();
  const [teams, setTeams] = useState([]);

  const isClient = typeof window !== "undefined"; // ← Añadido para prevenir render SSR conflictivo

  const linkClass = (href) =>
    `${styles.link} ${path === href ? styles.active : ""}`;

  useEffect(() => {
    // Solo cargamos los equipos si estamos en /backvolei/equipos
    if (path.startsWith("/backvolei/equipos")) {
      fetch("/api/teams")
        .then((res) => res.json())
        .then((data) => setTeams(data))
        .catch((error) => console.error("Error cargando equipos:", error));
    }
  }, [path]);

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
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                href="/backvolei/jugadores"
                className={
                  path.startsWith("/backvolei/jugadores")
                    ? styles.active
                    : styles.link
                }
              >
                Jugadores
              </Link>
            </li>
            <li>
              <Link
                href="/backvolei/equipos"
                className={
                  path.startsWith("/backvolei/equipos")
                    ? styles.active
                    : styles.link
                }
              >
                Equipos
              </Link>

              {/* Submenú dinámico de equipos */}
              {isClient &&
                path.startsWith("/backvolei/equipos") &&
                teams.length > 0 && (
                  <ul className={styles.submenu}>
                    {teams.map((team) => (
                      <li key={team.id}>
                        <Link
                          href={`/backvolei/equipos/${team.id}`}
                          className={
                            path === `/backvolei/equipos/${team.id}`
                              ? styles.activeSub
                              : styles.sublink
                          }
                        >
                          {team.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
            </li>
            <li>
              <Link
                href="/backvolei/categorias"
                className={
                  path.startsWith("/backvolei/categorias")
                    ? styles.active
                    : styles.link
                }
              >
                Categorías
              </Link>
            </li>
            <li>
              <Link
                href="/backvolei/temporadas"
                className={
                  path.startsWith("/backvolei/temporadas")
                    ? styles.active
                    : styles.link
                }
              >
                Temporadas
              </Link>
            </li>
            <li>
              <Link
                href="/backvolei/ajustes"
                className={
                  path.startsWith("/backvolei/ajustes")
                    ? styles.active
                    : styles.link
                }
              >
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
