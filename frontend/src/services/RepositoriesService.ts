export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
import {getUserID} from './SessionService';
import * as Types from '../types/types';

export async function deleteRepo(idRepo: string, idUtente:string): Promise<boolean>{
  const res = await fetch("http://localhost:3000/repo", {
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
  const res = await fetch(`http://localhost:3000/repos?userId=${id}`, {
    method: "GET",
    });

  if (!res.ok) {
    throw new Error("Utente non trovato");
  }

  const data = await res.json();
  return data;
};


export async function checkRepoAccess(url: string): Promise<boolean> {

  const idUtente = getUserID('userID');
  const res = await fetch("http://localhost:3000/repo", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({idUtente, url}),
    });

  if (!res.ok) {
    throw new Error("URL non valido");
  }

  return true;
}