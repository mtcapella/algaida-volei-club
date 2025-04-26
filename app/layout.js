import Navbar from "./components/navbar";
import "./i18nextInit.js";
import "./globals.css";

import "primereact/resources/themes/saga-blue/theme.css"; // el tema que elijas
import "primereact/resources/primereact.min.css"; // estilos core de Primereact
import "primeicons/primeicons.css"; // los iconos de Primeicons
import MainContainer from "./components/mainContainer";

export const metadata = {
  title: "Algaida Volei Club",
  description: "TFG - Web Algaida Volei Club",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <MainContainer>
          <main className="container">{children}</main>
        </MainContainer>
      </body>
    </html>
  );
}
