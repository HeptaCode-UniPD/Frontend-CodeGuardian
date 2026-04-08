import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('config', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('usa i valori di default se le variabili d\'ambiente non sono definite', async () => {
    vi.stubEnv('VITE_URL_USER_SERVICE', '');
    vi.stubEnv('VITE_URL_ANALYSIS', '');

    const { API_BASE_URL_USER, API_BASE_URL_ANALYSIS } = await import('./config');

    expect(API_BASE_URL_USER).toBe('https://51fehz5pi5.execute-api.eu-central-1.amazonaws.com/prod');
    expect(API_BASE_URL_ANALYSIS).toBe('https://tqp87woa5a.execute-api.eu-central-1.amazonaws.com/prod');
  });

  it('usa le variabili d\'ambiente se definite', async () => {
    vi.stubEnv('VITE_URL_USER_SERVICE', 'http://custom-user-service:3000');
    vi.stubEnv('VITE_URL_ANALYSIS', 'http://custom-analysis-service:4000');

    const { API_BASE_URL_USER, API_BASE_URL_ANALYSIS } = await import('./config');

    expect(API_BASE_URL_USER).toBe('http://custom-user-service:3000');
    expect(API_BASE_URL_ANALYSIS).toBe('http://custom-analysis-service:4000');
  });
});