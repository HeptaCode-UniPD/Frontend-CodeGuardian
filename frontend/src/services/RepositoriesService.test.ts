import { describe, it, expect, vi, afterEach } from 'vitest';
import * as RepositoriesService from './RepositoriesService';
import * as Mock from '../test/mock';

vi.mock('./SessionService', () => ({
    getUserID: vi.fn().mockReturnValue('1'),
    useIsLogged: vi.fn(),
}));

describe('RepositoriesService', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('restituisce dei repository dall\'ID dell\'utente', async () => {
        const targetId = Mock.mock_user[0].userId;
        const expected = [Mock.mock_repositories[0], Mock.mock_repositories[1]];
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: true,
            json: async () => expected
        }));

        const result = await RepositoriesService.getRepositoriesByUser(targetId);
        expect(fetch).toHaveBeenCalledWith(
            `http://localhost:3000/repos?userId=${targetId}`,
            { method: "GET" }
        );
        expect(Array.isArray(result)).toBe(true);
        expect(result).toHaveLength(2);
        expect(result).toEqual(expected);
    });

    it('non restituisce repository se non ne ha', async () => {
        const targetId = Mock.mock_user[3].userId;
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: true,
            json: async () => []
        }));

        const result = await RepositoriesService.getRepositoriesByUser(targetId);
        expect(Array.isArray(result)).toBe(true);
        expect(result).toHaveLength(0);
    });

    it('restituisce il repo anche se l\'utente è il secondo proprietario nella lista', async () => {
        const expected = [Mock.mock_repositories[0]];
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: true,
            json: async () => expected
        }));

        const result = await RepositoriesService.getRepositoriesByUser("2");
        expect(Array.isArray(result)).toBe(true);
        expect(result).toHaveLength(1);
        expect(result).toEqual(expected);
    });

    it('restituisce il repo anche se userID è una stringa singola e non un array', async () => {
        const newRepo = { id: "999", userID: "999", name: "Repo Stringa" } as any;
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: true,
            json: async () => [newRepo]
        }));

        const result = await RepositoriesService.getRepositoriesByUser("999");
        expect(result).toContainEqual(newRepo);
    });

    it('getRepositoriesByUser lancia errore se utente non trovato', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
        await expect(RepositoriesService.getRepositoriesByUser("id-inesistente"))
            .rejects
            .toThrow("Utente non trovato");
    });

    it('checkRepoAccess restituisce true', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
        const result = await RepositoriesService.checkRepoAccess('http://qualsiasi-url');
        expect(fetch).toHaveBeenCalledWith(
            "http://localhost:3000/repo",
            expect.objectContaining({
                method: "POST",
                headers: { "Content-Type": "application/json" },
            })
        );
        expect(result).toBe(true);
    });

    it('checkRepoAccess lancia errore se URL non valido', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
        await expect(RepositoriesService.checkRepoAccess('http://url-non-valida'))
            .rejects
            .toThrow("URL non valido");
    });


    it('deleteRepo restituisce true se l\'eliminazione va a buon fine', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));

        const result = await RepositoriesService.deleteRepo('id-repo', 'id-utente');

        expect(fetch).toHaveBeenCalledWith(
            "http://localhost:3000/repo",
            expect.objectContaining({
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idUtente: 'id-utente', idRepo: 'id-repo' }),
            })
        );
        expect(result).toBe(true);
    });

    it('deleteRepo lancia errore se il repository non viene trovato', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));

        await expect(RepositoriesService.deleteRepo('id-repo', 'id-utente'))
            .rejects
            .toThrow("Repository non trovato con idRepo: id-repo e idUtente: id-utente");
    });
});