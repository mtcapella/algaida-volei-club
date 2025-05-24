import jwt from "jsonwebtoken";

// inportamos el secret desde las variables de entorno
const SECRET = process.env.JWT_SECRET || "supersecretkey"; // clave secreta para firmar el token
const EXPIRY = "8h"; // caducidad que quieras

// generamos un token con el payload que nos pasen
export function signToken(payload) {
  // payload mínimo: { uid, email }
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRY });
}

// verificamos el token y devolvemos el payload
export function verifyToken(token) {
  return jwt.verify(token, SECRET); // lanza error si no es válido
}
