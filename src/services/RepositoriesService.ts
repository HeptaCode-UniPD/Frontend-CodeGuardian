export const API_URL = import.meta.env.VITE_API_URL || '${API_BASE_URL_USER}';
import {getUserID} from './SessionService';
import * as Types from '../types/types';
import { API_BASE_URL_USER } from "../config";

export async function deleteRepo(idRepo: string, idUtente:string): Promise<boolean>{
  const res = await fetch(`${API_BASE_URL_USER}/repo`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({idUtente, idRepo}),
    });

  if (!res.ok) {
    throw new Error(`Repository non trovato con idRepo: ${idRepo} e idUtente: ${idUtente}`);
  }

  return true;
}


export async function getRepositoriesByUser(id: string): Promise<Types.Repository[] | undefined> {
  const res = await fetch(`${API_BASE_URL_USER}/repos?userId=${id}`, {
    method: "GET",
    });

  if (!res.ok) {
    throw new Error("Utente non trovato");
  }

  const data = await res.json();
  return data;
};

export async function getRepositoryById(id: string): Promise<Types.Repository | undefined> {
  const res = await fetch(`${API_BASE_URL_USER}/repo?repoId=${id}`, {
    method: "GET",
    });

  if (!res.ok) {
    throw new Error("Repository non trovato");
  }

  const data = await res.json();
  return data;
};

export async function checkRepoAccess(url: string): Promise<boolean> {

  const idUtente = getUserID('userID');
  const res = await fetch(`${API_BASE_URL_USER}/repo`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({idUtente, url}),
    });

  if (!res.ok) {
    let errorMessage = "Errore sconosciuto";
    let statusCode = res.status;

    try {
      const errorData = await res.json();
      errorMessage = errorData.message || errorMessage;
    } catch (e) {
      errorMessage = res.statusText;
    }
    const error: any = new Error(errorMessage);
    error.status = statusCode;
    throw error;
  }

  return true;
}