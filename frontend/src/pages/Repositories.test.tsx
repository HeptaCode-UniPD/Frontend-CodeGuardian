import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Repositories from './Repositories';
import * as repositoriesService from '../services/RepositoriesService';
import * as sessionService from '../services/SessionService';
import * as Mock from '../test/mock';

vi.mock('../services/RepositoriesService', () => ({
    getRepositoriesByUser: vi.fn(),
}));

vi.mock('../services/SessionService', () => ({
    useIsLogged: vi.fn(),
    getUserID: vi.fn(),
}));

describe('Repositories', () => {
    beforeEach(() => {
        vi.clearAllMocks();
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
        const userRepos = Mock.mock_repositories.filter(r => 
        Array.isArray(r.userID) ? r.userID.includes('1') : r.userID === '1'
        );
        (sessionService.useIsLogged as any).mockReturnValue(true);
        (sessionService.getUserID as any).mockReturnValue('1');
        (repositoriesService.getRepositoriesByUser as any).mockResolvedValue(userRepos);

        render(<MemoryRouter><Repositories /></MemoryRouter>);

        await waitFor(() => {
        expect(screen.getByText('CodeGuardian')).toBeInTheDocument();
        });

        expect(screen.getByText('PoC')).toBeInTheDocument();
        expect(screen.getAllByText(/public|private/i).length).toBeGreaterThan(0);
    });

    it('mostra il messaggio di errore se il fetch restituisce null', async () => {
        (sessionService.useIsLogged as any).mockReturnValue(true);
        (sessionService.getUserID as any).mockReturnValue('1');
        (repositoriesService.getRepositoriesByUser as any).mockResolvedValue(null);

        render(<MemoryRouter><Repositories /></MemoryRouter>);

        await waitFor(() => {
        expect(screen.getByText(/La ricerca dei repository non è andata a buon fine/i)).toBeInTheDocument();
        });
    });

    it('mostra lista vuota se l\'utente non ha repository', async () => {
        (sessionService.useIsLogged as any).mockReturnValue(true);
        (sessionService.getUserID as any).mockReturnValue('4');
        (repositoriesService.getRepositoriesByUser as any).mockResolvedValue([]);

        render(<MemoryRouter><Repositories /></MemoryRouter>);

        await waitFor(() => {
        expect(screen.getByRole('list')).toBeInTheDocument();
        });

        expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
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
        const userRepos = [Mock.mock_repositories[0]];
        (sessionService.useIsLogged as any).mockReturnValue(true);
        (sessionService.getUserID as any).mockReturnValue('1');
        (repositoriesService.getRepositoriesByUser as any).mockResolvedValue(userRepos);

        render(<MemoryRouter><Repositories /></MemoryRouter>);

        await waitFor(() => {
        expect(screen.getByText('CodeGuardian')).toBeInTheDocument();
        });

        const link = screen.getByText('CodeGuardian').closest('a');
        expect(link).toHaveAttribute('href', `/repository/${Mock.mock_repositories[0].id}`);
    });
});