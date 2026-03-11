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