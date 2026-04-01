import { describe, expect, it, vi, afterEach } from 'vitest';
import * as UserService from './UserService';
import * as Mock from '../test/mock';
import { API_BASE_URL_USER } from "../config";

describe('UserService', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('getUserById restituisce l\'utente corretto', async () => {
    const target = Mock.mock_user[0];
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: async () => target
    }));

    const result = await UserService.getInfoUserByID(target.userId);
    expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL_USER}/profile?userId=${target.userId}`,
        { method: "GET" }
    );
    expect(result).toEqual(target);
  });

  it('getInfoUserByID lancia errore se l\'utente non esiste', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));

    await expect(UserService.getInfoUserByID("non-esiste"))
        .rejects
        .toThrow("Utente non trovato");
  });

  it('checkCredentials restituisce l\'utente se le credenziali sono corrette', async () => {
    const target = Mock.mock_user[0];
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: async () => target
    }));

    const result = await UserService.checkCredentials('test@test.com', 'password');
    expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL_USER}/auth/login`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: 'test@test.com', password: 'password' })
        }
    );
    expect(result).toEqual(target);
  });

  it('checkCredentials lancia errore se le credenziali sono errate', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));

    await expect(UserService.checkCredentials('test@test.com', 'password_errata'))
        .rejects
        .toThrow("Credenziali non valide");
  });
});