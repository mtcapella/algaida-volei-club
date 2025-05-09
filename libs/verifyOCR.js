// utils/ocrHelper.js
import Tesseract from "tesseract.js";

// Expresión regular para DNI/NIE
const dniRegex = /([XYZ]?)(\d{7,8})([A-Z])/;

export const verifyOCR = async (imageFile) => {
  try {
    const { data } = await Tesseract.recognize(imageFile, "spa", {
      logger: (m) => console.log(m), // Ver el progreso en consola
    });

    const textDetected = data.text.trim().toUpperCase();
    console.log("Texto detectado:", textDetected);

    // Buscar el DNI/NIE en el texto detectado
    const match = textDetected.match(dniRegex);
    if (match) {
      const detectedDNI = match[0];
      console.log("DNI/NIE detectado por OCR:", detectedDNI);
      return detectedDNI;
    } else {
      console.log("No se detectó ningún DNI/NIE válido.");
      return null;
    }
  } catch (error) {
    console.error("Error en OCR:", error);
    return null;
  }
};
