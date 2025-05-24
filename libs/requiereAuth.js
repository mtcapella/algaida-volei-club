import { verifyToken } from "./authToken.js";

export function requireAuth(req) {
  const auth = req.headers.get("authorization") || "";
  if (!auth.startsWith("Bearer ")) throw new Error("NO_TOKEN");

  const token = auth.split(" ")[1];
  try {
    return verifyToken(token); // devuelve { uid, email, iat, exp }
  } catch (err) {
    throw new Error("BAD_TOKEN");
  }
}
