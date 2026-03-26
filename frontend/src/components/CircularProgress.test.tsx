import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CircularProgress } from '../components/CircularProgress';

describe('CircularProgress', () => {
  it('mostra la percentuale corretta', () => {
    render(<CircularProgress percentage={80} label="Copertura Test" />);
    expect(screen.getByText('80%')).toBeInTheDocument();
  });

  it('mostra la label corretta', () => {
    render(<CircularProgress percentage={80} label="Copertura Test" />);
    expect(screen.getByText('Copertura Test')).toBeInTheDocument();
  });

  it('applica la classe top-performance per percentuale >= 90', () => {
    render(<CircularProgress percentage={95} label="Top" />);
    expect(document.querySelector('.top-performance')).toBeInTheDocument();
  });

  it('applica la classe medium-performance per percentuale >= 50', () => {
    render(<CircularProgress percentage={70} label="Medium" />);
    expect(document.querySelector('.medium-performance')).toBeInTheDocument();
  });

  it('applica la classe bad-performance per percentuale < 50', () => {
    render(<CircularProgress percentage={30} label="Bad" />);
    expect(document.querySelector('.bad-performance')).toBeInTheDocument();
  });

  it('usa la dimensione di default 90 se non specificata', () => {
    render(<CircularProgress percentage={50} label="Test" />);
    const svg = document.querySelector('svg');
    expect(svg).toHaveAttribute('height', '90');
    expect(svg).toHaveAttribute('width', '90');
  });

  it('usa la dimensione personalizzata se specificata', () => {
    render(<CircularProgress percentage={50} label="Test" size={120} />);
    const svg = document.querySelector('svg');
    expect(svg).toHaveAttribute('height', '120');
    expect(svg).toHaveAttribute('width', '120');
  });
});