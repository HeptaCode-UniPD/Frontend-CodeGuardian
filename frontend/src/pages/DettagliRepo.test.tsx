import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { MemoryRouter, useParams } from 'react-router-dom';
import DettagliRepo from './DettagliRepo';
import * as analysisService from '../services/AnalysisService';
import * as sessionService from '../services/SessionService';
import * as Mock from '../test/mock';

vi.mock('../services/AnalysisService', () => ({
  getAnalysisPayload: vi.fn(),
}));

vi.mock('../services/SessionService', () => ({
  isLogged: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useParams: vi.fn() };
});

describe('DettagliRepo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderizza i dati del repository e le sezioni remediation', async () => {
    const targetRepo = Mock.mock_repositories[0];
    const targetRemediations = Mock.mock_reports.filter(r => r.repositoryID === targetRepo.id);

    (sessionService.isLogged as any).mockReturnValue(true);
    (useParams as any).mockReturnValue({ id: targetRepo.id });
    (analysisService.getAnalysisPayload as any).mockResolvedValue({
      repository: targetRepo,
      remediation: targetRemediations
    });

    await act(async () => {
      render(<MemoryRouter><DettagliRepo /></MemoryRouter>);
    });

    await waitFor(() => {
      expect(screen.getByText(targetRepo.name)).toBeInTheDocument();
    });

    expect(screen.getByText('80%')).toBeInTheDocument();
    expect(screen.getByText('1 file: Copertura test')).toBeInTheDocument();
  });

  it('mostra il messaggio di caricamento', async () => {
    (sessionService.isLogged as any).mockReturnValue(true);
    (useParams as any).mockReturnValue({ id: '1' });
    
    (analysisService.getAnalysisPayload as any).mockReturnValue(new Promise(() => {}));

    await act(async () => {
      render(<MemoryRouter><DettagliRepo /></MemoryRouter>);
    });

    expect(screen.getByText(/Caricamento/i)).toBeInTheDocument();
  });

  it('mostra errore se il repository non viene trovato', async () => {
    (sessionService.isLogged as any).mockReturnValue(true);
    (useParams as any).mockReturnValue({ id: '999' });
    (analysisService.getAnalysisPayload as any).mockResolvedValue(null);

    await act(async () => {
      render(<MemoryRouter><DettagliRepo /></MemoryRouter>);
    });

    await waitFor(() => {
      expect(screen.getByText(/Analisi del repository selezionato non trovata/i)).toBeInTheDocument();
    });
  });

  it('non esegue il fetch se l\'ID non è presente nell\'URL', async () => {
    (sessionService.isLogged as any).mockReturnValue(true);
    (useParams as any).mockReturnValue({});
    
    await act(async () => {
      render(<MemoryRouter><DettagliRepo /></MemoryRouter>);
    });

    expect(analysisService.getAnalysisPayload).not.toHaveBeenCalled();
  });

  it('gestisce il caso in cui remediation sia null', async () => {
    (sessionService.isLogged as any).mockReturnValue(true);
    (useParams as any).mockReturnValue({ id: '1' });
    (analysisService.getAnalysisPayload as any).mockResolvedValue({
      repository: Mock.mock_repositories[0],
      remediation: null
    });

    await act(async () => {
      render(<MemoryRouter><DettagliRepo /></MemoryRouter>);
    });

    await waitFor(() => {
      expect(screen.getByText('0 file: Completezza documentazione')).toBeInTheDocument();
    });
  });
});