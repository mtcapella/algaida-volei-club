"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter, usePathname } from "next/navigation";
import { auth } from "@/libs/firebase";

export default function FirebaseAuthWrapper({ children }) {
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (fbUser) => {
      setUser(fbUser);
      setChecking(false);
    });
    return () => unsub();
  }, []);

  // Mientras esperamos a Firebase
  if (checking) return <p>Cargando…</p>;

  // Si no hay user Y no estamos ya en /backvolei/login, redirige al login
  if (!user && path !== "/backvolei/login") {
    router.replace("/backvolei/login");
    return null;
  }

  // Si hay user y estás en /backvolei/login, mándalo al dashboard
  if (user && path === "/backvolei/login") {
    router.replace("/backvolei");
    return null;
  }

  // En cualquier otro caso (login con user, o rutas protegidas con user)
  return <>{children}</>;
}
