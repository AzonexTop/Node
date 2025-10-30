import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from './Button';

describe('Button Component', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('font-semibold', 'rounded', 'transition-colors');
    expect(button).toHaveClass('bg-blue-600', 'hover:bg-blue-700', 'text-white');
    expect(button).toHaveClass('px-4', 'py-2', 'text-base');
  });

  it('renders with different variants', () => {
    const { rerender } = render(<Button variant="secondary">Button</Button>);
    let button = screen.getByRole('button');
    expect(button).toHaveClass('bg-gray-600', 'hover:bg-gray-700');

    rerender(<Button variant="danger">Button</Button>);
    button = screen.getByRole('button');
    expect(button).toHaveClass('bg-red-600', 'hover:bg-red-700');
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<Button size="small">Button</Button>);
    let button = screen.getByRole('button');
    expect(button).toHaveClass('px-3', 'py-1', 'text-sm');

    rerender(<Button size="large">Button</Button>);
    button = screen.getByRole('button');
    expect(button).toHaveClass('px-6', 'py-3', 'text-lg');
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies custom className', () => {
    render(<Button className="custom-class">Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('passes through other button props', () => {
    render(<Button disabled>Disabled Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('merges classes correctly', () => {
    render(
      <Button variant="primary" size="large" className="shadow-lg">
        Button
      </Button>
    );
    const button = screen.getByRole('button');
    expect(button).toHaveClass('shadow-lg');
    expect(button).toHaveClass('bg-blue-600', 'px-6', 'py-3');
  });
});