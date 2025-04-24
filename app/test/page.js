"use client";
import generateLOPD from "@/libs/lopdPdf";
import generateImageUse from "@/libs/imagePdf";

export default function TestPdfPage() {
  const testDataLOPD = {
    first_name: "Marta",
    last_name: "Pérez",
    dni: "12345678A",
    email: "marta@volei.com",
    phone: "612345678",
    guardianFirstName: "Laura",
    guardianLastName: "Gutiérrez",
    guardianDni: "87654321B",
    guardianPhone: "698765432",
    guardianEmail: "laura@volei.com",
    guardianRelationship: "Madre",
    acceptLOPD: true,
    acceptEthics: true,
    consentWeb: "yes",
    consentInstagram: "no",
    consentOthers: "no",
  };

  const testDataUsoImagen = {
    first_name: "Marta",
    last_name: "Pérez",
    dni: "12345678A",
    email: "marta@volei.com",
    phone: "612345678",
    guardianFirstName: "Laura",
    guardianLastName: "Gutiérrez",
    guardianDni: "87654321B",
    guardianPhone: "698765432",
    guardianEmail: "laura@volei.com",
    guardianRelationship: "Madre",
    acceptLOPD: true,
    acceptEthics: true,
    consentWeb: "no",
    consentInstagram: "no",
    consentOthers: "no",
  };

  const descargar = async (generateFn, datos) => {
    const file = await generateFn(datos);
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: 30 }}>
      <h1>Prueba de PDFs</h1>
      <button
        style={{ padding: 10, marginBottom: 20 }}
        onClick={() => descargar(generateLOPD, testDataLOPD)}
      >
        Descargar PDF LOPD
      </button>
      <br />
      <button
        style={{ padding: 10 }}
        onClick={() => descargar(generateImageUse, testDataUsoImagen)}
      >
        Descargar PDF Uso de Imagen
      </button>
    </div>
  );
}
