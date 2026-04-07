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

export interface AnalysisDetails{
    agentName?: string; //test, docs, owasp
    summary?:string;
    report?:string; 
}

export interface AnalysisReport{
    repoUrl?: string;
    jobId?:string;
    commitId?:string;
    status: AnalysisStatus;
    analysisDetails?: AnalysisDetails[];
    scores?:number[];
    date:Date;
    isLatest:boolean;
    error?: string;
}

export type AnalysisStatus = 'done' | 'processing' | 'error';

export interface StartAnalysisResponse {
    status: AnalysisStatus;
    jobId?: string;
    commitId?: string;
    repoUrl: string;
}