export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
import * as Types from '../types/types';
import * as Mock from '../test/mock';

export async function getAnalysisPayload (id: string) {
    const dataAnalisi = await getAnalysisById(id);
    if (!dataAnalisi) return null;
    const [dataRemediation] = await Promise.all([
        getRemediationByRepoId(id),
    ]);

    return {
        repository: dataAnalisi,
        remediation: dataRemediation ?? []
    };
};

async function getAnalysisById (id: string): Promise<Types.Repository | undefined> {
  return new Promise((resolve) => {
    const found = Mock.mock_repositories.find(item => item.id === id);
    resolve(found);
    // const response = await fetch(`${API_URL}/repo/${id}`);
    // return response.json();
  });
};

async function getRemediationByRepoId (id: string): Promise<Types.AnalysisReport[] | undefined> {
  return new Promise((resolve) => {
    const found = Mock.mock_reports.filter(item => item.repositoryID === id);
    resolve(found);
    // const response = await fetch(`${API_URL}/repo/${id}`);
    // return response.json();
  });
};