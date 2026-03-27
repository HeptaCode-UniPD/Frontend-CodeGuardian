import { useState } from 'react';
import { Link, useNavigate} from 'react-router-dom';
import { checkRepoValid, checkRepoAccess} from '../services/RepositoriesService';
import { useIsLogged} from '../services/SessionService';

const ErrorReport = ({loading, url, hasAccess, isValid} : { loading: boolean, url: string, hasAccess: boolean, isValid: boolean}) => (
  <div id="state-div">
    {loading && url && <p id="check-info"> Verifica informazioni...</p>}
    {!loading && isValid && url && !hasAccess && <p id="hint">Repository privato, impossibile importare.</p>}
  </div>
);

export default function AddRepository() {
    useIsLogged();
    const navigate = useNavigate();
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [isValid, setIsValid] = useState(true);
    const [hasAccess, setHasAccess] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const repo_valid = await checkRepoValid(url);
    setIsValid(repo_valid);
    if(repo_valid){
      const repo_access = await checkRepoAccess(url);
      if (repo_access) {
        navigate('/repositories');
      } else {
        setHasAccess(false);
      }
    }
    setLoading(false);
};

  return (
    <div id="add-repository-page">
      <h1>Aggiungi repository</h1>
      <form onSubmit={handleSubmit}>
        <legend>Aggiungi repository</legend>
        <div className="input-group">
          <label htmlFor="url-input">URL repository GitHub</label>
          <input id="url-input" name="url" value={url} onChange={(e) => {setUrl(e.target.value); setHasAccess(true); setIsValid(true)}} placeholder="URL"/>
        </div>

        {!loading && url && !isValid &&(
          <div className="error">
            <p>L'URL inserito non è valido.</p>
          </div>
        )}

        <ErrorReport loading={loading} url={url} hasAccess={hasAccess} isValid={isValid}/>

        <div id="form-actions">
          <Link to="/repositories" id="annulla">Annulla</Link>
          <button type="submit" disabled={!url || loading || !isValid}>
            Importa
          </button>
        </div>
      </form>
    </div>
  );
}
