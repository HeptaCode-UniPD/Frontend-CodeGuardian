// info utente
export interface User{
    userId: string,
    nome: string,
    cognome: string,
    email: string,
}

// stato dell'analisi
export enum AnalysisStatus {
    Pending = 'pending',
    Running = 'running',
    Done = 'done',
    Failed = 'failed',
}

// report prodotto dell'analisi
export interface AnalysisInsight {
    summary: string,
    strengths: string[],
    weakness: string[],
    analysisID: string,
}

// tipologia di avvio analisi
export enum AnalysisType {
    Documentation = 'documentation',
    Owasp = 'owasp',
    Test = 'test',
}

// report dell'analisi
export interface AnalysisReport{
    id: string,
    repositoryID: string, //non ho messo userID, non credo serva
    status: AnalysisStatus,
    insight: AnalysisInsight,
    type: AnalysisType,

    originalCode: string,
    newCode: string,
    path: string
}

// info repository
export interface Repository{
    id: string,
    userID: string[], //un repository può essere aggiunto da più persone
    url: string,
    name: string,
    // pctTest: number,
    // pctDoc: number,
    // pctOwasp: number,

    // reason:string
}