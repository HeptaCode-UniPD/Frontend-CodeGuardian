export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
import * as Types from '../types/types';
import * as Mock from '../test/mock';

export async function getRepositoriesByUser(id: string): Promise<Types.Repository[] | undefined> {
  const repositories = Mock.mock_repositories.filter(item => 
    Array.isArray(item.userID) ? item.userID.includes(id) : item.userID === id);
  return repositories;
};

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export async function checkRepoValid(url: string): Promise<boolean> {
  // const response = await fetch(`${API_URL}/check-privacy`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ repoUrl: url }),
  // });

  // if (!response.ok) throw new Error('Errore server');
  
  // return response.json(); 
  await delay(1000);
  return true;
}

export async function checkRepoAccess(url: string): Promise<boolean> {
  // const response = await fetch(`${API_URL}/check-privacy`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ repoUrl: url }),
  // });

  // if (!response.ok) throw new Error('Errore server');
  // return response.json(); 

  await delay(1000);
  return true;
}