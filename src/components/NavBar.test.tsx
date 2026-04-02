import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { NavBar } from '../components/NavBar';

const renderNavBar = (path: string) => {
  const router = createMemoryRouter(
    [{ path: '*', element: <NavBar />, handle: { label: 'Test' } }],
    { initialEntries: [path] }
  );
  return render(<RouterProvider router={router} />);
};

describe('NavBar', () => {
  it('renderizza il titolo CodeGuardian', () => {
    renderNavBar('/repositories');
    expect(screen.getByText('CodeGuardian')).toBeInTheDocument();
  });

  it('mostra i link di navigazione', () => {
    renderNavBar('/profile');
    expect(screen.getByText('Aggiungi repository')).toBeInTheDocument();
    expect(screen.getByText('Lista repository')).toBeInTheDocument();
  });

  it('mostra il link come testo non cliccabile se si è nella pagina corrente', () => {
    renderNavBar('/repositories');
    expect(document.getElementById('inactive-link')).toBeInTheDocument();
    expect(document.getElementById('inactive-link')?.textContent).toBe('Lista repository');
  });

  it('mostra il link come ancora cliccabile se non si è nella pagina corrente', () => {
    renderNavBar('/profile');
    const link = screen.getByText('Lista repository');
    expect(link.tagName).toBe('A');
  });

  it('renderizza i breadcrumb', () => {
    renderNavBar('/repositories');
    expect(document.getElementById('breadcrumb')).toBeInTheDocument();
  });
});