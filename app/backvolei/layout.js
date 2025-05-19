// app/backvolei/layout.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/libs/firebase";
import BackLayout from "@/app/components/backLayout";
import { ImageTokenProvider } from "@/app/components/imageTokenProvider";

export default function BackvoleiLayout({ children }) {
  const [user, setUser] = useState(undefined);
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (fbUser) => {
      setUser(fbUser);
    });
    return () => unsub();
  }, []);

  // 1) Mientras Firebase determina el estado:
  if (user === undefined) {
    return <div>Cargando...</div>;
  }

  // 2) Si no hay user y NO estamos en /backvolei/login, forzamos login
  if (!user && path !== "/backvolei/login") {
    router.replace("/backvolei/login");
    return null;
  }

  // 3) Si no hay user y SÍ estamos en /backvolei/login, dejamos que se renderice el login
  if (!user && path === "/backvolei/login") {
    return <>{children}</>;
  }

  // 4) Si hay user y estás en /backvolei/login, te mandamos al dashboard
  if (user && path === "/backvolei/login") {
    router.replace("/backvolei");
    return null;
  }

  // 5) Ya estamos logeados y NO es la página de login: mostramos el BackLayout
  return (
    <BackLayout
      onLogout={async () => {
        await signOut(auth);
        router.replace("/backvolei/login");
      }}
    >
      <ImageTokenProvider>{children}</ImageTokenProvider>
    </BackLayout>
  );
}
