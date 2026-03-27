import { type AnalysisReport } from '../types/types';
import * as Diff from 'diff';

interface DiffProps {
  prefix: string;
  className: string;
}

const getDiffProps = (part: Diff.Change): DiffProps => ({
  prefix: part.added ? '+ ' : part.removed ? '- ' : '  ',
  className: part.added ? 'added-text' : part.removed ? 'removed-text' : ''
});

const UnifiedDiff = ({oldCode, newCode} : { oldCode: string, newCode: string }) => {
  const diffResult = Diff.diffLines(oldCode, newCode);
  return (
    <article>
      {diffResult.map((part, index) => (
        <DiffBlock key={index} part={part} />
      ))}
    </article>
  );
}

const DiffBlock = ({ part }: { part: Diff.Change }) => {
  const { prefix, className } = getDiffProps(part);
  const lines = part.value.split('\n').filter(line => line.trim() !== '');

  const renderedLines = lines.map((line, i) => (
    <div key={line}>{prefix}{line}</div>
  ));

  return <div className={className}>{renderedLines}</div>;
};

export const RemediationCard = ({ remediation }: { remediation: AnalysisReport }) => {

  return (
    <div className="diffCode">
      {remediation.originalCode && <UnifiedDiff oldCode={remediation.originalCode} newCode={remediation.newCode} />}
    </div>
  );
};