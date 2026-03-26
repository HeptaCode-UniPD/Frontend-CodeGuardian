import { describe, expect, it, vi, beforeEach } from 'vitest';
import * as AnalysisService from './AnalysisService';

vi.mock('./AnalysisService', async () => {
  const actual = await vi.importActual('./AnalysisService') as any;
  return { ...actual }; 
});

describe('AnalysisService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getAnalysisPayload restituisce i dati corretti', async () => {
    const result = await AnalysisService.getAnalysisPayload("1");
    
    expect(result).not.toBeNull();
    expect(result?.repository.id).toBe("1");
  });

  it('restituisce null per un ID inesistente', async () => {
    const result = await AnalysisService.getAnalysisPayload("999");
    expect(result).toBeNull();
  });
});