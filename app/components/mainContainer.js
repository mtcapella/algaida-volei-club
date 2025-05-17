"use client";
import { usePathname } from "next/navigation";
import Navbar from "./navbar";
import Footer from "./footer";
import styles from "./mainContainer.module.css";

export default function MainContainer({ children }) {
  const path = usePathname();
  const isAdmin = path?.startsWith("/backvolei");

  return (
    <div className={styles.wrapper}>
      {!isAdmin && <Navbar />}
      <div className={styles.content}>{children}</div>
      {!isAdmin && <Footer />}
    </div>
  );
}
