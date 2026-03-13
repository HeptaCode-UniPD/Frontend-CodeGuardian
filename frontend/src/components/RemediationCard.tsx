import { useEffect, useState } from 'react';
import { fetchFileContent } from '../utils/GitHubUtils';
import { type FileRemediation } from '../services/api';
import * as Diff from 'diff';

const getDiffProps = (part: Diff.Change) => ({
  prefix: part.added ? '+ ' : part.removed ? '- ' : '  ',
  className: part.added ? 'added-text' : part.removed ? 'removed-text' : ''
});

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

  if (status === 'loading') return <p>Recupero codice originale...</p>;
  if (status === 'error') return <p>Errore nel caricamento del file.</p>;

  return (
    <div className="diffCode">
      {originalCode && <UnifiedDiff oldCode={originalCode} newCode={remediation.newCode} />}
    </div>
  );
};

function UnifiedDiff({oldCode, newCode} : { oldCode: string, newCode: string }) {
  const diffResult = Diff.diffLines(oldCode, newCode);
  return (
    <article>
      {diffResult.map((part, index) => (
        <DiffBlock key={index} part={part} />
      ))}
    </article>
  );
}

function DiffBlock(props: { part: Diff.Change }) {
  const { part } = props;
  const { prefix, className } = getDiffProps(part);
  const lines = part.value.split('\n').filter(line => line.trim() !== '');

  const renderedLines = lines.map((line, i) => (
    <div>{i} {prefix}{line}</div>
  ));

  return <div className={className}>{renderedLines}</div>;
}