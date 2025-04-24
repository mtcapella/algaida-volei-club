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
export default async function generateImageUse(data) {
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

  console.log("Datos recibidos:", data);

  const nombreCompleto = `${first_name} ${last_name}`;
  const tutorCompleto = `${guardianFirstName} ${guardianLastName}`;
  const fecha = new Date().toLocaleDateString();

  // Crear PDF A4
  const doc = new jsPDF("p", "pt", "a4");

  // Cargar imagen de fondo
  const background = await loadImageAsBase64(
    "/img/plantillas/plantilla_uso.jpg"
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
    doc.text(tutorCompleto, 240, 285);
    doc.text(guardianDni, 48, 312);
    doc.text(guardianPhone, 336, 340);
    doc.text(guardianEmail, 52, 338);
  }

  // checkbox de consentimiento
  if (data.consentWeb === "yes") {
    doc.text("X", 460, 588);
  } else {
    doc.text("X", 532, 588);
  }
  if (data.consentInstagram === "yes") {
    doc.text("X", 460, 615);
  } else {
    doc.text("X", 532, 615);
  }
  if (data.consentOthers === "yes") {
    doc.text("X", 460, 640);
  } else {
    doc.text("X", 532, 640);
  }
  // si el campo guardianFirstName y guardianLastName no estan vacios, entonces se firma el tutor
  if (guardianFirstName && guardianLastName) {
    // formulario de consentimiento
    doc.text(tutorCompleto, 180, 678);
    doc.text(guardianDni, 40, 705);
    // firmar del tutor
    doc.text(tutorCompleto, 30, 750);
    doc.text(guardianDni, 30, 780);
    doc.text(`Fecha: ${fecha}`, 100, 780);
  } else {
    // formulario de consentimiento
    doc.text(nombreCompleto, 180, 678);
    doc.text(dni, 40, 705);
    // firmar del jugador
    doc.text(nombreCompleto, 30, 750);
    doc.text(dni, 30, 780);
    doc.text(`Fecha: ${fecha}`, 100, 780);
  }

  // Exportar como Blob para descarga o subida
  const pdfBlob = doc.output("blob");
  const file = new File([pdfBlob], `consentimiento_uso_imagenes_${dni}.pdf`, {
    type: "application/pdf",
  });

  return file;
}
