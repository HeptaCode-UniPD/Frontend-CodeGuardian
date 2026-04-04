import { describe, it, expect, vi, afterEach } from 'vitest';
import { get, post, del } from './httpClient';

const mockFetch = (ok: boolean, data?: unknown, statusText = 'Error') => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok,
    statusText,
    json: async () => data,
  }));
};

afterEach(() => vi.unstubAllGlobals());

// --- get ---

describe('get', () => {
  it('restituisce i dati quando fetch ha successo', async () => {
    mockFetch(true, { id: '1' });
    const result = await get<{ id: string }>('http://test.com');
    expect(result).toEqual({ id: '1' });
  });

  it('lancia un errore con statusText quando !ok e nessuna opzione', async () => {
    mockFetch(false, undefined, 'Not Found');
    await expect(get('http://test.com')).rejects.toThrow('Not Found');
  });

  it('chiama fetch con metodo GET e url corretto', async () => {
    mockFetch(true, {});
    await get('http://test.com/resource');
    expect(fetch).toHaveBeenCalledWith('http://test.com/resource', { method: 'GET' });
  });
});

// --- post ---

describe('post', () => {
  it('restituisce i dati quando fetch ha successo', async () => {
    mockFetch(true, { ok: true });
    const result = await post<{ ok: boolean }>('http://test.com', { name: 'test' });
    expect(result).toEqual({ ok: true });
  });

  it('lancia un errore con statusText quando !ok e nessuna opzione', async () => {
    mockFetch(false, undefined, 'Bad Request');
    await expect(post('http://test.com', {})).rejects.toThrow('Bad Request');
  });

  it('chiama fetch con metodo POST, headers e body corretti', async () => {
    mockFetch(true, {});
    await post('http://test.com', { foo: 'bar' });
    expect(fetch).toHaveBeenCalledWith('http://test.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ foo: 'bar' }),
    });
  });
});

// --- del ---

describe('del', () => {
  it('restituisce i dati quando fetch ha successo', async () => {
    mockFetch(true, { deleted: true });
    const result = await del<{ deleted: boolean }>('http://test.com', { id: '1' });
    expect(result).toEqual({ deleted: true });
  });

  it('lancia un errore con statusText quando !ok e nessuna opzione', async () => {
    mockFetch(false, undefined, 'Not Found');
    await expect(del('http://test.com', {})).rejects.toThrow('Not Found');
  });

  it('chiama fetch con metodo DELETE, headers e body corretti', async () => {
    mockFetch(true, {});
    await del('http://test.com', { id: '1' });
    expect(fetch).toHaveBeenCalledWith('http://test.com', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: '1' }),
    });
  });
});

// --- extractErrorMessage ---

describe('extractErrorMessage', () => {
  it('lancia il messaggio stringa del backend quando !ok', async () => {
    mockFetch(false, { message: 'Repository già presente per questo utente.' });
    await expect(
      post('http://test.com', {}, { extractErrorMessage: true })
    ).rejects.toThrow('Repository già presente per questo utente.');
  });

  it('rimappa il messaggio di class-validator in "URL non valido."', async () => {
    mockFetch(false, { message: ['url must be a URL address'] });
    await expect(
      post('http://test.com', {}, { extractErrorMessage: true })
    ).rejects.toThrow('URL non valido.');
  });

  it('prende il primo elemento se message è array senza "url must be"', async () => {
    mockFetch(false, { message: ['Campo obbligatorio mancante.', 'Altro errore.'] });
    await expect(
      post('http://test.com', {}, { extractErrorMessage: true })
    ).rejects.toThrow('Campo obbligatorio mancante.');
  });

  it('fallback a statusText se json non è parsabile', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      statusText: 'Internal Server Error',
      json: async () => { throw new Error('parse error'); },
    }));
    await expect(
      post('http://test.com', {}, { extractErrorMessage: true })
    ).rejects.toThrow('Internal Server Error');
  });

  it('fallback a statusText se message è undefined', async () => {
    mockFetch(false, {}, 'Unprocessable Entity');
    await expect(
      post('http://test.com', {}, { extractErrorMessage: true })
    ).rejects.toThrow('Unprocessable Entity');
  });
});