import { useState, useEffect, useMemo } from 'react';
import { type AnalysisReport, type Repository, AnalysisType} from '../types/types';
import { getAnalysisPayload} from '../services/AnalysisService';
import { RemediationCard} from '../components/RemediationCard';
import { CircularProgress} from '../components/CircularProgress';
import { useParams, Link} from 'react-router-dom';
import { useIsLogged } from '../services/SessionService';

interface GruppiRemediation {
  test?: AnalysisReport[];
  doc?: AnalysisReport[];
  owasp?: AnalysisReport[];
}

const RemediationSection = ({ title, items }: { title: string, items: AnalysisReport[] }) => (
  <li>
    <p>{items.length} file: {title}</p>
    {items.map((item) => (
      <details key={item.id}> 
        <summary>{item.path}:</summary>
        <dd> <RemediationCard remediation={item} /> </dd>
      </details>
    ))}
  </li>
);

const InfoRepo = ({repository}:{repository: Repository}) => (
    <aside>
        <h1>{repository.name}</h1>
        <p id="visibility">{repository.visibility}</p>
        <form id="delete-repo">
            <button>Elimina repository</button>
        </form>
        <a href={repository.url} target="_blank">Vedi su GitHub</a>
        <Link to="/repositories">← Indietro</Link>
    </aside>
);

export default function DettagliRepo() {
    useIsLogged();
    const { id } = useParams<{ id: string }>(); //recupero l'id dall'URL per capire che repo sto guardando
    const [repository, setRepository] = useState<Repository | null>(null); // useState : crea una variabile di stato, quando viene cambiata, React se ne accorge e ridisegna il componente
    const [remediation, setRemediation] = useState<AnalysisReport[] | null>([]);
    const [loading, setLoading] = useState(true);

    const gruppi = useMemo<GruppiRemediation>(() => ({
        test: remediation?.filter(r => r.type === AnalysisType.Test),
        doc: remediation?.filter(r => r.type === AnalysisType.Documentation),
        owasp: remediation?.filter(r => r.type === AnalysisType.Owasp)
    }), [remediation]);

    useEffect(() => {
        if(!id) return;

        const fetchData = async () => {
            setLoading(true);
            const result = await getAnalysisPayload(id);
            if (result) {
                setRepository(result.repository);
                setRemediation(result.remediation);}
            setLoading(false);}

        fetchData();
            
    }, [id]);

    if (loading) return <p>Caricamento...</p>;
    if (!repository) return <div id="repo-error">Analisi del repository selezionato non trovata. <Link to="/Repositories">← Indietro</Link></div>;
 
    return ( // TODO: i pulsanti dovranno cambiare a seconda se l'repository è avviata o meno
        <div id="dettagli-repo">

            <InfoRepo repository={repository}/>

            <div id="details-repo-content">
                <div id="analisi-block">
                    <div>
                        <h2>Analisi</h2>
                        <ul id="report-percentage">
                            <li>
                                <CircularProgress percentage={repository.pctTest} label="Copertura Test"/>
                            </li>
                            <li>
                                <CircularProgress percentage={repository.pctDoc} label="Completezza Documentazione"/>
                            </li>
                            <li>
                                <CircularProgress percentage={repository.pctOwasp} label="Correttezza OWASP"/>
                            </li>
                        </ul>
                        <form><button id="start-all">Avvia analisi</button></form>
                    </div>
                </div>

                <div id="remediation-block">
                    <h2> Motivazioni dei suggerimenti</h2>
                    <p id="reason">{repository.reason}</p>
                    <h2>{remediation?.length} file con suggerimento remediation</h2>
                    <ul id="remediation-list">
                        <RemediationSection title="Copertura test" items={gruppi.test ?? []} />
                        <RemediationSection title="Completezza documentazione" items={gruppi.doc ?? []} />
                        <RemediationSection title="Correttezza OWASP" items={gruppi.owasp ?? []} />
                    </ul>
                </div>
            </div>
        </div>
    );
}