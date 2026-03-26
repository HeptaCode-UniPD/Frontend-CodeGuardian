import { describe, expect, it, vi, beforeEach } from 'vitest';
import * as UserService from './UserService';
import * as Mock from '../test/mock';

describe('UserService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getUserById restituisce l\'utente corretto', async () => {
    const target = Mock.mock_user[0];
    const result = await UserService.getInfoUserByID(target.id);
    expect(result).toEqual(target);
  });

  it('restituisce undefined se l\'utente non esiste', async () => {
    const result = await UserService.getInfoUserByID("non-esiste");
    expect(result).toBeUndefined();
  });

  it('getIDbyEmail restituisce un ID', async () => {
        const result = await UserService.getIDbyEmail('test@test.com');
        expect(typeof result).toBe('string');
        expect(result).toBe('1');
    });

    it('checkEmailValid restituisce true', async () => {
        const result = await UserService.checkEmailValid('test@test.com');
        expect(result).toBe(true);
    });

    it('checkCredentials restituisce true', async () => {
        const result = await UserService.checkCredentials('test@test.com', 'password');
        expect(result).toBe(true);
    });
});