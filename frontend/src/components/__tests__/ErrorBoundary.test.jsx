import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ErrorBoundary from '../ErrorBoundary';

function Bomba() {
  throw new Error('boom');
}

describe('ErrorBoundary', () => {
  it('pokazuje fallback gdy dziecko rzuca błąd', () => {
    // wyciszamy spodziewany błąd w konsoli
    vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <Bomba />
      </ErrorBoundary>
    );
    expect(screen.getByText(/Coś poszło nie tak/i)).toBeInTheDocument();
  });

  it('renderuje dzieci gdy nie ma błędu', () => {
    render(
      <ErrorBoundary>
        <div>Treść OK</div>
      </ErrorBoundary>
    );
    expect(screen.getByText('Treść OK')).toBeInTheDocument();
  });
});
