"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Skeleton } from "primereact/skeleton";

import { useTranslation } from "react-i18next";

import styles from "./backLayout.module.css";

export default function BackLayout({ children, onLogout }) {
  const { t } = useTranslation();

  const path = usePathname();
  const router = useRouter();
  const [teams, setTeams] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingTitle, setLoadingTitle] = useState(true);
  const [season, setSeason] = useState([]);

  const isClient = typeof window !== "undefined"; //  Añadido para prevenir render SSR conflictivo

  const linkClass = (href) =>
    `${styles.link} ${path === href ? styles.active : ""}`;

  const getTeams = async () => {
    setLoading(true); // setLoading a true para que se muestre el skeleton
    fetch("/api/teams", {
      cache: "no-store", // para que no use el cache
    })
      .then((res) => res.json())
      .then((data) => setTeams(data))
      .then(() => setLoading(false)) // setLoading a false para que no se muestre el skeleton
      .catch((error) => console.error("Error cargando equipos:", error));
  };
  const getSeasons = async () => {
    setLoading(true); // setLoading a true para que se muestre el skeleton
    fetch("/api/seasons", {
      cache: "no-store", // para que no use el cach e
    })
      .then((res) => res.json())
      .then((data) => setSeasons(data))
      .then(() => setLoading(false)) // setLoadingTitle a false para que no se muestre el skeleton
      .catch((error) => console.error("Error cargando temporadas:", error));
  };

  const getSeason = async () => {
    fetch("/api/seasons/active", {
      cache: "no-store", // para que no use el cach e
    })
      .then((res) => res.json())
      // setLoading a false para que no se muestre el skeleton
      .then((data) => setSeason(data[0]))
      .then(() => setLoadingTitle(false)) // setLoadingTitle a false para que no se muestre el skeleton
      .catch((error) => console.error("Error cargando temporadas:", error));
  };

  useEffect(() => {
    getSeason(); // Cargamos la temporada activa al cargar el componente
    // Solo cargamos los equipos si estamos en /backvolei/equipos
    if (path.startsWith("/backvolei/equipos")) {
      getTeams();
    }
    // Solo cargamos las temporadas si estamos en /backvolei/temporadas
    if (path.startsWith("/backvolei/temporadas")) {
      getSeasons();
    }
  }, [path]);

  console.log(season.name);
  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <Image src="/img/logo_w.png" alt="Logo" width={100} height={100} />
        </div>
        <nav>
          <ul>
            <li>
              <Link href="/backvolei" className={linkClass("/backvolei")}>
                {t("backNavbar.dashboard")}
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
                {t("backNavbar.players")}
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
                {t("backNavbar.teams")}
              </Link>

              {/* Submenú dinámico de equipos */}
              {loading && isClient && path.startsWith("/backvolei/equipos") && (
                <ul className={`${styles.submenu} ${styles.submenuLoading}`}>
                  <li>
                    <Skeleton width="10rem" className="mb-2"></Skeleton>
                  </li>
                  <li>
                    <Skeleton width="10rem" className="mb-2"></Skeleton>
                  </li>
                  <li>
                    <Skeleton width="10rem" className="mb-2"></Skeleton>
                  </li>
                  <li>
                    <Skeleton width="10rem" className="mb-2"></Skeleton>
                  </li>
                </ul>
              )}
              {!loading &&
                isClient &&
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
                {t("backNavbar.categories")}
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
                {t("backNavbar.seasons")}
              </Link>

              {/* Submenú dinámico de temporadas */}
              {loading &&
                isClient &&
                path.startsWith("/backvolei/temporadas") && (
                  <ul className={`${styles.submenu} ${styles.submenuLoading}`}>
                    <li>
                      <Skeleton width="10rem" className="mb-2"></Skeleton>
                    </li>
                    <li>
                      <Skeleton width="10rem" className="mb-2"></Skeleton>
                    </li>
                    <li>
                      <Skeleton width="10rem" className="mb-2"></Skeleton>
                    </li>
                    <li>
                      <Skeleton width="10rem" className="mb-2"></Skeleton>
                    </li>
                  </ul>
                )}
              {!loading &&
                isClient &&
                path.startsWith("/backvolei/temporadas") &&
                seasons.length > 0 && (
                  <ul className={styles.submenu}>
                    {seasons.map(
                      (season) =>
                        // si is_active es 1, no lo mostramos ya que es una temporada activa
                        season.is_active == !1 && (
                          <li key={season.id}>
                            <Link
                              href={`/backvolei/temporadas/${season.id}`}
                              className={
                                path === `/backvolei/temporadas/${season.id}`
                                  ? styles.activeSub
                                  : styles.sublink
                              }
                            >
                              {season.name}
                            </Link>
                          </li>
                        )
                    )}
                  </ul>
                )}
            </li>
            <li>
              <Link
                href="/backvolei/pagos"
                className={
                  path.startsWith("/backvolei/pagos")
                    ? styles.active
                    : styles.link
                }
              >
                {t("backNavbar.payments")}
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
                {t("backNavbar.settings")}
              </Link>
            </li>
          </ul>

          <div className={styles.logout}>
            <button
              className={styles.logoutButton}
              onClick={onLogout}
              type="button"
            >
              {t("backNavbar.logOut")}
            </button>
          </div>
        </nav>
      </aside>

      <div className={styles.content}>
        <header className={styles.header}>
          <h1>
            {loadingTitle && <Skeleton width="21rem" height="2.3rem" />}
            {!loadingTitle && season && season.name}
          </h1>
        </header>
        <section className={styles.body}>{children}</section>
      </div>
    </div>
  );
}
