import { useState, useEffect, useMemo } from 'react';
import { type FileRemediation, type Analysis, api, /*API_URL*/} from '../services/api';
import { getRepoInfo, getFileInfo} from '../utils/GitHubUtils';
import { RemediationCard} from '../components/RemediationCard';
import { CircularProgress} from '../components/CircularProgress';
import { useParams, Link } from 'react-router-dom';

const RemediationSection = ({ title, items }: { title: string, items: FileRemediation[] }) => (
  <li>
    <p>{items.length} file: {title}</p>
    {items.map((item) => (
      <details key={item._id}> 
        <summary>{getFileInfo(item.fileUrl).filePath}:</summary>
        <dd> <RemediationCard remediation={item} /> </dd>
      </details>
    ))}
  </li>
);

const InfoRepo = ({analisi}:{analisi: Analysis}) => {
    return(
        <aside>
            <h1>{getRepoInfo(analisi.repoUrl).repoName}</h1>
            <p id="visibility">{analisi.visibility}</p>
            <form id="delete-repo">
                <button>Elimina repository</button>
            </form>
            <a href={analisi.repoUrl} target="_blank">Vedi su GitHub</a>
            <Link to="/Repositories">← Indietro</Link>
        </aside>
    )
};

const getAnalysisPayload = async (id: string) => {
    const dataAnalisi = await api.getAnalysisById(Number(id));
    if (!dataAnalisi) return null;
    const [dataRemediation] = await Promise.all([
        api.getRemediationByRepoId(Number(id)),
    ]);

    return {
        analisi: dataAnalisi,
        remediation: dataRemediation ?? []
    };
};

export default function DettagliRepo() {
    const { id } = useParams<{ id: string }>(); //recupero l'id dall'URL per capire che repo sto guardando
    const [analisi, setAnalisi] = useState<Analysis | null>(null); // useState : crea una variabile di stato, quando viene cambiata, React se ne accorge e ridisegna il componente
    const [remediation, setRemediation] = useState<FileRemediation[] | null>([]);
    const [loading, setLoading] = useState(true);

    const gruppi = useMemo(() => ({
        test: remediation?.filter(r => r.type === "Test"),
        doc: remediation?.filter(r => r.type === "Documentazione"),
        owasp: remediation?.filter(r => r.type === "OWASP")
    }), [remediation]);

    useEffect(() => {
        if(!id) return;
        const fetchData = async () => {
            try {
                setLoading(true);
            const result = await getAnalysisPayload(id);
            if (result) {
                setAnalisi(result.analisi);
                setRemediation(result.remediation);
            }} catch (err) {
                console.error("Errore nel recupero dati:", err);
            } finally { setLoading(false); }
        };
        if (id) fetchData();
    }, [id]);

    if (loading) return <p>Caricamento...</p>;
    if (!analisi) return <div>Analisi del repository selezionato non trovata. <Link to="/Repositories">← Indietro</Link></div>;
 
    return ( // TODO: i pulsanti dovranno cambiare a seconda se l'analisi è avviata o meno
        <div id="dettagli-repo">

            <InfoRepo analisi={analisi}/>

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