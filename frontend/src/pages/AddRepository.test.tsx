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
  isLogged: vi.fn(),
}));

describe('AddRepository (Versione Mock Estremo)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const LocationDisplay = () => {
        const location = useLocation();
        return <div data-testid="location-display">{location.pathname}</div>;
    };

    it('mostra errore se l\'URL non è valido dopo il submit', async () => {
        (sessionService.isLogged as any).mockReturnValue(true);
        (repoService.checkRepoValid as any).mockResolvedValue(false);

        render(<MemoryRouter><AddRepository /></MemoryRouter>);

        const input = screen.getByLabelText(/URL repository GitHub/i);
        fireEvent.change(input, { target: { value: 'test-url' } });
        
        fireEvent.click(screen.getByRole('button', { name: /Importa/i }));

        await waitFor(() => {
        expect(screen.getByText(/L'URL inserito non è valido/i)).toBeInTheDocument();
        });
    });

    it('va a repositories quando il link immesso è valido e pubblico', async () => {
        const user = userEvent.setup();
        (sessionService.isLogged as any).mockReturnValue(true);
        (repoService.checkRepoValid as any).mockResolvedValue(true);
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

    it('mostra errore se la repository è privata', async () => {
        (sessionService.isLogged as any).mockReturnValue(true);
        (repoService.checkRepoValid as any).mockResolvedValue(true);
        (repoService.checkRepoAccess as any).mockResolvedValue(false);

        render(<MemoryRouter><AddRepository /></MemoryRouter>);

        fireEvent.change(screen.getByLabelText(/URL repository GitHub/i), { 
            target: { value: 'https://github.com/private/repo' } 
        });
        
        fireEvent.click(screen.getByRole('button', { name: /Importa/i }));

        await waitFor(() => {
        expect(screen.getByText(/Repository privato, impossibile importare/i)).toBeInTheDocument();
        });
    });
});