import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as RepositoriesService from './RepositoriesService';
import * as Mock from '../test/mock';

describe('RepositoriesService', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });
    
    it('restituisce dei repository dall\'ID dell\'utente', async () => {
        const targetId = Mock.mock_user[0].id;
        const result = await RepositoriesService.getRepositoriesByUser(targetId);

        expect(Array.isArray(result)).toBe(true);
        expect(result).toHaveLength(2);
        expect(result).toEqual([
            Mock.mock_repositories[0],
            Mock.mock_repositories[1]
        ]);
    });

    it('non restituisce repository se non ne ha', async () => {
        const targetId = Mock.mock_user[3].id;
        const result = await RepositoriesService.getRepositoriesByUser(targetId);

        expect(Array.isArray(result)).toBe(true);
        expect(result).toHaveLength(0);
    });

    it('restituisce il repo anche se l\'utente è il secondo proprietario nella lista', async () => {
        const result = await RepositoriesService.getRepositoriesByUser("2");
        
        expect(Array.isArray(result)).toBe(true);
        expect(result).toHaveLength(1);
        expect(result).toEqual([Mock.mock_repositories[0]]);
    });

    it('restituisce il repo anche se userID è una stringa singola e non un array', async () => {
        const newRepo = { id: "999", userID: "999", name: "Repo Stringa" } as any;
        Mock.mock_repositories.push(newRepo);
        const result = await RepositoriesService.getRepositoriesByUser("999");
        expect(result).toContainEqual(newRepo);
        Mock.mock_repositories.pop();
    });

    it('checkRepoValid restituisce true', async () => {
        const result = await RepositoriesService.checkRepoValid('http://qualsiasi-url');
        expect(result).toBe(true);
    });

    it('checkRepoAccess restituisce true', async () => {
        const result = await RepositoriesService.checkRepoAccess('http://qualsiasi-url');
        expect(result).toBe(true);
    });
});