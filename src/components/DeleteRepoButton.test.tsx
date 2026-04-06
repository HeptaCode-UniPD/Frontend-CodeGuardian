import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { DeleteRepoButton } from '../components/DeleteRepoButton';
import * as RepositoriesService from '../services/RepositoriesService';
import * as Mock from '../test/mock';

vi.mock('../services/RepositoriesService', () => ({
  deleteRepo: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const renderComponent = (onDeleted?: () => void) =>
  render(
    <MemoryRouter>
      <DeleteRepoButton
        repository={Mock.mock_repositories[0]}
        userID="1"
        onDeleted={onDeleted}
      />
    </MemoryRouter>
  );

describe('DeleteRepoButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    HTMLDialogElement.prototype.showModal = vi.fn().mockImplementation(function (this: HTMLDialogElement) {
      this.setAttribute('open', '');
    });
    HTMLDialogElement.prototype.close = vi.fn().mockImplementation(function (this: HTMLDialogElement) {
      this.removeAttribute('open');
    });
  });

  it('renderizza il bottone elimina', () => {
    renderComponent();
    expect(screen.getByRole('button', { name: /elimina/i })).toBeInTheDocument();
  });

  it('mostra il dialog di conferma al click del bottone', async () => {
    renderComponent();
    await userEvent.click(screen.getByRole('button', { name: /elimina/i }));
    expect(screen.getByText(/Sei sicuro di voler eliminare/i)).toBeInTheDocument();
  });

  it('chiama onDeleted dopo conferma se passato', async () => {
    const onDeleted = vi.fn();
    (RepositoriesService.deleteRepo as any).mockResolvedValue(undefined);

    renderComponent(onDeleted);
    await userEvent.click(screen.getByRole('button', { name: /elimina/i }));
    await userEvent.click(screen.getByText('Conferma'));

    await waitFor(() => {
      expect(RepositoriesService.deleteRepo).toHaveBeenCalledWith(Mock.mock_repositories[0].id, '1');
      expect(onDeleted).toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  it('naviga a /repositories dopo conferma se onDeleted non è passato', async () => {
    (RepositoriesService.deleteRepo as any).mockResolvedValue(undefined);

    renderComponent();
    await userEvent.click(screen.getByRole('button', { name: /elimina/i }));
    await userEvent.click(screen.getByText('Conferma'));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/repositories');
    });
  });

  it('mostra il dialog di errore se deleteRepo fallisce', async () => {
    (RepositoriesService.deleteRepo as any).mockRejectedValue(new Error('Network error'));

    renderComponent();
    await userEvent.click(screen.getByRole('button', { name: /elimina/i }));
    await userEvent.click(screen.getByText('Conferma'));

    await waitFor(() => {
      expect(screen.getByText(/Errore durante l'eliminazione/i)).toBeInTheDocument();
    });
  });

  it('mostra il messageButton personalizzato', () => {
    render(
      <MemoryRouter>
        <DeleteRepoButton
          repository={Mock.mock_repositories[0]}
          userID="1"
          messageButton="Rimuovi"
        />
      </MemoryRouter>
    );
    expect(screen.getByText('Rimuovi')).toBeInTheDocument();
  });

  it('chiude il dialog di errore al click di Ok', async () => {
    (RepositoriesService.deleteRepo as any).mockRejectedValue(new Error('Network error'));

    renderComponent();
    await userEvent.click(screen.getByRole('button', { name: /elimina/i }));
    await userEvent.click(screen.getByText('Conferma'));

    await waitFor(() => {
        expect(screen.getByText(/Errore durante l'eliminazione/i)).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText('Ok'));

    expect(screen.getByText(/Errore durante l'eliminazione/i).closest('dialog'))
        .not.toHaveAttribute('open');
  });
});