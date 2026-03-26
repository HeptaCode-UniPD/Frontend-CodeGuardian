export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
import * as Types from '../types/types';
import * as Mock from '../test/mock';

export async function getInfoUserByID(id: string): Promise<Types.User | undefined> {
  return new Promise((resolve) => {
    const found = Mock.mock_user.find(item => item.id === id);
    resolve(found);
  });
};

export async function getIDbyEmail(email: string): Promise<string> {
  await delay(1000);
  return "1";
}

//temporanea todo
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export async function checkEmailValid(email: string): Promise<boolean> {
  await delay(1000);
  return true;
}

export async function checkCredentials(email: string, pw: string): Promise<boolean> {
  await delay(1000);
  return true;
}
