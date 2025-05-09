async function verifyOCR(dni, imageFile) {
  const formData = new FormData();
  formData.append("dni", dni); // El DNI que el usuario ha escrito.
  formData.append("image", imageFile); // El archivo de imagen.

  try {
    const response = await fetch("https://tudominio.com/ocr.php", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    console.log("Resultado OCR:", data);

    if (data.valid) {
      alert("El DNI/NIE es válido y coincide con la imagen.");
      return true;
    } else {
      alert("El DNI/NIE no coincide con la imagen. Verifica que esté claro.");
      return false;
    }
  } catch (error) {
    alert("Error al verificar el OCR. Inténtalo de nuevo.");
    console.error("Error OCR:", error);
    return false;
  }
}
