export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
import * as Types from '../types/types';

export async function getInfoUserByID(id: string): Promise<Types.User | undefined> {
  const res = await fetch(`http://localhost:3000/profile?userId=${id}`, {
    method: "GET",
  });

  if (!res.ok) {
    throw new Error("Utente non trovato");
  }

  const data = await res.json();
  return data;
};

export async function checkCredentials(email: string, password: string): Promise<Types.User> {
  const res = await fetch("http://localhost:3000/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
    });

  if (!res.ok) {
    throw new Error("Credenziali non valide");
  }

  const data = await res.json();
  return data;
}
