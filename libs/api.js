// libs/api.js  (o tu helper de fetch)
import { getAuth } from "firebase/auth";

export async function api(path, options = {}) {
  const auth = getAuth();
  const user = auth.currentUser;

  // ── 1. coge el token si hay usuario conectado ──
  let headers = options.headers || {};
  if (user) {
    const token = await user.getIdToken(); // <- Firebase lo emite
    headers = { ...headers, Authorization: `Bearer ${token}` };
  }

  // ── 2. dispara el fetch ──
  return fetch(path.startsWith("/") ? path : `/api/${path}`, {
    ...options,
    headers,
  });
}
