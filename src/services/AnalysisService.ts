import * as Types from '../data/types';
import { get, post} from "../data/httpClient";
import { API_BASE_URL_ANALYSIS } from "../data/config";

export async function getLastAnalysis(repoUrl: string): Promise<Types.AnalysisReport> {
  return get<Types.AnalysisReport>(`${API_BASE_URL_ANALYSIS}/analysis/view?url=${repoUrl}`);
}

export async function startNewAnalysis(url: string): Promise<Types.StartAnalysisResponse> {
  return post<Types.StartAnalysisResponse>(`${API_BASE_URL_ANALYSIS}/analysis/request`, { repoUrl: url });
}

export async function pollAnalysisStatus(jobId: string): Promise<Types.AnalysisStatus> {
  const data = await get<{ status: Types.AnalysisStatus }>(`${API_BASE_URL_ANALYSIS}/analysis/status/${jobId}`);
  return data.status;
}