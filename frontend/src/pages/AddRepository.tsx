import { useState } from 'react';
import { Link, useNavigate} from 'react-router-dom';
import { checkRepoAccess} from '../services/RepositoriesService';
import { useIsLogged} from '../services/SessionService';

const ErrorReport = ({loading, url, hasAccess, errorMessage} : { loading: boolean, url: string, hasAccess: boolean, errorMessage:string}) => (
  <div id="state-div">
    {loading && url && <p id="check-info"> Verifica informazioni...</p>}
    {!loading && url && !hasAccess && <p id="hint">{errorMessage}</p>}
  </div>
);

export default function AddRepository() {
    useIsLogged();
    const navigate = useNavigate();
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [hasAccess, setHasAccess] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try{
      const repo_access = await checkRepoAccess(url);
      setHasAccess(repo_access);
      setLoading(false);
      navigate('/repositories');
    }catch(err:any){
      setHasAccess(false);
      setLoading(false);
      setErrorMessage(err.message);
    }
  };

  return (
    <div id="add-repository-page">
      <h1>Aggiungi repository</h1>
      <form onSubmit={handleSubmit}>
        <legend>Aggiungi repository</legend>
        <div className="input-group">
          <label htmlFor="url-input">URL repository GitHub</label>
          <input id="url-input" name="url" value={url} onChange={(e) => {setUrl(e.target.value); setHasAccess(true);}} placeholder="URL"/>
        </div>

        <ErrorReport loading={loading} url={url} hasAccess={hasAccess} errorMessage={errorMessage}/>

        <div id="form-actions">
          <Link to="/repositories" id="annulla">Annulla</Link>
          <button type="submit" disabled={!url || loading}>
            Importa
          </button>
        </div>
      </form>
    </div>
  );
}
