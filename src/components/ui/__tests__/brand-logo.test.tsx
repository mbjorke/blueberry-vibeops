import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrandLogo } from '../brand-logo';

describe('BrandLogo', () => {
  it('renders the blueberry text', () => {
    render(<BrandLogo />);
    expect(screen.getByText('blueberry')).toBeInTheDocument();
  });

  it('renders the gradient icon', () => {
    const { container } = render(<BrandLogo />);
    const icon = container.querySelector('div.h-6.w-6.rounded-full');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass('bg-gradient-to-br', 'from-primary', 'to-primary-glow');
  });

  it('applies custom className', () => {
    const { container } = render(<BrandLogo className="custom-class" />);
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('custom-class');
  });

  it('renders variant badge when variant prop is provided', () => {
    render(<BrandLogo variant="v1.0.0" />);
    expect(screen.getByText('v1.0.0')).toBeInTheDocument();
  });

  it('does not render variant badge when no variant prop', () => {
    render(<BrandLogo />);
    expect(screen.queryByText('v1.0.0')).not.toBeInTheDocument();
  });

  it('has correct flex layout', () => {
    const { container } = render(<BrandLogo />);
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('flex', 'items-center', 'gap-2');
  });
});
