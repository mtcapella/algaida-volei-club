// ImageTokenContext.js
import React, { createContext, useEffect, useState } from "react";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { storage } from "@/libs/firebase"; // Tu configuración de Firebase

export const ImageTokenContext = createContext();

export const ImageTokenProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateToken = async () => {
      try {
        console.log("Generando token...");

        // Selecciona cualquier archivo válido (por ejemplo, un archivo de configuración)
        const fileRef = ref(storage, "images/sample.jpg"); // Cambia por cualquier archivo que sepas que existe

        const url = await getDownloadURL(fileRef);
        console.log("URL generada:", url);

        // Obtenemos solo el token del URL
        const tokenParam = new URL(url).searchParams.get("token");
        console.log("Token obtenido:", tokenParam);

        if (tokenParam) {
          setToken(tokenParam);
        } else {
          console.error("No se pudo obtener el token del URL.");
        }
      } catch (error) {
        console.error("Error generando token de imagen:", error);
      } finally {
        setLoading(false);
      }
    };

    generateToken();

    // Regenerar el token cada 15 minutos (900000 ms)
    const interval = setInterval(generateToken, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <ImageTokenContext.Provider value={{ token, loading }}>
      {children}
    </ImageTokenContext.Provider>
  );
};
