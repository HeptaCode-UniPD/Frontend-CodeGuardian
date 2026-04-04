import {getUserID} from './SessionService';
import * as Types from '../data/types';
import { API_BASE_URL_USER } from "../data/config";
import { get, post, del} from "../data/httpClient";

export async function getRepositoriesByUser(id: string): Promise<Types.Repository[]> {
  return get<Types.Repository[]>(`${API_BASE_URL_USER}/repos?userId=${id}`);
}

export async function getRepositoryById(id: string): Promise<Types.Repository> {
  return get<Types.Repository>(`${API_BASE_URL_USER}/repo?repoId=${id}`);
}

export async function deleteRepo(idRepo: string, idUtente: string): Promise<boolean> {
  await del(`${API_BASE_URL_USER}/repo`, { idUtente, idRepo });
  return true;
}

export async function checkRepoAccess(url: string): Promise<boolean> {
  const idUtente = getUserID('userID');
  await post(`${API_BASE_URL_USER}/repo`, { idUtente, url }, { extractErrorMessage: true });
  return true;
}