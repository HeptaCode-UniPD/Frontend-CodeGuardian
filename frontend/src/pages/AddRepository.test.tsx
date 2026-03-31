import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useLocation, MemoryRouter } from 'react-router-dom';
import AddRepository from './AddRepository';
import * as repoService from '../services/RepositoriesService';
import * as sessionService from '../services/SessionService';

vi.mock('../services/RepositoriesService', () => ({
  checkRepoValid: vi.fn(),
  checkRepoAccess: vi.fn(),
}));

vi.mock('../services/SessionService', () => ({
  useIsLogged: vi.fn(),
}));

describe('AddRepository (Versione Mock Estremo)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const LocationDisplay = () => {
        const location = useLocation();
        return <div data-testid="location-display">{location.pathname}</div>;
    };

    it('va a repositories quando il link immesso è valido e pubblico', async () => {
        const user = userEvent.setup();
        (sessionService.useIsLogged as any).mockReturnValue(true);
        (repoService.checkRepoAccess as any).mockResolvedValue(true);

        render(<MemoryRouter><AddRepository /><LocationDisplay /></MemoryRouter>);

        await user.type(
        screen.getByLabelText(/URL repository GitHub/i),
        'https://github.com/valid/repo'
        );
        
        await user.click(screen.getByRole('button', { name: /Importa/i }));

        await waitFor(() => {
        expect(screen.getByTestId('location-display')).toHaveTextContent('/repositories');
        });
    });

    it('mostra errore se il repository è privato o l\'URL è invalido (400)', async () => {
        (sessionService.useIsLogged as any).mockReturnValue(true);
        
        const apiError = new Error("Repository privato o URL invalido.");
        (repoService.checkRepoAccess as any).mockRejectedValue(apiError);

        render(<MemoryRouter><AddRepository /></MemoryRouter>);

        fireEvent.change(screen.getByLabelText(/URL repository GitHub/i), { 
            target: { value: 'https://github.com/private/repo' } 
        });
        
        fireEvent.click(screen.getByRole('button', { name: /Importa/i }));
        await waitFor(() => {
            expect(screen.getByText(/Repository privato o URL invalido./i)).toBeInTheDocument();
        });
    });

    it('mostra errore specifico se il repository è già presente (409)', async () => {
        (sessionService.useIsLogged as any).mockReturnValue(true);
        const conflictError = new Error("Repository già presente per questo utente.");
        (repoService.checkRepoAccess as any).mockRejectedValue(conflictError);

        render(<MemoryRouter><AddRepository /></MemoryRouter>);

        fireEvent.change(screen.getByLabelText(/URL repository GitHub/i), { 
            target: { value: 'https://github.com/already/exists' } 
        });
        
        fireEvent.click(screen.getByRole('button', { name: /Importa/i }));

        await waitFor(() => {
            expect(screen.getByText(/Repository già presente per questo utente./i)).toBeInTheDocument();
        });
    });
});