import { describe, expect, it, vi, beforeEach } from 'vitest';
import { getLastAnalysis, startNewAnalysis, pollAnalysisStatus } from './AnalysisService';
import * as Mock from '../test/mock';

describe('AnalysisService - Unit', () => {
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

  it('getLastAnalysis: lancia un errore quando fetch restituisce !ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));

    await expect(
      getLastAnalysis('https://github.com/repo-inesistente')
    ).rejects.toThrow('Analisi non trovata');
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
      `http://localhost:4000/analysis/view?url=${url}`,
      expect.objectContaining({ method: 'GET' })
    );
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
      'http://localhost:4000/analysis/request',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl: url }),
      })
    );
  });

  it('startNewAnalysis: lancia un errore quando fetch restituisce !ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));

    await expect(startNewAnalysis('https://github.com/test')).rejects.toThrow('Errore nella richiesta di analisi.');
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

    expect(mockFetch).toHaveBeenCalledWith('http://localhost:4000/analysis/status/abc123');
  });

  it('pollAnalysisStatus: lancia un errore quando fetch restituisce !ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));

    await expect(pollAnalysisStatus('abc123')).rejects.toThrow('Errore nel polling.');
  });
});