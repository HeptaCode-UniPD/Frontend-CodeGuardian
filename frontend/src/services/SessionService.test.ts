import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import * as SessionService from './SessionService';
import * as UserService from './UserService';
import { useNavigate, useLocation } from 'react-router-dom';
import * as Mock from '../test/mock';

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
  useLocation: vi.fn(),
}));

vi.mock('./UserService', () => ({
  getInfoUserByID: vi.fn(),
}));

describe('SessionService', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    (useNavigate as any).mockReturnValue(mockNavigate);
    (UserService.getInfoUserByID as any).mockResolvedValue(Mock.mock_user[0]);
  });

  it('salva e recupera il userID', () => {
    const setSpy = vi.spyOn(Storage.prototype, 'setItem');
    SessionService.saveUserID('userID', '123');
    expect(setSpy).toHaveBeenCalledWith('userID', '123');
    expect(SessionService.getUserID('userID')).toBe('123');
  });

  it('rimuove il userID al logout', () => {
    localStorage.setItem('userID', '123');
    SessionService.logout('userID');
    expect(localStorage.getItem('userID')).toBeNull();
  });

  it('reindirizza a /login se l\'utente non è loggato e non è in /login', async () => {
    (useLocation as any).mockReturnValue({ pathname: '/repositories' });
    await act(async () => {
      renderHook(() => SessionService.useIsLogged());
    });
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('non reindirizza se l\'utente non è loggato ed è già in /login', async () => {
    (useLocation as any).mockReturnValue({ pathname: '/login' });
    await act(async () => {
      renderHook(() => SessionService.useIsLogged());
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('reindirizza a /repositories se l\'utente è loggato ma si trova in /login', async () => {
    localStorage.setItem('userID', '123');
    (useLocation as any).mockReturnValue({ pathname: '/login' });
    await act(async () => {
      renderHook(() => SessionService.useIsLogged());
    });
    expect(mockNavigate).toHaveBeenCalledWith('/repositories');
  });

  it('non fa nulla se l\'utente è loggato e si trova in una pagina protetta', async () => {
    localStorage.setItem('userID', '123');
    (useLocation as any).mockReturnValue({ pathname: '/repositories' });
    await act(async () => {
      renderHook(() => SessionService.useIsLogged());
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('reindirizza a /profile se l\'utente è loggato ma non trovato nel DB', async () => {
    localStorage.setItem('userID', '999');
    (useLocation as any).mockReturnValue({ pathname: '/repositories' });
    (UserService.getInfoUserByID as any).mockResolvedValue(undefined);
    await act(async () => {
      renderHook(() => SessionService.useIsLogged());
    });
    expect(mockNavigate).toHaveBeenCalledWith('/profile');
  });

  it('non reindirizza se l\'utente non è trovato nel DB ma è già in /profile', async () => {
    localStorage.setItem('userID', '999');
    (useLocation as any).mockReturnValue({ pathname: '/profile' });
    (UserService.getInfoUserByID as any).mockResolvedValue(undefined);
    await act(async () => {
      renderHook(() => SessionService.useIsLogged());
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});