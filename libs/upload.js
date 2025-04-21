import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebaseClient";

// sube un archivo a Firebase Storage y devuelve la URL pública
export async function uploadFile(file, folder = "dnis") {
  const fileRef = ref(storage, `${folder}/${Date.now()}-${file.name}`);

  // sube el blob
  await uploadBytes(fileRef, file);

  // devuelve la URL pública
  return getDownloadURL(fileRef);
}
