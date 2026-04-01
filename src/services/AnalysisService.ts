export const API_URL = import.meta.env.VITE_API_URL || '${API_BASE_URL_USER}';
import * as Types from '../types/types';

export async function getAnalysisByUrl (url: string): Promise<Types.AnalysisReport | undefined> {
  const res = await fetch(`http://localhost:4000/analysis/request`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url}),
    });

  if (!res.ok) {
    throw new Error("Repository non trovato.");
  }

  const data = await res.json();
  return data;
};