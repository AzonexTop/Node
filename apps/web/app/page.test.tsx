import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Home from './page';

// Mock the shared utilities
vi.mock('@repo/shared', () => ({
  formatDate: vi.fn((date: Date) => '2023-12-01'),
}));

// Mock the shared UI components
vi.mock('@repo/ui', () => ({
  Button: ({ children, onClick, variant }: any) => (
    <button onClick={onClick} data-variant={variant}>
      {children}
    </button>
  ),
  Card: ({ title, children }: any) => (
    <div>
      <h2>{title}</h2>
      {children}
    </div>
  ),
}));

describe('Home Page', () => {
  it('renders the main heading', () => {
    render(<Home />);
    expect(screen.getByRole('heading', { name: /welcome to the monorepo/i })).toBeInTheDocument();
  });

  it('displays the current date', () => {
    render(<Home />);
    expect(screen.getByText(/today is 2023-12-01/i)).toBeInTheDocument();
  });

  it('renders the Getting Started card', () => {
    render(<Home />);
    expect(screen.getByRole('heading', { name: /getting started/i })).toBeInTheDocument();
    expect(screen.getByText(/this is a next\.js application using shared components and utilities\./i)).toBeInTheDocument();
  });

  it('renders the Click Me button with correct variant', () => {
    render(<Home />);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('data-variant', 'primary');
  });

  it('shows alert when button is clicked', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    render(<Home />);
    
    const button = screen.getByRole('button', { name: /click me/i });
    fireEvent.click(button);
    
    expect(alertSpy).toHaveBeenCalledWith('Button clicked!');
    alertSpy.mockRestore();
  });
});