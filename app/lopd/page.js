"use client";
import { useEffect } from "react";
import generateLOPD from "@/libs/lopdPdf";

export default function LopdClient() {
  useEffect(() => {
    const test = async () => {
      const pdf = await generateLOPD({
        first_name: "John",
        last_name: "Doe",
        dni: "12345678A",
        email: "john@doe.com",
        phone: "123456789",
        guardianFirstName: "Jane",
        guardianLastName: "Doe",
        guardianDni: "87654321B",
        guardianPhone: "987654321",
        guardianEmail: "jane@doe.com",
      });

      const url = URL.createObjectURL(pdf);
      const a = document.createElement("a");
      a.href = url;
      a.download = pdf.name;
      a.click();
      URL.revokeObjectURL(url);
    };

    test();
  }, []);

  return <p>Generando PDF y descargando...</p>;
}
