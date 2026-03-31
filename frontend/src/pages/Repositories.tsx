import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { getRepositoriesByUser, deleteRepo} from '../services/RepositoriesService';
import { useIsLogged, getUserID} from '../services/SessionService';
import { type Repository} from '../types/types';

export default function Repositories() {
  useIsLogged();
  const key = 'userID';
  const id = (getUserID(key) ?? '');
  const [loading, setLoading] = useState(true);
  const [repositories, setRepositories] = useState<Repository[] | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [selectedItem, setSelectedItem] = useState<Repository | null>(null);
  const errorDialogRef = useRef<HTMLDialogElement>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
      if(!id) return;
      
      const fetchData = async () => {
        setLoading(true);
        const result = await getRepositoriesByUser(id);
        if (result) {setRepositories(result);}
        setLoading(false); };

      fetchData();
  }, [id]);

  if (loading) return <p>Caricamento...</p>;
  if (!repositories) return <div>La ricerca dei repository non è andata a buon fine. <Link to="/Repositories">Riprova</Link></div>;
 
  const openDialog = (e: React.MouseEvent, item: Repository) => {
    e.preventDefault();
    setSelectedItem(item);
    dialogRef.current?.showModal();
  };

  const handleConfirm = async () => {
    if (!selectedItem || !id) return;

    try {
        await deleteRepo(selectedItem.id, id);
        setRepositories(prev => prev?.filter(r => r.id !== selectedItem.id) ?? null);
        dialogRef.current?.close();
    } catch (error) {
        dialogRef.current?.close();
        console.error("Errore durante l'eliminazione:", error);
        setErrorMessage(`Errore durante l'eliminazione del repository ${selectedItem.name}.`);
        errorDialogRef.current?.showModal();
    }
  };

  return (
    <div id="repositories-page">
      <aside>
        <Link to="/addRepository">+ Aggiungi repository</Link>
      </aside>
      <ul>
        {repositories?.map((item) => (
          <li key={item.id}>
            <Link to={`/repository/${item.id}`}>
              <span>{item.name}</span>
              <button aria-label="elimina" className="delete-button" onClick={(e) => openDialog(e, item)}></button>
            </Link>
          </li>
        ))}
      </ul>

      <dialog ref={dialogRef}>
        <p>Sei sicuro di voler eliminare {selectedItem?.name}?</p>
        <div>
          <button onClick={handleConfirm}>Conferma</button>
          <button onClick={() => dialogRef.current?.close()}>Annulla</button>
        </div>
      </dialog>

      <dialog ref={errorDialogRef} className="error-dialog">
          <p>{errorMessage}</p>
          <div> <button onClick={() => errorDialogRef.current?.close()}>Ok</button> </div>
      </dialog>
    </div>
  );
}