"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/libs/firebase";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";

import { useTranslation } from "react-i18next";

import styles from "./login.module.css";

export default function Login() {
  const { t } = useTranslation();

  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { user: fbUser } = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      setUser(fbUser);
      setError("");
      // aquí rediriges al dashboard de backoffice:
      router.replace("/backvolei");
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <div className={styles.formcontainer}>
      <h2>{t("login.login")}</h2>
      {user ? (
        <>
          <p>Bienvenido, {user.email}</p>
          <button onClick={handleLogout}>{t("login.logout")}</button>
        </>
      ) : (
        <form onSubmit={handleLogin} className={styles.form}>
          <input
            type="email"
            placeholder={t("login.email")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder={t("login.password")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">{t("login.login")}</button>
          {error && <p style={{ color: "red" }}>{error}</p>}
        </form>
      )}
    </div>
  );
}
