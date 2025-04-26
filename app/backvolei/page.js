import styles from "./dashboard.module.css";

export default async function Dashboard() {
  // obtenemos los datos del dashboard desde la API
  // usando la cache no-store para que siempre se obtengan los datos actualizados

  const res = await fetch("http://localhost:3000/api/dashboard", {
    cache: "no-store",
  });
  const {
    totalPlayers,
    totalTeams,
    porcentajePagado,
    porcentajePendiente,
    jugadoresPorCategoria,
  } = await res.json();

  return (
    <>
      <h2>Dashboard General</h2>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <i className={`pi pi-users ${styles.statIcon}`}></i>
          <div className={styles.statTitle}>Jugadores Totales</div>
          <div className={styles.statValue}>{totalPlayers}</div>
        </div>
        <div className={styles.statCard}>
          <i className={`pi pi-briefcase ${styles.statIcon}`}></i>
          <div className={styles.statTitle}>Equipos Totales</div>
          <div className={styles.statValue}>{totalTeams}</div>
        </div>
        <div className={styles.statCard}>
          <i className={`pi pi-money-bill ${styles.statIcon}`}></i>
          <div className={styles.statTitle}>% Pagado</div>
          <div className={styles.statValue}>{porcentajePagado}%</div>
        </div>
        <div className={styles.statCard}>
          <i className={`pi pi-clock ${styles.statIcon}`}></i>
          <div className={styles.statTitle}>% Pendiente</div>
          <div className={styles.statValue}>{porcentajePendiente}%</div>
        </div>
      </div>

      <section className={styles.categoryList}>
        <h3>Jugadores por Categoría</h3>
        {jugadoresPorCategoria.map(({ category, totalPlayers }) => (
          <div key={category} className={styles.categoryItem}>
            • {category}: {totalPlayers}
          </div>
        ))}
      </section>
    </>
  );
}
