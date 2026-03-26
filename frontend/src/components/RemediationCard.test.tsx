import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { RemediationCard } from '../components/RemediationCard';
import * as Mock from '../test/mock';

describe('RemediationCard', () => {
  it('renderizza il diff tra codice originale e nuovo', () => {
    render(<RemediationCard remediation={Mock.mock_reports[0]} />);
    expect(document.querySelector('.diffCode')).toBeInTheDocument();
  });

  it('mostra le righe aggiunte con prefisso +', () => {
    render(<RemediationCard remediation={Mock.mock_reports[0]} />);
    const added = document.querySelector('.added-text');
    expect(added).toBeInTheDocument();
    expect(added?.textContent).toContain('+');
  });

  it('mostra le righe rimosse con prefisso -', () => {
    render(<RemediationCard remediation={Mock.mock_reports[0]} />);
    const removed = document.querySelector('.removed-text');
    expect(removed).toBeInTheDocument();
    expect(removed?.textContent).toContain('-');
  });

  it('non renderizza il diff se originalCode è assente', () => {
    const remediationSenzaCodice = { ...Mock.mock_reports[0], originalCode: '' };
    render(<RemediationCard remediation={remediationSenzaCodice} />);
    expect(document.querySelector('article')).not.toBeInTheDocument();
  });
});