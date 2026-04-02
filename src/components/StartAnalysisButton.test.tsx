import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { StartAnalysisButton } from '../components/StartAnalysisButton';
import * as AnalysisService from '../services/AnalysisService';

vi.mock('../services/AnalysisService', () => ({
  startNewAnalysis: vi.fn(),
  pollAnalysisStatus: vi.fn(),
}));

const TEST_URL = 'https://github.com/test/repo';
const TEST_JOB_ID = 'abc123sha';

const renderComponent = (props?: Partial<React.ComponentProps<typeof StartAnalysisButton>>) =>
  render(
    <MemoryRouter>
      <StartAnalysisButton url={TEST_URL} {...props} />
    </MemoryRouter>
  );

describe('StartAnalysisButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    HTMLDialogElement.prototype.showModal = vi.fn().mockImplementation(function (this: HTMLDialogElement) {
      this.setAttribute('open', '');
    });
    HTMLDialogElement.prototype.close = vi.fn().mockImplementation(function (this: HTMLDialogElement) {
      this.removeAttribute('open');
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renderizza il bottone avvia analisi', () => {
    renderComponent();
    expect(screen.getByRole('button', { name: /avvia analisi/i })).toBeInTheDocument();
  });

  it('mostra il messageButton personalizzato', () => {
    renderComponent({ messageButton: 'Lancia analisi' });
    expect(screen.getByText('Lancia analisi')).toBeInTheDocument();
  });

  it('mostra il dialog di conferma al click del bottone', async () => {
    renderComponent();
    await userEvent.click(screen.getByRole('button', { name: /avvia analisi/i }));
    expect(screen.getByText(/Sei sicuro di voler avviare l'analisi/i)).toBeInTheDocument();
  });

  it('chiude il dialog alla pressione di Annulla', async () => {
    renderComponent();
    await userEvent.click(screen.getByRole('button', { name: /avvia analisi/i }));
    await userEvent.click(screen.getByText('Annulla'));
    expect(screen.queryByText(/Sei sicuro di voler avviare l'analisi/i)).not.toBeInTheDocument();
  });

  it('chiama onSuccess subito se lo stato è done', async () => {
    const onSuccess = vi.fn();
    (AnalysisService.startNewAnalysis as any).mockResolvedValue({ status: 'done', repoUrl: TEST_URL });

    renderComponent({ onSuccess });
    await userEvent.click(screen.getByRole('button', { name: /avvia analisi/i }));
    await userEvent.click(screen.getByText('Conferma'));

    await waitFor(() => {
      expect(AnalysisService.startNewAnalysis).toHaveBeenCalledWith(TEST_URL);
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('avvia il polling se lo stato è processing', async () => {
    const onSuccess = vi.fn();
    (AnalysisService.startNewAnalysis as any).mockResolvedValue({
      status: 'processing', repoUrl: TEST_URL, jobId: TEST_JOB_ID,
    });
    (AnalysisService.pollAnalysisStatus as any).mockResolvedValue('done');

    renderComponent({ onSuccess });
    await userEvent.click(screen.getByRole('button', { name: /avvia analisi/i }));
    await userEvent.click(screen.getByText('Conferma'));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /analisi in corso/i })).toBeDisabled();
    });

    await act(async () => { vi.advanceTimersByTime(3000); });

    await waitFor(() => {
      expect(AnalysisService.pollAnalysisStatus).toHaveBeenCalledWith(TEST_JOB_ID);
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('non chiama onSuccess se startNewAnalysis fallisce', async () => {
    const onSuccess = vi.fn();
    (AnalysisService.startNewAnalysis as any).mockRejectedValue(new Error('Network error'));

    renderComponent({ onSuccess });
    await userEvent.click(screen.getByRole('button', { name: /avvia analisi/i }));
    await userEvent.click(screen.getByText('Conferma'));

    await waitFor(() => {
      expect(onSuccess).not.toHaveBeenCalled();
    });
  });

  it('mostra il dialog di errore se startNewAnalysis fallisce', async () => {
    (AnalysisService.startNewAnalysis as any).mockRejectedValue(new Error('Network error'));

    renderComponent();
    await userEvent.click(screen.getByRole('button', { name: /avvia analisi/i }));
    await userEvent.click(screen.getByText('Conferma'));

    await waitFor(() => {
      expect(screen.getByText(/Errore durante l'avvio dell'analisi/i)).toBeInTheDocument();
    });
  });

  it('mostra il dialog di errore se il polling fallisce', async () => {
    (AnalysisService.startNewAnalysis as any).mockResolvedValue({
      status: 'processing', repoUrl: TEST_URL, jobId: TEST_JOB_ID,
    });
    (AnalysisService.pollAnalysisStatus as any).mockRejectedValue(new Error('Network error'));

    renderComponent();
    await userEvent.click(screen.getByRole('button', { name: /avvia analisi/i }));
    await userEvent.click(screen.getByText('Conferma'));

    await act(async () => { vi.advanceTimersByTime(3000); });

    await waitFor(() => {
      expect(screen.getByText(/Errore durante il controllo dello stato analisi/i)).toBeInTheDocument();
    });
  });

  it('avvia il polling automaticamente se initialJobId è presente', async () => {
    const onSuccess = vi.fn();
    (AnalysisService.pollAnalysisStatus as any).mockResolvedValue('done');

    await act(async () => {
      renderComponent({ initialJobId: TEST_JOB_ID, onSuccess });
    });

    expect(screen.getByRole('button', { name: /analisi in corso/i })).toBeDisabled();

    await act(async () => { vi.advanceTimersByTime(3000); });

    await waitFor(() => {
      expect(AnalysisService.pollAnalysisStatus).toHaveBeenCalledWith(TEST_JOB_ID);
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('mostra errore di timeout se il polling supera il limite', async () => {
    (AnalysisService.startNewAnalysis as any).mockResolvedValue({
      status: 'processing', repoUrl: TEST_URL, jobId: TEST_JOB_ID,
    });
    (AnalysisService.pollAnalysisStatus as any).mockResolvedValue('processing');

    renderComponent();
    await userEvent.click(screen.getByRole('button', { name: /avvia analisi/i }));
    await userEvent.click(screen.getByText('Conferma'));

    await act(async () => { vi.advanceTimersByTime(15 * 60 * 1000 + 3000); });

    await waitFor(() => {
      expect(screen.getByText(/sta impiegando troppo tempo/i)).toBeInTheDocument();
    });
  });
});