import { render, screen, waitFor, act } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { MemoryRouter, useLocation } from 'react-router-dom';
import Login from './Login';
import * as userService from '../services/UserService';
import * as sessionService from '../services/SessionService';

vi.mock('../services/UserService', () => ({
  checkEmailValid: vi.fn(),
  checkCredentials: vi.fn(),
  getIDbyEmail: vi.fn(),
}));

vi.mock('../services/SessionService', () => ({
  useIsLogged: vi.fn(),
  saveUserID: vi.fn(),
}));

const LocationDisplay = () => {
  const location = useLocation();
  return <div data-testid="location-display">{location.pathname}</div>;
};

describe('Login', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const emailInput = () => screen.getByPlaceholderText('Email');
    const passwordInput = () => document.getElementById('password-input') as HTMLInputElement;

    it('renderizza il form', () => {
        (sessionService.useIsLogged as any).mockReturnValue(true);

        render(<MemoryRouter><Login /></MemoryRouter>);

        expect(emailInput()).toBeInTheDocument();
        expect(passwordInput()).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Accedi/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Annulla/i })).toBeInTheDocument();
    });

    it('il bottone Accedi è disabilitato se email o password sono vuote', () => {
        (sessionService.useIsLogged as any).mockReturnValue(true);

        render(<MemoryRouter><Login /></MemoryRouter>);

        expect(screen.getByRole('button', { name: /Accedi/i })).toBeDisabled();
    });

    it('mostra/nasconde la password al click sull\'icona', async () => {
        const user = userEvent.setup();
        (sessionService.useIsLogged as any).mockReturnValue(true);

        render(<MemoryRouter><Login /></MemoryRouter>);

        expect(passwordInput()).toHaveAttribute('type', 'password');
        await user.click(screen.getByLabelText(/Mostra password/i));
        expect(passwordInput()).toHaveAttribute('type', 'text');
        await user.click(screen.getByLabelText(/Nascondi password/i));
        expect(passwordInput()).toHaveAttribute('type', 'password');
    });

    it('mostra errore se l\'email non è valida', async () => {
        const user = userEvent.setup();
        (sessionService.useIsLogged as any).mockReturnValue(true);

        render(<MemoryRouter><Login /></MemoryRouter>);

        await user.type(emailInput(), 'email-non-valida');
        await user.type(passwordInput(), '1234');
        expect(passwordInput()).toHaveAttribute('type', 'password');

        const form = screen.getByLabelText(/Email/i).closest('form')!;
        await act(async () => { fireEvent.submit(form); });

        await waitFor(() => {
        expect(screen.getByText(/L'email è in un formato non valido/i)).toBeInTheDocument();
        });
    });

    it('mostra errore se le credenziali sono errate', async () => {
        const user = userEvent.setup();
        (sessionService.useIsLogged as any).mockReturnValue(true);
        (userService.checkCredentials as any).mockResolvedValue(false);

        render(<MemoryRouter><Login /></MemoryRouter>);

        await user.type(emailInput(), 'test@test.com');
        await user.type(passwordInput(), 'password sbagliata');
        expect(passwordInput()).toHaveAttribute('type', 'password');

        const form = screen.getByLabelText(/Email/i).closest('form')!;
        await act(async () => { fireEvent.submit(form); });

        await waitFor(() => {
        expect(screen.getByText(/Le credenziali non sono corrette/i)).toBeInTheDocument();
        });
    });

    it('naviga a /repositories dopo il login con successo', async () => {
        const user = userEvent.setup();
        (sessionService.useIsLogged as any).mockReturnValue(true);
        (userService.checkCredentials as any).mockResolvedValue(true);
        (sessionService.saveUserID as any).mockReturnValue(undefined);

        render(
        <MemoryRouter>
            <Login />
            <LocationDisplay />
        </MemoryRouter>
        );

        await user.type(emailInput(), 'test@test.com');
        await user.type(passwordInput(), '1234');
        expect(passwordInput()).toHaveAttribute('type', 'password');

        await user.click(screen.getByRole('button', { name: /Accedi/i }));

        await waitFor(() => {
        expect(screen.getByTestId('location-display')).toHaveTextContent('/repositories');
        });

        expect(sessionService.saveUserID).toHaveBeenCalledWith('userID', '1');
    });

    it('il bottone Annulla svuota i campi', async () => {
        const user = userEvent.setup();
        (sessionService.useIsLogged as any).mockReturnValue(true);

        render(<MemoryRouter><Login /></MemoryRouter>);

        await user.type(emailInput(), 'test@test.com');
        await user.type(passwordInput(), '1234');

        await user.click(screen.getByRole('button', { name: /Annulla/i }));

        expect(emailInput()).toHaveValue('');
        expect(passwordInput()).toHaveValue('');
    });

    it('reindirizza al login se l\'utente non è loggato', async () => {
        vi.stubGlobal('location', { ...window.location, href: '' });
        (sessionService.useIsLogged as any).mockImplementation(() => {
        window.location.href = '/login';
        });

        await act(async () => {
        render(<MemoryRouter><Login /></MemoryRouter>);
        });

        expect(window.location.href).toBe('/login');
        vi.unstubAllGlobals();
    });
});