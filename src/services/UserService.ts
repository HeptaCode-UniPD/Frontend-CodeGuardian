import * as Types from '../types/types';
import { API_BASE_URL_USER } from "../config";

export async function getInfoUserByID(id: string): Promise<Types.User | undefined> {
  const res = await fetch(`${API_BASE_URL_USER}/profile?userId=${id}`, {
    method: "GET",
  });

  if (!res.ok) {
    throw new Error("Utente non trovato");
  }

  const data = await res.json();
  return data;
};

export async function checkCredentials(email: string, password: string): Promise<Types.User> {
  const res = await fetch(`${API_BASE_URL_USER}/auth/login`, {
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
