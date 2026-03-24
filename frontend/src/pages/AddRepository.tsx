import { useEffect, useState } from 'react';
import { Link, useNavigate} from 'react-router-dom';
import { checkRepoValid, checkRepoToken, checkRepoAccess} from '../services/RepositoriesService';
import { isLogged} from '../services/SessionService';

const ErrorReport = ({loading, url, hasAccess, isValid, tokenError} : { loading: boolean, url: string, hasAccess: boolean, isValid: boolean, tokenError:boolean}) => (
  <div>
    {loading && url && <p id="loading"> Verifica informazioni...</p>}
    { !loading && url && !hasAccess && <p id="hint">Il repository è privato. Inserisci il tuo Personal Access Token per continuare.</p>}
    {isValid && tokenError && (<p className='error'>Il token inserito non è valido.</p>)}
  </div>
);

export default function AddRepository() {
  isLogged();
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const [hasAccess, setHasAccess] = useState(true);
  const [tokenError, setTokenError] = useState(false);

  useEffect(() => {

    const checkDelay = setTimeout(async () => {
      setLoading(true);
      setHasAccess(false);
      try {
        const result_valid = await checkRepoValid(url);
        setIsValid(result_valid);

        if (result_valid) {
          const result_has_access = await checkRepoAccess(url);
          setHasAccess(result_has_access);
        }

      } catch (err) {
        console.error("Errore nel controllo");
      } finally {
        setLoading(false);
      }
    }, 500);
    return () => clearTimeout(checkDelay); //reset del timer
  }, [url]);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setTokenError(false);

    const response = await checkRepoToken(url, token);

    if (response) {
      navigate('/repositories');
    } else {
      setTokenError(true);
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
          <input id="url-input" name="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="URL" className={!isValid ? 'error' : ''}/>
        </div>

        {!loading && url && !isValid &&(
          <div className="error">
            <p>L'URL inserito non è valido.</p>
          </div>
        )}

        { !loading && url && !hasAccess &&(
          <div id="token-section">
            <label htmlFor="token-input">Inserisci il Personal Token</label>
            <input id="token-input" value={token} onChange={(e) => setToken(e.target.value)}/>
          </div>
        )}

        <ErrorReport loading={loading} url={url} hasAccess={hasAccess} isValid={isValid} tokenError={tokenError}/>

        <div id="form-actions">
          <Link to="/repositories" id="annulla">Annulla</Link>
          <button type="submit" disabled={loading || !isValid || (!hasAccess && !token)}>
            Importa
          </button>
        </div>
      </form>
    </div>
  );
}
