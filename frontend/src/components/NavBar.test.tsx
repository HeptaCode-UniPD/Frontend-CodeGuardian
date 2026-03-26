import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { NavBar } from '../components/NavBar';

describe('NavBar', () => {
  it('renderizza il titolo CodeGuardian', () => {
    render(<MemoryRouter initialEntries={['/repositories']}><NavBar /></MemoryRouter>);
    expect(screen.getByText('CodeGuardian')).toBeInTheDocument();
  });

  it('mostra i link di navigazione', () => {
    render(<MemoryRouter initialEntries={['/profile']}><NavBar /></MemoryRouter>);
    expect(screen.getByText('Aggiungi repository')).toBeInTheDocument();
    expect(screen.getByText('Repositories')).toBeInTheDocument();
  });

  it('mostra il link come testo non cliccabile se si è nella pagina corrente', () => {
    render(<MemoryRouter initialEntries={['/repositories']}><NavBar /></MemoryRouter>);
    expect(document.getElementById('inactive-link')).toBeInTheDocument();
    expect(document.getElementById('inactive-link')?.textContent).toBe('Repositories');
  });

  it('mostra il link come ancora cliccabile se non si è nella pagina corrente', () => {
    render(<MemoryRouter initialEntries={['/profile']}><NavBar /></MemoryRouter>);
    const link = screen.getByText('Repositories');
    expect(link.tagName).toBe('A');
  });

  it('renderizza i breadcrumb', () => {
    render(<MemoryRouter initialEntries={['/repositories']}><NavBar /></MemoryRouter>);
    expect(document.getElementById('breadcrumb')).toBeInTheDocument();
  });
});