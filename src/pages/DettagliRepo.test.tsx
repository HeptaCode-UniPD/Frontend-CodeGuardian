import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { MemoryRouter, useParams } from 'react-router-dom';
import DettagliRepo from './DettagliRepo';
import * as analysisService from '../services/AnalysisService';
import * as repositoriesService from '../services/RepositoriesService';
import * as sessionService from '../services/SessionService';
import * as Mock from '../test/mock';

vi.mock('../services/AnalysisService', () => ({
  getLastAnalysis: vi.fn(),
  startNewAnalysis: vi.fn(),
  pollAnalysisStatus: vi.fn(),
}));

vi.mock('../services/RepositoriesService', () => ({
  getRepositoryById: vi.fn(),
  deleteRepo: vi.fn(),
}));

vi.mock('../services/SessionService', () => ({
  useIsLogged: vi.fn(),
  getUserID: vi.fn().mockReturnValue('1'),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useParams: vi.fn(), useNavigate: () => mockNavigate };
});

describe('DettagliRepo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (sessionService.useIsLogged as any).mockReturnValue(true);
    (sessionService.getUserID as any).mockReturnValue('1');
    HTMLDialogElement.prototype.showModal = vi.fn().mockImplementation(function (this: HTMLDialogElement) {
      this.setAttribute('open', '');
    });
    HTMLDialogElement.prototype.close = vi.fn().mockImplementation(function (this: HTMLDialogElement) {
      this.removeAttribute('open');
    });
  });

  it('mostra il messaggio di caricamento', async () => {
    (useParams as any).mockReturnValue({ id: '1' });
    (repositoriesService.getRepositoryById as any).mockReturnValue(new Promise(() => {}));

    await act(async () => {
      render(<MemoryRouter><DettagliRepo /></MemoryRouter>);
    });

    expect(screen.getByText(/Caricamento/i)).toBeInTheDocument();
  });

  it('renderizza i dati del repository e la sezione suggerimenti', async () => {
    const targetRepo = Mock.mock_repositories[0];
    const targetReport = Mock.mock_reports[0];

    (useParams as any).mockReturnValue({ id: targetRepo.id });
    (repositoriesService.getRepositoryById as any).mockResolvedValue(targetRepo);
    (analysisService.getLastAnalysis as any).mockResolvedValue(targetReport);

    await act(async () => {
      render(<MemoryRouter><DettagliRepo /></MemoryRouter>);
    });

    await waitFor(() => {
      expect(screen.getByText(targetRepo.name)).toBeInTheDocument();
      expect(screen.getByText(targetReport.response)).toBeInTheDocument();
    });
  });

  it('mostra errore se il repository non viene trovato', async () => {
    (useParams as any).mockReturnValue({ id: '1' });
    (repositoriesService.getRepositoryById as any).mockResolvedValue(null);

    render(<MemoryRouter><DettagliRepo /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByText(/Repository selezionato non trovato/i)).toBeInTheDocument();
    });
  });

  it('mostra il messaggio di nessuna analisi disponibile se getLastAnalysis ritorna null', async () => {
    const targetRepo = Mock.mock_repositories[0];
    (useParams as any).mockReturnValue({ id: targetRepo.id });
    (repositoriesService.getRepositoryById as any).mockResolvedValue(targetRepo);
    (analysisService.getLastAnalysis as any).mockResolvedValue(null);

    render(<MemoryRouter><DettagliRepo /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByText(/Nessuna analisi disponibile/i)).toBeInTheDocument();
    });
  });

  it('mostra il pulsante avvia analisi', async () => {
    const targetRepo = Mock.mock_repositories[0];
    (useParams as any).mockReturnValue({ id: targetRepo.id });
    (repositoriesService.getRepositoryById as any).mockResolvedValue(targetRepo);
    (analysisService.getLastAnalysis as any).mockResolvedValue(null);

    render(<MemoryRouter><DettagliRepo /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /avvia analisi/i })).toBeInTheDocument();
    });
  });

  it('non esegue il fetch se l\'ID non è presente nell\'URL', async () => {
    (useParams as any).mockReturnValue({});

    await act(async () => {
      render(<MemoryRouter><DettagliRepo /></MemoryRouter>);
    });

    expect(repositoriesService.getRepositoryById).not.toHaveBeenCalled();
    expect(analysisService.getLastAnalysis).not.toHaveBeenCalled();
  });

  it('mostra errore se getRepositoryById lancia un\'eccezione', async () => {
    (useParams as any).mockReturnValue({ id: '1' });
    (repositoriesService.getRepositoryById as any).mockRejectedValue(new Error('errore'));

    render(<MemoryRouter><DettagliRepo /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByText(/Repository selezionato non trovato/i)).toBeInTheDocument();
    });
  });

  it('mostra il pulsante di eliminazione repository', async () => {
    const targetRepo = Mock.mock_repositories[0];
    (useParams as any).mockReturnValue({ id: targetRepo.id });
    (repositoriesService.getRepositoryById as any).mockResolvedValue(targetRepo);
    (analysisService.getLastAnalysis as any).mockResolvedValue(null);

    render(<MemoryRouter><DettagliRepo /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /elimina/i })).toBeInTheDocument();
    });
  });
});