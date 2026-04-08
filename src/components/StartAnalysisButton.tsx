import { useState, useRef, useEffect } from 'react';
import { startNewAnalysis, pollAnalysisStatus } from '../services/AnalysisService';

interface StartAnalysisButtonProps {
  url: string;
  messageButton?: string;
  onSuccess?: () => void;
  initialJobId?:string;
  isLast:boolean;
  messageErrorAnalysis?:string;
  error:boolean;
}

const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 15 * 60 * 1000; // 15 minuti

export const StartAnalysisButton = ({ url, messageButton, onSuccess, initialJobId, isLast, messageErrorAnalysis, error}: StartAnalysisButtonProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const errorDialogRef = useRef<HTMLDialogElement>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isPolling, setIsPolling] = useState(false);

  useEffect(() => {
    if (initialJobId) {
        startPolling(initialJobId);}
  }, [initialJobId]);

  const startPolling = (jobId: string) => {
    setIsPolling(true);
    const startTime = Date.now();

    const interval = setInterval(async () => {
      try {
        // Timeout di sicurezza
        if (Date.now() - startTime > POLL_TIMEOUT_MS) {
          clearInterval(interval);
          setIsPolling(false);
          setErrorMessage("L'analisi sta impiegando troppo tempo. Riprova più tardi.");
          errorDialogRef.current?.showModal();
          return;
        }

        const status = await pollAnalysisStatus(jobId);

        if (status === 'done') {
          clearInterval(interval);
          setIsPolling(false);
          onSuccess?.();
        } else if (status === 'error') {
          clearInterval(interval);
          setIsPolling(false);
          setErrorMessage(`L'analisi ha riscontrato un errore. \n${messageErrorAnalysis??''}`);
          errorDialogRef.current?.showModal();
        }
        // se 'processing', continua il polling
      } catch {
        clearInterval(interval);
        setIsPolling(false);
        setErrorMessage('Errore durante il controllo dello stato analisi.');
        errorDialogRef.current?.showModal();
      }
    }, POLL_INTERVAL_MS);
  };

  const handleConfirm = async () => {
    dialogRef.current?.close();
    try {
      const response = await startNewAnalysis(url);

      if (response.status === 'done') {
        // Analisi già aggiornata, nessun polling necessario
        onSuccess?.();
      } else if (response.status === 'processing' && response.jobId) {
        startPolling(response.jobId);
      } else {
        throw new Error('Stato sconosciuto.');
      }
    } catch {
      setErrorMessage("Errore durante l'avvio dell'analisi.");
      errorDialogRef.current?.showModal();
    }
  };

  return (
    <>
      <button id="start-all" disabled={isPolling || (isLast && !error)} onClick={() => dialogRef.current?.showModal()}>
        {isPolling ? 'Analisi in corso...' : (messageButton ?? 'Avvia analisi')}
      </button>

      <dialog ref={dialogRef}>
        <p>Sei sicuro di voler avviare l'analisi?</p>
        <div>
          <button onClick={handleConfirm}>Conferma</button>
          <button onClick={() => dialogRef.current?.close()}>Annulla</button>
        </div>
      </dialog>

      <dialog ref={errorDialogRef} className="error-dialog">
        <p>{errorMessage}</p>
        <div>
          <button onClick={() => errorDialogRef.current?.close()}>Ok</button>
        </div>
      </dialog>
    </>
  );
};