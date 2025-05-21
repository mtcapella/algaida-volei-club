// upload.js
import { ref, uploadBytes } from "firebase/storage";
import { storage } from "./firebase"; // Asegúrate de que la ruta sea correcta

// Sube un archivo y devuelve solo el path (sin token)
export async function uploadFile(file, folder) {
  const filePath = `${folder}/${Date.now()}-${file.name}`;
  const fileRef = ref(storage, filePath);

  await uploadBytes(fileRef, file);

  // Devuelve solo el path relativo
  return filePath;
}
