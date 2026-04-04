import * as Types from '../data/types';
import { get, post} from "../data/httpClient";
import { API_BASE_URL_USER } from "../data/config";

export async function getInfoUserByID(id: string): Promise<Types.User> {
  return get<Types.User>(`${API_BASE_URL_USER}/profile?userId=${id}`);
}

export async function checkCredentials(email: string, password: string): Promise<Types.User> {
  return post<Types.User>(`${API_BASE_URL_USER}/auth/login`, { email, password });
}
