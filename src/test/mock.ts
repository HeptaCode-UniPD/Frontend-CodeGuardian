import * as Types from '../data/types';

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
        status: 'done',
        repoUrl: 'https://github.com/HeptaCode-UniPD/CodeGuardian',
        jobId: 'job-1',
        commitId: 'abc123sha',
        date: new Date('2026-04-06T17:16:20.753Z'),
        scores: [85, 85, 0],
        analysisDetails: [
            { agentName: 'owasp', summary: 'Buona copertura OWASP', report: '# Report OWASP\nGlobal Maturity Score: 85' },
            { agentName: 'test', summary: 'Buona copertura test', report: '# Report Test\nGlobal Maturity Score: 85' },
            { agentName: 'docs', summary: 'Documentazione assente', report: '# Report Docs\nGlobal Maturity Score: 0' },
        ],
        isLatest:false,
    },
    {
        status: 'done',
        repoUrl: 'https://github.com/HeptaCode-UniPD/PoC',
        jobId: 'job-2',
        commitId: 'def456sha',
        date: new Date('2026-04-05T10:00:00.000Z'),
        scores: [70, 60, 50],
        analysisDetails: [
            { agentName: 'owasp', summary: 'Rischi medi', report: '# Report OWASP\nGlobal Maturity Score: 70' },
        ],
        isLatest:false,
    },
    {
        status: 'processing',
        repoUrl: 'https://github.com/HeptaCode-UniPD/CodeGuardian',
        jobId: 'job-3',
        commitId: 'ghi789sha',
        date: new Date('2026-04-06T18:00:00.000Z'),
        isLatest:false,
    },
];