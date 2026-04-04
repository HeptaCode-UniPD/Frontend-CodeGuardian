import { describe, it, expect, vi, afterEach } from 'vitest';
import * as RepositoriesService from './RepositoriesService';
import * as Mock from '../test/mock';
import { API_BASE_URL_USER } from "../data/config";

vi.mock('./SessionService', () => ({
  getUserID: vi.fn().mockReturnValue('1'),
  useIsLogged: vi.fn(),
}));

describe('RepositoriesService', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // --- getRepositoriesByUser ---

  it('restituisce i repository dall\'ID dell\'utente', async () => {
    const targetId = Mock.mock_user[0].userId;
    const expected = [Mock.mock_repositories[0], Mock.mock_repositories[1]];
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => expected,
    }));

    const result = await RepositoriesService.getRepositoriesByUser(targetId);
    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE_URL_USER}/repos?userId=${targetId}`,
      { method: 'GET' }
    );
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(2);
    expect(result).toEqual(expected);
  });

  it('non restituisce repository se non ne ha', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    }));

    const result = await RepositoriesService.getRepositoriesByUser(Mock.mock_user[3].userId);
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(0);
  });

  it('restituisce il repo anche se l\'utente è il secondo proprietario nella lista', async () => {
    const expected = [Mock.mock_repositories[0]];
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => expected,
    }));

    const result = await RepositoriesService.getRepositoriesByUser('2');
    expect(result).toEqual(expected);
  });

  it('getRepositoriesByUser lancia errore se utente non trovato', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      statusText: 'Not Found',
    }));

    await expect(RepositoriesService.getRepositoriesByUser('id-inesistente'))
      .rejects.toThrow('Not Found');
  });

  // --- getRepositoryById ---

  it('getRepositoryById restituisce il repository corretto', async () => {
    const expected = Mock.mock_repositories[0];
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => expected,
    }));

    const result = await RepositoriesService.getRepositoryById(expected.id);
    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE_URL_USER}/repo?repoId=${expected.id}`,
      { method: 'GET' }
    );
    expect(result).toEqual(expected);
  });

  it('getRepositoryById lancia errore se repo non trovato', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      statusText: 'Not Found',
    }));

    await expect(RepositoriesService.getRepositoryById('id-inesistente'))
      .rejects.toThrow('Not Found');
  });

  // --- deleteRepo ---

  it('deleteRepo restituisce true se l\'eliminazione va a buon fine', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    }));

    const result = await RepositoriesService.deleteRepo('id-repo', 'id-utente');
    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE_URL_USER}/repo`,
      expect.objectContaining({
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idUtente: 'id-utente', idRepo: 'id-repo' }),
      })
    );
    expect(result).toBe(true);
  });

  it('deleteRepo lancia errore se il repository non viene trovato', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      statusText: 'Not Found',
    }));

    await expect(RepositoriesService.deleteRepo('id-repo', 'id-utente'))
      .rejects.toThrow('Not Found');
  });

  // --- checkRepoAccess ---

  it('checkRepoAccess restituisce true se il repo è accessibile', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    }));

    const result = await RepositoriesService.checkRepoAccess('https://github.com/user/repo');
    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE_URL_USER}/repo`,
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    );
    expect(result).toBe(true);
  });

  it('checkRepoAccess lancia il messaggio del backend se il repo non è accessibile', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      statusText: 'Bad Request',
      json: async () => ({ message: 'Repository privato o URL invalido.' }),
    }));

    await expect(RepositoriesService.checkRepoAccess('url-non-valido'))
      .rejects.toThrow('Repository privato o URL invalido.');
  });

  it('checkRepoAccess rimappa il messaggio di class-validator in "URL non valido."', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      statusText: 'Bad Request',
      json: async () => ({ message: ['url must be a URL address'] }),
    }));

    await expect(RepositoriesService.checkRepoAccess('non-un-url'))
      .rejects.toThrow('URL non valido.');
  });

  it('checkRepoAccess lancia il messaggio corretto per repo già presente', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      statusText: 'Conflict',
      json: async () => ({ message: 'Repository già presente per questo utente.' }),
    }));

    await expect(RepositoriesService.checkRepoAccess('https://github.com/user/repo'))
      .rejects.toThrow('Repository già presente per questo utente.');
  });
});