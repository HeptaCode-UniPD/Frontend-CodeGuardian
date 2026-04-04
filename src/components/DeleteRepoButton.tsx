import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteRepo } from '../services/RepositoriesService';
import { type Repository } from '../data/types';

interface DeleteRepoButtonProps {
  repository: Repository;
  userID: string;
  messageButton?: string;
  onDeleted?: () => void;
}

export const DeleteRepoButton = ({ repository, userID, messageButton, onDeleted }: DeleteRepoButtonProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const errorDialogRef = useRef<HTMLDialogElement>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleConfirm = async () => {
    try {
      await deleteRepo(repository.id, userID);
      dialogRef.current?.close();
      if (onDeleted) {
        onDeleted();
      } else {
        navigate('/repositories');
      }
    } catch (error) {
      dialogRef.current?.close();
      setErrorMessage(`Errore durante l'eliminazione del repository ${repository.name}.`);
      errorDialogRef.current?.showModal();
    }
  };

  return (
    <>
      <button aria-label="elimina" className="delete-button" onClick={() => dialogRef.current?.showModal()}>{messageButton}</button>

      <dialog ref={dialogRef}>
        <p>Sei sicuro di voler eliminare {repository.name}?</p>
        <div>
          <button onClick={handleConfirm}>Conferma</button>
          <button onClick={() => dialogRef.current?.close()}>Annulla</button>
        </div>
      </dialog>

      <dialog ref={errorDialogRef} className="error-dialog">
        <p>{errorMessage}</p>
        <div><button onClick={() => errorDialogRef.current?.close()}>Ok</button></div>
      </dialog>
    </>
  );
};