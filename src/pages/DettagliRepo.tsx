import { useState, useEffect } from 'react';
import { type AnalysisReport, type Repository} from '../data/types';
import { getLastAnalysis} from '../services/AnalysisService';
import { getRepositoryById} from '../services/RepositoriesService';
import { getUserID} from '../services/SessionService';
import { CircularProgress} from '../components/CircularProgress';
import { DeleteRepoButton} from '../components/DeleteRepoButton';
import { StartAnalysisButton} from '../components/StartAnalysisButton';
import { useParams, Link} from 'react-router-dom';
import { useIsLogged } from '../services/SessionService';

const InfoRepo = ({repository, userID}:{repository: Repository, userID:string}) => (
    <aside>
        <h1>{repository.name}</h1>
        <DeleteRepoButton repository={repository} userID={userID} messageButton='Elimina repository'/>
        <a href={repository.url} target="_blank">Vedi su GitHub</a>
        <Link to="/repositories">← Indietro</Link>
    </aside>
);

export default function DettagliRepo() {
    useIsLogged();
    const key = 'userID';
    const userID = (getUserID(key) ?? '');
    const { id } = useParams<{ id: string }>(); //recupero l'id dall'URL per capire che repo sto guardando
    const [analysis, setAnalysis] = useState<AnalysisReport | null>(null); // useState : crea una variabile di stato, quando viene cambiata, React se ne accorge e ridisegna il componente
    const [repository, setRepository] = useState<Repository | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const search_repository = await getRepositoryById(id);
            setRepository(search_repository ?? null);
            if (search_repository) {
                const result = await getLastAnalysis(search_repository.url);
                setAnalysis(result ?? null);
            }
        } catch {setAnalysis(null);} 
        finally {setLoading(false);}
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    if (loading) return <p>Caricamento...</p>;
    if (!repository) return <div id="repo-error">Repository selezionato non trovato. <Link to="/repositories">← Indietro</Link></div>;
 
    return (
        <div id="dettagli-repo">

            <InfoRepo repository={repository} userID={userID}/>

            <div id="details-repo-content">
                <div id="analisi-block">
                    <div>
                        <h2>Analisi</h2>
                        <ul id="report-percentage">
                            <li>
                                {/* <CircularProgress percentage={repository.pctTest} label="Copertura Test"/> */}
                            </li>
                            <li>
                                {/* <CircularProgress percentage={repository.pctDoc} label="Completezza Documentazione"/> */}
                            </li>
                            <li>
                                {/* <CircularProgress percentage={repository.pctOwasp} label="Correttezza OWASP"/> */}
                            </li>
                        </ul>
                        <StartAnalysisButton url={repository.url} onSuccess={fetchData}
                            initialJobId={analysis?.status === 'processing' ? analysis.commitId : undefined}/>
                    </div>
                </div>
                <div>
                    <h2> Suggerimenti proposti</h2>
                    {analysis? <p>{analysis.response}</p> : <p>Nessuna analisi disponibile. Avvia un'analisi per vedere i risultati.</p>}
                </div>
            </div>
        </div>
    );
}