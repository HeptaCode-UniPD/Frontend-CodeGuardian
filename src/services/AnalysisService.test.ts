import { describe, expect, it, vi, beforeEach } from 'vitest';
import { getLastAnalysis, startNewAnalysis, pollAnalysisStatus } from './AnalysisService';
import * as Mock from '../test/mock';
import { API_BASE_URL_ANALYSIS } from '../data/config';

describe('AnalysisService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- getLastAnalysis ---

  it('getLastAnalysis: restituisce i dati analisi quando fetch ha successo', async () => {
    const mockReport = Mock.mock_reports[0];
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockReport,
    }));

    const result = await getLastAnalysis('https://github.com/HeptaCode-UniPD/CodeGuardian');
    expect(result).toEqual(mockReport);
    expect(result?.response).toBeDefined();
  });

  it('getLastAnalysis: chiama fetch con metodo GET e url corretto', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => Mock.mock_reports[0],
    });
    vi.stubGlobal('fetch', mockFetch);

    const url = 'https://github.com/HeptaCode-UniPD/CodeGuardian';
    await getLastAnalysis(url);

    expect(mockFetch).toHaveBeenCalledWith(
      `${API_BASE_URL_ANALYSIS}/analysis/view?url=${url}`,
      { method: 'GET' }
    );
  });

  it('getLastAnalysis: lancia un errore quando fetch restituisce !ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      statusText: 'Not Found',
    }));

    await expect(
      getLastAnalysis('https://github.com/repo-inesistente')
    ).rejects.toThrow('Not Found');
  });

  // --- startNewAnalysis ---

  it('startNewAnalysis: restituisce la risposta quando fetch ha successo', async () => {
    const mockResponse = { status: 'processing', jobId: 'abc123', repoUrl: 'https://github.com/test' };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    }));

    const result = await startNewAnalysis('https://github.com/test');
    expect(result).toEqual(mockResponse);
  });

  it('startNewAnalysis: chiama fetch con metodo POST e body corretto', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'done', repoUrl: 'https://github.com/test' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const url = 'https://github.com/test';
    await startNewAnalysis(url);

    expect(mockFetch).toHaveBeenCalledWith(
      `${API_BASE_URL_ANALYSIS}/analysis/request`,
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl: url }),
      })
    );
  });

  it('startNewAnalysis: lancia un errore quando fetch restituisce !ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      statusText: 'Internal Server Error',
    }));

    await expect(startNewAnalysis('https://github.com/test'))
      .rejects.toThrow('Internal Server Error');
  });

  // --- pollAnalysisStatus ---

  it('pollAnalysisStatus: restituisce lo status corretto', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'done' }),
    }));

    const result = await pollAnalysisStatus('abc123');
    expect(result).toBe('done');
  });

  it('pollAnalysisStatus: chiama fetch con il jobId corretto', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'processing' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    await pollAnalysisStatus('abc123');

    expect(mockFetch).toHaveBeenCalledWith(
      `${API_BASE_URL_ANALYSIS}/analysis/status/abc123`,
      { method: 'GET' }
    );
  });

  it('pollAnalysisStatus: lancia un errore quando fetch restituisce !ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      statusText: 'Service Unavailable',
    }));

    await expect(pollAnalysisStatus('abc123'))
      .rejects.toThrow('Service Unavailable');
  });
});