import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import Repositories from './Repositories';
import * as repositoriesService from '../services/RepositoriesService';
import * as sessionService from '../services/SessionService';
import * as Mock from '../test/mock';

vi.mock('../services/RepositoriesService', () => ({
    deleteRepo: vi.fn(),
    getRepositoriesByUser: vi.fn(),
}));

vi.mock('../services/SessionService', () => ({
    useIsLogged: vi.fn(),
    getUserID: vi.fn(),
}));

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

    it('mostra il pulsante di eliminazione per ogni repository', async () => {
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

        const deleteButtons = screen.getAllByRole('button', { name: /elimina/i });
        expect(deleteButtons).toHaveLength(userRepos.length);
    });

    it('chiama deleteRepo con l\'id corretto alla conferma', async () => {
        const user = userEvent.setup();
        const userRepos = [Mock.mock_repositories[0]];
        (sessionService.useIsLogged as any).mockReturnValue(true);
        (sessionService.getUserID as any).mockReturnValue('1');
        (repositoriesService.getRepositoriesByUser as any).mockResolvedValue(userRepos);
        (repositoriesService.deleteRepo as any).mockResolvedValue(true);

        render(<MemoryRouter><Repositories /></MemoryRouter>);

        await waitFor(() => {
            expect(screen.getByText('CodeGuardian')).toBeInTheDocument();
        });

        await user.click(screen.getByRole('button', { name: /elimina/i }));
        await user.click(screen.getByRole('button', { name: /conferma/i }));

        expect(repositoriesService.deleteRepo).toHaveBeenCalledWith(Mock.mock_repositories[0].id, '1');
    });

    it('apre il dialog di conferma al click su X', async () => {
        const userRepos = [Mock.mock_repositories[0]];
        (sessionService.useIsLogged as any).mockReturnValue(true);
        (sessionService.getUserID as any).mockReturnValue('1');
        (repositoriesService.getRepositoriesByUser as any).mockResolvedValue(userRepos);

        render(<MemoryRouter><Repositories /></MemoryRouter>);

        await waitFor(() => {
            expect(screen.getByText('CodeGuardian')).toBeInTheDocument();
        });

        const deleteButton = screen.getByRole('button', { name: /elimina/i });
        await userEvent.click(deleteButton);

        expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalledTimes(1);
    });

    it('non chiama deleteRepo se si clicca Annulla', async () => {
        const userRepos = [Mock.mock_repositories[0]];
        (sessionService.useIsLogged as any).mockReturnValue(true);
        (sessionService.getUserID as any).mockReturnValue('1');
        (repositoriesService.getRepositoriesByUser as any).mockResolvedValue(userRepos);

        render(<MemoryRouter><Repositories /></MemoryRouter>);

        await waitFor(() => {
            expect(screen.getByText('CodeGuardian')).toBeInTheDocument();
        });

        await userEvent.click(screen.getByRole('button', { name: /elimina/i }));
        await userEvent.click(screen.getByRole('button', { name: /annulla/i }));

        expect(repositoriesService.deleteRepo).not.toHaveBeenCalled();
        expect(HTMLDialogElement.prototype.close).toHaveBeenCalledTimes(1);
    });

    it('rimuove il repository dalla lista dopo la conferma', async () => {
        const userRepos = Mock.mock_repositories.filter(r =>
            Array.isArray(r.userID) ? r.userID.includes('1') : r.userID === '1'
        );
        (sessionService.useIsLogged as any).mockReturnValue(true);
        (sessionService.getUserID as any).mockReturnValue('1');
        (repositoriesService.getRepositoriesByUser as any).mockResolvedValue(userRepos);
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

    it('mostra il dialog di errore se deleteRepo fallisce', async () => {
        const user = userEvent.setup();
        const userRepos = [Mock.mock_repositories[0]];
        (sessionService.useIsLogged as any).mockReturnValue(true);
        (sessionService.getUserID as any).mockReturnValue('1');
        (repositoriesService.getRepositoriesByUser as any).mockResolvedValue(userRepos);
        (repositoriesService.deleteRepo as any).mockRejectedValue(new Error('Errore di rete'));

        render(<MemoryRouter><Repositories /></MemoryRouter>);

        await waitFor(() => {
            expect(screen.getByText('CodeGuardian')).toBeInTheDocument();
        });

        await user.click(screen.getByRole('button', { name: /elimina/i }));
        await user.click(screen.getByRole('button', { name: /conferma/i }));

        await waitFor(() => {
            expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalledTimes(2);
        });

        expect(screen.getByText(`Errore durante l'eliminazione del repository ${Mock.mock_repositories[0].name}.`)).toBeInTheDocument();
        expect(HTMLDialogElement.prototype.close).toHaveBeenCalledTimes(1);
        expect(screen.getByText('CodeGuardian')).toBeInTheDocument();
    });
});