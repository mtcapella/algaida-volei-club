"use client";
import React from "react";
import { useState } from "react";
import { auth } from "../../libs/firebase";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";

//console.log("auth", auth);

export default function Backvolei() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log("credenciales", email, password);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("user", userCredential.user);
      setUser(userCredential.user);
      setError("");
    } catch (error) {
      console.error(error.message);
      setError(error.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <div>
      <h2>Login</h2>
      {user ? (
        <>
          <p>Bienvenido, {user.email}</p>
          <button onClick={handleLogout}>Cerrar sesión</button>
        </>
      ) : (
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Iniciar sesión</button>
        </form>
      )}
    </div>
  );
}
