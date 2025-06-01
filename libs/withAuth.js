import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

// helper para añadir el token de Firebase a las peticiones para no tener que pasarlo en cada una

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}
const adminAuth = getAuth();

//Lanza error si no hay token o es inválido
export async function requireFirebaseUser(req) {
  const auth = req.headers.get("authorization") || "";
  if (!auth.startsWith("Bearer ")) throw new Error("NO_TOKEN");
  const token = auth.split(" ")[1];
  return await adminAuth.verifyIdToken(token); // { uid, email, … }
}
