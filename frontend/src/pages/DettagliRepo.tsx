import React, { useState, useEffect } from 'react';
import { type FileRemediation, type Analysis, api} from '../services/api';
import { getRepoInfo, getFileInfo, checkRepoVisibility} from '../utils/GitHubUtils';
import { RemediationCard} from '../components/RemediationCard';
import { CircularProgress} from '../components/CircularProgress';
import { useParams, Link } from 'react-router-dom';
// import { api, API_URL, type Analysis } from '../services/api'; // Importa API_URL

export default function DettagliRepo() {

    const { id } = useParams<{ id: string }>(); //recupero l'id dall'URL per capire che repo sto guardando
    const [analisi, setAnalisi] = useState<Analysis | null>(null);
    const [visibilita, setVisibilita] = useState<string>("Caricamento...");
    const [remediation, setRemediation] = useState<FileRemediation[] | null>([]);
    //come funziona, dato che poi lo dimentico:
    // useState : crea una variabile di stato, quando viene cambiata, React se ne accorge e ridisegna il componente
    // analisi e setAnalisi : ciò che restituisce useState, il primo è la variabile che contiene i dati attuali,  la seconda
    //                        è l'unica funzione che ha il permesso di usare per cambiare di valore 'analisi'
    //Analysis[] : l'interfaccia utilizzata, i dati di 'analisi' devono rispettare il suo formato
    //(mockAnalysis) : valore iniziale appena la pagina viene caricata (per ora sono valori finti per provare il frontend)
    const [loading, setLoading] = useState(true);
    //come funziona qeusto pezzo:
    //loading è booleano e false il valore iniziale perché non devo ottenere dati da DB, poi lo dovrò mettere a true



    // mi serve per recuperare i dati (da quanto dice Gemini, poi controllo meglio)
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                const dataAnalisi = await api.getAnalysisById(Number(id));
                
                if (dataAnalisi) {
                    setAnalisi(dataAnalisi);

                    const [dataRemediation, repoStatus] = await Promise.all([
                        api.getRemediationByRepoId(Number(id)),
                        checkRepoVisibility(dataAnalisi.repoUrl)
                    ]);

                    setRemediation(dataRemediation ?? []);
                    setVisibilita(repoStatus);
                }
            } catch (err) {
                console.error("Errore nel recupero dati:", err);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchData();
    }, [id]);

    if (loading) return <p>Caricamento...</p>;
    if (!analisi) return <div>Analisi del repository selezionato non trovata. <Link to="/Repositories">← Indietro</Link></div>;

    const conteggi = remediation?.reduce((acc: Record<string, number>, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1;
    return acc;
    }, { Test: 0, Documentazione: 0, OWASP: 0 });

    const totale = (conteggi?.Test ?? 0) + 
               (conteggi?.Documentazione ?? 0) + 
               (conteggi?.OWASP ?? 0);

    // TODO: i pulsanti per avviare analisi e la visualizzazione della remediation proposta cambia a seconda dello stato dell'
    //analisi, se è in corso i pulsanti non saranno cliccabili e la remediation avrà uno stato di caricamento    
    return (
        <div id="dettagli-repo">
            <aside>
                <h1>{getRepoInfo(analisi.repoUrl).repoName}</h1>
                <p id="visibility" className={visibilita}>{visibilita}</p>
                <form id="delete-repo">
                    <button>Elimina repository</button>
                </form>
                <a href={analisi.repoUrl} target="_blank">Vedi su GitHub</a>
                <Link to="/Repositories">← Indietro</Link>
            </aside>

            <div id="details-repo-content">
                <div id="analisi-block">
                    <div>
                        <h2>Analisi</h2>
                        <ul id="report-percentage">
                            <li>
                                <CircularProgress percentage={analisi.percentTest} label="Copertura Test"/>
                                <form><button>Avvia analisi test</button></form>
                            </li>
                            <li>
                                <CircularProgress percentage={analisi.percentDoc} label="Completezza Documentazione"/>
                                <form><button>Avvia analisi documentaizone</button></form>
                            </li>
                            <li>
                                <CircularProgress percentage={analisi.percentOWASP} label="Correttezza OWASP"/>
                                <form><button>Avvia analisi OWASP</button></form>
                            </li>
                        </ul>
                        <form><button id="start-all">Avvia tutte le analisi</button></form>
                    </div>
                </div>

                <div id="remediation-block">
                    <h2>{totale} file con suggerimento remediation</h2>
                    <ul id="remediation-list">
                        <li>
                            <p>{conteggi?.Test} file: Copertura test</p>
                            {remediation?.filter(r => r.type === "Test")?.map((item: FileRemediation) => (
                                <details key={item._id}> 
                                    <summary>{getFileInfo(item.fileUrl).filePath}:</summary>
                                    <dd> <RemediationCard key={item._id} remediation={item} /> </dd>
                                </details>
                            ))}
                        </li>

                        <li>
                            <p>{conteggi?.Documentazione} file: Completezza documentaizone</p>
                            {remediation?.filter(r => r.type === "Documentazione")?.map((item: FileRemediation) => (
                                <details key={item._id}> 
                                    <summary>{getFileInfo(item.fileUrl).filePath}:</summary>
                                    <dd> <RemediationCard key={item._id} remediation={item} /> </dd>
                                </details>
                            ))}
                        </li>

                        <li>
                            <p>{conteggi?.OWASP} file: Correttazza OWASP</p>
                            {remediation?.filter(r => r.type === "Test")?.map((item: FileRemediation) => (
                                <details key={item._id}> 
                                    <summary>{getFileInfo(item.fileUrl).filePath}:</summary>
                                    <dd> <RemediationCard key={item._id} remediation={item} /> </dd>
                                </details>
                            ))}
                        </li>

                    </ul>
                </div>

            </div>

        </div>

    );
}