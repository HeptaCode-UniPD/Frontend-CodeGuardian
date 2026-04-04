import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import * as UserService from './UserService';
import * as Mock from '../test/mock';

const server = setupServer(
    http.get('http://localhost:3000/profile', ({ request }) => {
        const url = new URL(request.url);
        const userId = url.searchParams.get('userId');
        const user = Mock.mock_user.find(u => u.userId === userId);
        if (!user) return new HttpResponse(null, { status: 404 });
        return HttpResponse.json(user);
    }),

    http.post('http://localhost:3000/auth/login', async ({ request }) => {
        const body = await request.json() as { email: string; password: string };
        const user = Mock.mock_user.find(u => u.email === body.email);
        if (!user) return new HttpResponse(null, { status: 401 });
        return HttpResponse.json(user);
    }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('UserService - integrazione', () => {

    it('getInfoUserByID restituisce l\'utente corretto dal server', async () => {
        const result = await UserService.getInfoUserByID(Mock.mock_user[0].userId);

        expect(result).toEqual(Mock.mock_user[0]);
    });

    it('getInfoUserByID lancia errore se il server risponde con 404', async () => {
        server.use(
            http.get('http://localhost:3000/profile', () => {
                return new HttpResponse(null, { status: 404 });
            })
        );

        await expect(UserService.getInfoUserByID('id-inesistente'))
            .rejects
            .toThrow();
    });

    it('checkCredentials restituisce l\'utente con credenziali corrette', async () => {
        const user = Mock.mock_user[0];
        const result = await UserService.checkCredentials(user.email, 'password');

        expect(result).toEqual(user);
    });

    it('checkCredentials lancia errore se le credenziali sono errate', async () => {
        server.use(
            http.post('http://localhost:3000/auth/login', () => {
                return new HttpResponse(null, { status: 401 });
            })
        );

        await expect(UserService.checkCredentials('email@sbagliata.it', 'passworderrata'))
            .rejects
            .toThrow();
    });
});