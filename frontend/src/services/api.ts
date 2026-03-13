export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface Analysis {
  _id: number;
  repoUrl: string;
  percentTest: number;
  percentDoc: number;
  percentOWASP: number;
  hystoryID: number;
  visibility: string;
}

export interface FileRemediation {
  _id: number;
  referenceID: number;
  fileUrl: string;
  newCode: string;
  type: string;
}

export const mockAnalysis: Analysis[] = [
  {
    _id: 1,
    repoUrl: "https://github.com/HeptaCode-UniPD/CodeGuardian",
    percentTest: 95,
    percentDoc: 80,
    percentOWASP: 100,
    hystoryID: 101,
    visibility: 'Public'
  },
  {
    _id: 2,
    repoUrl: "https://github.com/HeptaCode-UniPD/PoC",
    percentTest: 88,
    percentDoc: 90,
    percentOWASP: 95,
    hystoryID: 102,
    visibility: 'Public'
  }
];

export const mockRemediation: FileRemediation[] = [
  {
    _id: 1,
    referenceID: 1,
    fileUrl: "https://github.com/HeptaCode-UniPD/heptacode-unipd.github.io/blob/efad94ea89fe9e3cc44117e95f6ef241c5a52b28/docs/CC/documenti_candidatura/Lettera_di_Presentazione.typ",
    newCode: "ciao2",
    type: "Documentazione",
  },
  {
    _id: 2,
    referenceID: 1,
    fileUrl:"https://github.com/HeptaCode-UniPD/heptacode-unipd.github.io/blob/efad94ea89fe9e3cc44117e95f6ef241c5a52b28/docs/RTB/documenti/Analisi_requisiti_v2.0.0.typ",
    newCode: "ciao2",
    type: "Documentazione",
  }
];




export const api = {
  getAnalysisById: async (id: number): Promise<Analysis | undefined> => {
    return new Promise((resolve) => {
      const found = mockAnalysis.find(item => item._id === id);
      resolve(found);
      // const response = await fetch(`${API_URL}/repo/${id}`);
      // return response.json();
    });
  },

  //qua devo restituire un array
  getRemediationByRepoId: async (id: number): Promise<FileRemediation[] | undefined> => {
    return new Promise((resolve) => {
      const found = mockRemediation.filter(item => item.referenceID === id);
      resolve(found);
      // const response = await fetch(`${API_URL}/repo/${id}`);
      // return response.json();
    });
  }
};