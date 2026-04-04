// info utente
export interface User{
    userId: string,
    nome: string,
    cognome: string,
    email: string,
}

// info repository
export interface Repository{
    id: string,
    userID: string[], //un repository può essere aggiunto da più persone
    url: string,
    name: string
}

export interface AnalysisReport{
    id: string,
    status: string,
    response:string,
    commitId?: string;
}

export type AnalysisStatus = 'done' | 'processing' | 'error';

export interface StartAnalysisResponse {
    status: AnalysisStatus;
    jobId?: string;
    commitId?: string;
    repoUrl: string;
}