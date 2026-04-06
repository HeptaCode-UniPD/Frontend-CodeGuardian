import { describe, expect, it, vi, beforeEach } from 'vitest';
import { getLastAnalysis, startNewAnalysis, pollAnalysisStatus } from './AnalysisService';
import * as Mock from '../test/mock';

describe('AnalysisService - Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getLastAnalysis: gestisce una risposta con status e response valorizzati', async () => {
    const mockReport = Mock.mock_reports[0];
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockReport,
    }));

    const result = await getLastAnalysis(Mock.mock_repositories[0].url);

    expect(result).not.toBeUndefined();
  });

  it('getLastAnalysis: propaga correttamente l\'errore di rete al chiamante', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));

    await expect(
      getLastAnalysis(Mock.mock_repositories[0].url)
    ).rejects.toThrow('Network error');
  });

  it('getLastAnalysis: lancia errore se il server risponde con !ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      statusText: 'Not Found',
    }));

    await expect(
      getLastAnalysis(Mock.mock_repositories[0].url)
    ).rejects.toThrow();
  });

  it('flusso completo: avvia analisi in processing e poi polling done chiama onSuccess', async () => {
    const onSuccess = vi.fn();

    let callCount = 0;
    vi.stubGlobal('fetch', vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ status: 'processing', jobId: 'abc123', repoUrl: Mock.mock_repositories[0].url }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ status: 'done' }),
      });
    }));

    const response = await startNewAnalysis(Mock.mock_repositories[0].url);
    expect(response.status).toBe('processing');
    expect(response.jobId).toBe('abc123');

    const status = await pollAnalysisStatus(response.jobId!);
    expect(status).toBe('done');

    if (status === 'done') onSuccess();
    expect(onSuccess).toHaveBeenCalled();
  });

  it('flusso completo: startNewAnalysis done non richiede polling', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'done', repoUrl: Mock.mock_repositories[0].url }),
    }));

    const response = await startNewAnalysis(Mock.mock_repositories[0].url);
    expect(response.status).toBe('done');
    expect(response.jobId).toBeUndefined();
  });

  it('flusso completo: startNewAnalysis lancia errore se il server non risponde', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      statusText: 'Service Unavailable',
    }));

    await expect(
      startNewAnalysis(Mock.mock_repositories[0].url)
    ).rejects.toThrow();
  });

  it('flusso completo: pollAnalysisStatus lancia errore se il server non risponde', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      statusText: 'Service Unavailable',
    }));

    await expect(
      pollAnalysisStatus('abc123')
    ).rejects.toThrow();
  });
});