import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { MemoryRouter, useLocation } from 'react-router-dom';
import UserPage from './UserPage';
import * as userService from '../services/UserService';
import * as sessionService from '../services/SessionService';
import * as Mock from '../test/mock';

vi.mock('../services/UserService', () => ({
  getInfoUserByID: vi.fn(),
}));

vi.mock('../services/SessionService', () => ({
  useIsLogged: vi.fn(),
  getUserID: vi.fn(),
  logout: vi.fn(),
}));

const LocationDisplay = () => {
  const location = useLocation();
  return <div data-testid="location-display">{location.pathname}</div>;
};

describe('UserPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('mostra il messaggio di caricamento iniziale', async () => {
        (sessionService.useIsLogged as any).mockReturnValue(true);
        (sessionService.getUserID as any).mockReturnValue('1');
        (userService.getInfoUserByID as any).mockReturnValue(new Promise(() => {}));

        await act(async () => {
        render(<MemoryRouter><UserPage /></MemoryRouter>);
        });

        expect(screen.getByText(/Caricamento/i)).toBeInTheDocument();
    });

    it('mostra i dati utente dopo il caricamento', async () => {
        const target = Mock.mock_user[0];
        (sessionService.useIsLogged as any).mockReturnValue(true);
        (sessionService.getUserID as any).mockReturnValue(target.id);
        (userService.getInfoUserByID as any).mockResolvedValue(target);

        await act(async () => {
        render(<MemoryRouter><UserPage /></MemoryRouter>);
        });

        await waitFor(() => {
        expect(screen.getByText(`Ciao ${target.nome} ${target.cognome}!`)).toBeInTheDocument();
        });

        expect(screen.getByText(target.email)).toBeInTheDocument();
        expect(screen.getAllByText(target.nome)[0]).toBeInTheDocument();
        expect(screen.getAllByText(target.cognome)[0]).toBeInTheDocument();
    });

    it('non esegue il fetch se getUserID non restituisce un id', async () => {
        (sessionService.useIsLogged as any).mockReturnValue(true);
        (sessionService.getUserID as any).mockReturnValue(null);

        await act(async () => {
        render(<MemoryRouter><UserPage /></MemoryRouter>);
        });

        expect(userService.getInfoUserByID).not.toHaveBeenCalled();
    });

    it('naviga a /login dopo il logout', async () => {
        const user = userEvent.setup();
        const target = Mock.mock_user[0];
        (sessionService.useIsLogged as any).mockReturnValue(true);
        (sessionService.getUserID as any).mockReturnValue(target.userId);
        (userService.getInfoUserByID as any).mockResolvedValue(target);
        (sessionService.logout as any).mockReturnValue(undefined);

        render(
        <MemoryRouter>
            <UserPage />
            <LocationDisplay />
        </MemoryRouter>
        );

        await waitFor(() => {
        expect(screen.getByRole('button', { name: /Esci/i })).toBeInTheDocument();
        });

        await user.click(screen.getByRole('button', { name: /Esci/i }));

        await waitFor(() => {
        expect(screen.getByTestId('location-display')).toHaveTextContent('/login');
        });

        expect(sessionService.logout).toHaveBeenCalledWith('userID');
    });

    it('mostra errore se i dati utente non vengono trovati', async () => {
        (sessionService.useIsLogged as any).mockReturnValue(true);
        (sessionService.getUserID as any).mockReturnValue('999');
        (userService.getInfoUserByID as any).mockResolvedValue(undefined);

        render(<MemoryRouter><UserPage /></MemoryRouter>);

        await waitFor(() => {
            expect(screen.getByText(/Utente non trovato/i)).toBeInTheDocument();
        });

        expect(screen.getByRole('button', { name: /Esci/i })).toBeInTheDocument();
    });
});