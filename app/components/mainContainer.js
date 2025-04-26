"use client";
import { usePathname } from "next/navigation";
import Navbar from "./navbar";
import Footer from "./footer";

export default function MainContainer({ children }) {
  const path = usePathname();
  // si empieza por /backvolei, no pinto ni nav ni footer
  const isAdmin = path?.startsWith("/backvolei");
  console.log("isAdmin", isAdmin, path);
  return (
    <>
      {!isAdmin && <Navbar />}
      {children}
      {!isAdmin && <Footer />}
    </>
  );
}
