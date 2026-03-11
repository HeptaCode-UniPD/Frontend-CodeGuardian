import { useEffect, useState } from 'react';
import { fetchFileContent } from '../utils/GitHubUtils';
import { UnifiedDiff } from './CodeDiff';
import { type FileRemediation } from '../services/api';

export const RemediationCard = ({ remediation }: { remediation: FileRemediation }) => {
  const [originalCode, setOriginalCode] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>('loading');

  useEffect(() => {
    fetchFileContent(remediation.fileUrl)
      .then(code => {
        setOriginalCode(code);
        setStatus('success');
      })
      .catch(() => setStatus('error'));
  }, [remediation.fileUrl]);

  return (
    <div>
      <div className="diffCode">
        {status === 'loading' && <p>Recupero codice originale...</p>}
        {status === 'error' && <p>Errore nel caricamento del file.</p>}
        {status === 'success' && originalCode && (
          <UnifiedDiff oldCode={originalCode} newCode={remediation.newCode} />
        )}
      </div>
    </div>
  );
};