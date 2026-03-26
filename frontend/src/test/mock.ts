import * as Types from '../types/types';

// --- mock ---

// Mock Utente
export const mock_user: Types.User[] = [
    {
        id: "1",
        email: "developer@heptacode.it",
        password: "1234",
        nome: "Mario",
        cognome: "Rossi"
    },
    {
        id: "2",
        email: "developer2@heptacode.it",
        password: "1234",
        nome: "Giulia",
        cognome: "Rossi"
    },
    {
        id: "3",
        email: "developer3@heptacode.it",
        password: "1234",
        nome: "Anna",
        cognome: "Rossi"
    },
    {
        id: "4",
        email: "developer4@heptacode.it",
        password: "1234",
        nome: "Matteo",
        cognome: "Rossi"
    },
]

// Mock Insights
const mock_insights1: Types.AnalysisInsight = {
    summary: "Il repository segue bene le convenzioni di naming, ma mancano i test di integrazione.",
    strengths: ["Ottima documentazione interna", "Clean Code", "Modularità"],
    weakness: ["Copertura test bassa", "Dipendenze obsolete"],
    analysisID: "1"
};

const mock_insights2: Types.AnalysisInsight = {
    summary: "PoC funzionale, ma con diverse vulnerabilità OWASP rilevate nelle dipendenze.",
    strengths: ["Velocità di esecuzione", "Logica chiara"],
    weakness: ["Hardcoded secrets", "Mancanza di HTTPS"],
    analysisID: "2"
};

// Mock Repository
export const mock_repositories: Types.Repository[] = [
    {
        id: "1",
        userID: ["1", "2"],
        url: "https://github.com/HeptaCode-UniPD/CodeGuardian",

        visibility: "public",
        name: "CodeGuardian",
        pctTest: 80,
        pctDoc: 90,
        pctOwasp: 40,

        reason:"non andavano bene"
    },
    {
        id: "2",
        userID: ["1"],
        url: "https://github.com/HeptaCode-UniPD/PoC",

        visibility: "private",
        name: "PoC",
        pctTest: 60,
        pctDoc: 79,
        pctOwasp: 90,

        reason:"non andavano bene"
    },
    {
        id: "3",
        userID: ["3"],
        url: "https://github.com/RepoSenzaRemediation",

        visibility: "private",
        name: "RepoSenzaRemediation",
        pctTest: 0,
        pctDoc: 0,
        pctOwasp: 0,

        reason:"non andavano bene"
    }
];

// Mock Reports
export const mock_reports: Types.AnalysisReport[] = [
    {
        id: "1",
        repositoryID: "1",
        status: Types.AnalysisStatus.Done,
        insight: mock_insights1,
        type: Types.AnalysisType.Test,

        originalCode: `import React from 'react';
        const App = () => {
        return <div>Ciao</div>;
        };`,
                
                newCode: `import React from 'react';
        const App = () => {
        return <div>Ciao mondo!</div>; // Riga modificata
        };`,
        path: "src/components/comp1.tsx"
    },
    {
        id: "2",
        repositoryID: "1",
        status: Types.AnalysisStatus.Failed,
        insight: mock_insights2,
        type: Types.AnalysisType.Owasp,

        originalCode: `// Funzione di prova
        function test() {
            console.log("esecuzione...");
        }`,
                newCode: `// Funzione di prova
        // Log rimosso per sicurezza
        function test() {
        }`,
        path: "src/components/comp2.tsx"
    }
];