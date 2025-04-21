import Navbar from "./components/navbar";
import "./i18nextInit.js";
import "./globals.css";
import Footer from "./components/footer";

import "primereact/resources/themes/saga-blue/theme.css"; // el tema que elijas
import "primereact/resources/primereact.min.css"; // estilos core de Primereact
import "primeicons/primeicons.css"; // los iconos de Primeicons

export const metadata = {
  title: "Algaida Volei Club",
  description: "TFG - Web Algaida Volei Club",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <Navbar />
        <main className="container">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
