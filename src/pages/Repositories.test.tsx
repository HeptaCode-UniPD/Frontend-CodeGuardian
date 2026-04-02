import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import Repositories from './Repositories';
import * as repositoriesService from '../services/RepositoriesService';
import * as sessionService from '../services/SessionService';
import * as Mock from '../test/mock';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../services/RepositoriesService', () => ({
  deleteRepo: vi.fn(),
  getRepositoriesByUser: vi.fn(),
}));

vi.mock('../services/SessionService', () => ({
  useIsLogged: vi.fn(),
  getUserID: vi.fn(),
}));

const userRepos = Mock.mock_repositories.filter(r =>
  Array.isArray(r.userID) ? r.userID.includes('1') : r.userID === '1'
);

const setupMocks = (repos: typeof userRepos | null = userRepos) => {
  (sessionService.useIsLogged as any).mockReturnValue(true);
  (sessionService.getUserID as any).mockReturnValue('1');
  (repositoriesService.getRepositoriesByUser as any).mockResolvedValue(repos);
};

describe('Repositories', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    HTMLDialogElement.prototype.showModal = vi.fn().mockImplementation(function (this: HTMLDialogElement) {
      this.setAttribute('open', '');
    });
    HTMLDialogElement.prototype.close = vi.fn().mockImplementation(function (this: HTMLDialogElement) {
      this.removeAttribute('open');
    });
  });

  it('mostra il messaggio di caricamento iniziale', async () => {
    (sessionService.useIsLogged as any).mockReturnValue(true);
    (sessionService.getUserID as any).mockReturnValue('1');
    (repositoriesService.getRepositoriesByUser as any).mockReturnValue(new Promise(() => {}));

    await act(async () => {
      render(<MemoryRouter><Repositories /></MemoryRouter>);
    });

    expect(screen.getByText(/Caricamento/i)).toBeInTheDocument();
  });

  it('mostra la lista dei repository dopo il caricamento', async () => {
    setupMocks();
    render(<MemoryRouter><Repositories /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByText('CodeGuardian')).toBeInTheDocument();
    });
    expect(screen.getByText('PoC')).toBeInTheDocument();
  });

  it('mostra il messaggio di errore se il fetch restituisce null', async () => {
    setupMocks(null);
    render(<MemoryRouter><Repositories /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByText(/La ricerca dei repository non è andata a buon fine/i)).toBeInTheDocument();
    });
  });

  it('mostra il messaggio se l\'utente non ha repository', async () => {
    setupMocks([]);
    render(<MemoryRouter><Repositories /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByText(/Non è ancora stato inserito alcun repository/i)).toBeInTheDocument();
    });
  });

  it('non esegue il fetch se getUserID non restituisce un id', async () => {
    (sessionService.useIsLogged as any).mockReturnValue(true);
    (sessionService.getUserID as any).mockReturnValue(null);

    await act(async () => {
      render(<MemoryRouter><Repositories /></MemoryRouter>);
    });

    expect(repositoriesService.getRepositoriesByUser).not.toHaveBeenCalled();
  });

  it('i link ai repository puntano al percorso corretto', async () => {
    setupMocks([Mock.mock_repositories[0]]);
    render(<MemoryRouter><Repositories /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByText('CodeGuardian')).toBeInTheDocument();
    });

    const link = screen.getByText('CodeGuardian').closest('a');
    expect(link).toHaveAttribute('href', `/repository/${Mock.mock_repositories[0].id}`);
  });

  it('mostra il pulsante di eliminazione per ogni repository', async () => {
    setupMocks();
    render(<MemoryRouter><Repositories /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByText('CodeGuardian')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: /elimina/i });
    expect(deleteButtons).toHaveLength(userRepos.length);
  });

  it('rimuove il repository dalla lista dopo la conferma', async () => {
    setupMocks();
    (repositoriesService.deleteRepo as any).mockResolvedValue(true);
    render(<MemoryRouter><Repositories /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByText('CodeGuardian')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: /elimina/i });
    await userEvent.click(deleteButtons[0]);
    await userEvent.click(screen.getByRole('button', { name: /conferma/i }));

    await waitFor(() => {
      expect(screen.queryByText('CodeGuardian')).not.toBeInTheDocument();
    });
    expect(screen.getByText('PoC')).toBeInTheDocument();
  });

  // --- test search bar ---

  it('mostra la search bar', async () => {
    setupMocks();
    render(<MemoryRouter><Repositories /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Trova un repository/i)).toBeInTheDocument();
    });
  });

  it('filtra i repository per nome', async () => {
    setupMocks();
    render(<MemoryRouter><Repositories /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByText('CodeGuardian')).toBeInTheDocument();
    });

    await userEvent.type(screen.getByPlaceholderText(/Trova un repository/i), 'CodeGuardian');

    expect(screen.getByText('CodeGuardian')).toBeInTheDocument();
    expect(screen.queryByText('PoC')).not.toBeInTheDocument();
  });

  it('mostra il messaggio se la ricerca non trova risultati', async () => {
    setupMocks();
    render(<MemoryRouter><Repositories /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByText('CodeGuardian')).toBeInTheDocument();
    });

    await userEvent.type(screen.getByPlaceholderText(/Trova un repository/i), 'xyznonexistent');

    expect(screen.getByText(/Nessun repository trovato per/i)).toBeInTheDocument();
  });

  it('la ricerca è case-insensitive', async () => {
    setupMocks();
    render(<MemoryRouter><Repositories /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByText('CodeGuardian')).toBeInTheDocument();
    });

    await userEvent.type(screen.getByPlaceholderText(/Trova un repository/i), 'codeguardian');

    expect(screen.getByText('CodeGuardian')).toBeInTheDocument();
    expect(screen.queryByText('PoC')).not.toBeInTheDocument();
  });
});