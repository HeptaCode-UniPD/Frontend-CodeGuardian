import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { render, waitFor, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import * as SessionService from './SessionService';
import * as Mock from '../test/mock';

const server = setupServer(
    http.get('http://localhost:3000/profile', ({ request }) => {
        const url = new URL(request.url);
        const userId = url.searchParams.get('userId');
        const user = Mock.mock_user.find(u => u.userId === userId);
        if (!user) return new HttpResponse(null, { status: 404 });
        return HttpResponse.json(user);
    }),
);

beforeAll(() => server.listen());
afterEach(() => {
    server.resetHandlers();
    localStorage.clear();
});
afterAll(() => server.close());

function TestComponent() {
    SessionService.useIsLogged();
    return <div>pagina protetta</div>;
}

function LocationDisplay() {
    const location = useLocation();
    return <div data-testid="location">{location.pathname}</div>;
}

describe('SessionService - unit', () => {

    it('saveUserID salva il valore nel localStorage', () => {
        SessionService.saveUserID('userID', '42');
        expect(localStorage.getItem('userID')).toBe('42');
    });

    it('getUserID restituisce il valore salvato', () => {
        localStorage.setItem('userID', '42');
        expect(SessionService.getUserID('userID')).toBe('42');
    });

    it('getUserID restituisce null se la chiave non esiste', () => {
        expect(SessionService.getUserID('chiave-inesistente')).toBeNull();
    });

    it('logout rimuove il valore dal localStorage', () => {
        localStorage.setItem('userID', '42');
        SessionService.logout('userID');
        expect(localStorage.getItem('userID')).toBeNull();
    });
});

describe('SessionService - integrazione useIsLogged', () => {

    it('reindirizza a /login se l\'utente non è loggato', async () => {
        render(
            <MemoryRouter initialEntries={['/repositories']}>
                <LocationDisplay />
                <Routes>
                    <Route path="/repositories" element={<TestComponent />} />
                    <Route path="/login" element={<div>login</div>} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByTestId('location')).toHaveTextContent('/login');
        });
    });

    it('reindirizza a /repositories se l\'utente è già loggato e va su /login', async () => {
        localStorage.setItem('userID', Mock.mock_user[0].userId);

        render(
            <MemoryRouter initialEntries={['/login']}>
                <LocationDisplay />
                <Routes>
                    <Route path="/login" element={<TestComponent />} />
                    <Route path="/repositories" element={<div>repos</div>} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByTestId('location')).toHaveTextContent('/repositories');
        });
    });

    it('non reindirizza se l\'utente è loggato e il profilo esiste', async () => {
        localStorage.setItem('userID', Mock.mock_user[0].userId);

        render(
            <MemoryRouter initialEntries={['/repositories']}>
                <LocationDisplay />
                <Routes>
                    <Route path="/repositories" element={<TestComponent />} />
                    <Route path="/login" element={<div>login</div>} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByTestId('location')).toHaveTextContent('/repositories');
        });
    });
});