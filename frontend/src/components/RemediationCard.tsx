import { useEffect, useState } from 'react';
import { fetchFileContent } from '../utils/GitHubUtils';
import { type FileRemediation } from '../services/api';
import * as Diff from 'diff';

export const UnifiedDiff = ({ oldCode, newCode }: { oldCode: string, newCode: string }) => {
  const diffResult = Diff.diffLines(oldCode, newCode);

  return (
    <pre>
      {diffResult.map((part, index) => {
        const prefix = part.added ? '+ ' : part.removed ? '- ' : '  ';

        return (
          <div key={index} className={`${part.added ? 'added-text' : part.removed ? 'removed-text' : ''}`}>
            {part.value.split('\n').map((line, i) => (
              line && <div key={i}>{prefix}{line}</div>
            ))}
          </div>
        );
      })}
    </pre>
  );
};

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