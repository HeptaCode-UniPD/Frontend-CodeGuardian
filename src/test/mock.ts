import * as Types from '../types/types';

// Mock Utente
export const mock_user: Types.User[] = [
    {
        userId: "1",
        email: "developer@heptacode.it",
        nome: "Mario",
        cognome: "Rossi"
    },
    {
        userId: "2",
        email: "developer2@heptacode.it",
        nome: "Giulia",
        cognome: "Rossi"
    },
    {
        userId: "3",
        email: "developer3@heptacode.it",
        nome: "Anna",
        cognome: "Rossi"
    },
    {
        userId: "4",
        email: "developer4@heptacode.it",
        nome: "Matteo",
        cognome: "Rossi"
    },
]

// Mock Repository
export const mock_repositories: Types.Repository[] = [
    {
        id: "1",
        userID: ["1", "2"],
        url: "https://github.com/HeptaCode-UniPD/CodeGuardian",
        name: "CodeGuardian",
    },
    {
        id: "2",
        userID: ["1"],
        url: "https://github.com/HeptaCode-UniPD/PoC",
        name: "PoC",
    },
    {
        id: "3",
        userID: ["3"],
        url: "https://github.com/RepoSenzaRemediation",
        name: "RepoSenzaRemediation",
    }
];

// Mock Reports
export const mock_reports: Types.AnalysisReport[] = [
    {
        id: "1",
        status: "done",
        response: "Non vanno bene perché bla bla",
    },
    {
        id: "2",
        status: "done",
        response: "boh non lo so, non mi piace",
    },
    {
        id: "3",
        status: "processing",
        response: "",
        commitId: "abc123sha",
    }
];