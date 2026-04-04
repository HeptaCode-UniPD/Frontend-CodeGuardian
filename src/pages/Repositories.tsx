import { Link } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { getRepositoriesByUser } from '../services/RepositoriesService';
import { useIsLogged, getUserID } from '../services/SessionService';
import { DeleteRepoButton } from '../components/DeleteRepoButton';
import { type Repository } from '../data/types';

export default function Repositories() {
  useIsLogged();
  const key = 'userID';
  const id = (getUserID(key) ?? '');
  const [loading, setLoading] = useState(true);
  const [repositories, setRepositories] = useState<Repository[] | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      setLoading(true);
      const result = await getRepositoriesByUser(id);
      if (result) setRepositories(result);
      setLoading(false);
    };
    fetchData();
  }, [id]);

  const filteredRepositories = useMemo(() =>
    repositories?.filter(r =>r.name.toLowerCase().includes(search.toLowerCase())) ?? [], [repositories, search]);

  if (loading) return <p>Caricamento...</p>;
  if (!repositories) return <div>La ricerca dei repository non è andata a buon fine. <Link to="/Repositories">Riprova</Link></div>;

  return (
    <div id="repositories-page">
      <aside>
        <input id="search-bar" type="search" placeholder="Trova un repository..." value={search} onChange={e => setSearch(e.target.value)} />
        <Link to="/addRepository">+ Aggiungi repository</Link>
      </aside>

      <article>
        {repositories.length === 0 ? (
          <p id="no-repo">Non è ancora stato inserito alcun repository.</p>) : (<>
            <ul>
              {filteredRepositories.map((item) => (
                <li key={item.id}>
                  <div className="containerLink">
                    <Link to={`/repository/${item.id}`}><span>{item.name}</span></Link>
                    <DeleteRepoButton repository={item} userID={id} onDeleted={() => setRepositories(prev => prev?.filter(r => r.id !== item.id) ?? null)} />
                  </div>
                </li>))}
            </ul>
            {filteredRepositories.length === 0 && search && (<p id="no-repo">Nessun repository trovato per "{search}".</p>)}</>)}
      </article>
    </div>
  );
}