import jsPDF from "jspdf";

// Cargar imagen como base64
function loadImageAsBase64(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous"; // importante para evitar CORS
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL("image/jpeg");
      resolve(dataURL);
    };
    img.onerror = reject;
    img.src = url;
  });
}

// Generar el PDF
export default async function generateLOPD(data) {
  const {
    first_name,
    last_name,
    dni,
    email,
    phone,
    guardianFirstName,
    guardianLastName,
    guardianDni,
    guardianPhone,
    guardianEmail,
  } = data;

  const nombreCompleto = `${first_name} ${last_name}`;
  const tutorCompleto = `${guardianFirstName} ${guardianLastName}`;
  const fecha = new Date().toLocaleDateString();

  // Crear PDF A4
  const doc = new jsPDF("p", "pt", "a4");

  // Cargar imagen de fondo
  const background = await loadImageAsBase64(
    "/img/plantillas/plantilla_lopd.jpg"
  );
  doc.addImage(background, "JPEG", 0, 0, 595.28, 841.89); // tamaño A4 en puntos

  // Añadir texto sobre el fondo (ajusta coordenadas a tu plantilla real)
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(12);

  doc.text(nombreCompleto, 86, 190);
  doc.text(dni, 48, 215);
  doc.text(email, 52, 245);
  doc.text(phone, 336, 245);

  if (guardianFirstName && guardianLastName) {
    doc.text(tutorCompleto, 130, 285);
    doc.text(guardianDni, 48, 312);
    doc.text(guardianPhone, 336, 340);
    doc.text(guardianEmail, 52, 338);
  }

  // si el campo guardianFirstName y guardianLastName no estan vacios, entonces se firma el tutor
  if (guardianFirstName && guardianLastName) {
    doc.text(tutorCompleto, 30, 782);
    doc.text(guardianDni, 30, 800);
    doc.text(`Fecha: ${fecha}`, 170, 800);
  } else {
    doc.text(nombreCompleto, 30, 782);
    doc.text(dni, 30, 800);
    doc.text(`Fecha: ${fecha}`, 170, 800);
  }

  // Exportar como Blob para descarga o subida
  const pdfBlob = doc.output("blob");
  const file = new File([pdfBlob], `consentimiento_lopd_${dni}.pdf`, {
    type: "application/pdf",
  });

  return file;
}
