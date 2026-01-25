import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SummaryCards } from '../SummaryCards';

describe('SummaryCards', () => {
  const defaultProps = {
    totalProjects: 10,
    healthyCount: 7,
    warningCount: 3,
    scansThisWeek: 25,
    revenue: '€12,500',
  };

  describe('rendering', () => {
    it('should render all summary cards', () => {
      render(<SummaryCards {...defaultProps} />);

      expect(screen.getByText('Total Projects')).toBeInTheDocument();
      expect(screen.getByText('Health Status')).toBeInTheDocument();
      expect(screen.getByText('Security Scans')).toBeInTheDocument();
      expect(screen.getByText('Revenue Impact')).toBeInTheDocument();
    });

    it('should display total projects count', () => {
      render(<SummaryCards {...defaultProps} />);

      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('+2 this month')).toBeInTheDocument();
    });

    it('should display health status', () => {
      render(<SummaryCards {...defaultProps} />);

      expect(screen.getByText('7 Healthy')).toBeInTheDocument();
      expect(screen.getByText('3 need attention')).toBeInTheDocument();
    });

    it('should display security scans count', () => {
      render(<SummaryCards {...defaultProps} />);

      expect(screen.getByText('25')).toBeInTheDocument();
      expect(screen.getByText('This week')).toBeInTheDocument();
      expect(screen.getByText('+12 since last week')).toBeInTheDocument();
    });

    it('should display revenue', () => {
      render(<SummaryCards {...defaultProps} />);

      expect(screen.getByText('€12,500')).toBeInTheDocument();
      expect(screen.getByText('Monthly recurring')).toBeInTheDocument();
    });
  });

  describe('dynamic values', () => {
    it('should update when props change', () => {
      const { rerender } = render(<SummaryCards {...defaultProps} />);

      expect(screen.getByText('10')).toBeInTheDocument();

      rerender(
        <SummaryCards
          totalProjects={15}
          healthyCount={12}
          warningCount={3}
          scansThisWeek={30}
          revenue="€15,000"
        />
      );

      expect(screen.getByText('15')).toBeInTheDocument();
      expect(screen.getByText('12 Healthy')).toBeInTheDocument();
      expect(screen.getByText('30')).toBeInTheDocument();
      expect(screen.getByText('€15,000')).toBeInTheDocument();
    });

    it('should handle zero values', () => {
      render(
        <SummaryCards
          totalProjects={0}
          healthyCount={0}
          warningCount={0}
          scansThisWeek={0}
          revenue="€0"
        />
      );

      // Check for specific zero values in context
      expect(screen.getByText('Total Projects')).toBeInTheDocument();
      const totalProjectsCard = screen.getByText('Total Projects').closest('.summary-card');
      expect(totalProjectsCard).toHaveTextContent('0');
      
      expect(screen.getByText('0 Healthy')).toBeInTheDocument();
      expect(screen.getByText('€0')).toBeInTheDocument();
    });

    it('should handle large values', () => {
      render(
        <SummaryCards
          totalProjects={999}
          healthyCount={800}
          warningCount={199}
          scansThisWeek={5000}
          revenue="€1,000,000"
        />
      );

      expect(screen.getByText('999')).toBeInTheDocument();
      expect(screen.getByText('800 Healthy')).toBeInTheDocument();
      expect(screen.getByText('5000')).toBeInTheDocument();
      expect(screen.getByText('€1,000,000')).toBeInTheDocument();
    });
  });

  describe('icons', () => {
    it('should render appropriate icons for each card', () => {
      const { container } = render(<SummaryCards {...defaultProps} />);

      // Check for icon containers (they use lucide-react icons)
      const iconContainers = container.querySelectorAll('[class*="p-2.5"]');
      expect(iconContainers.length).toBeGreaterThan(0);
    });
  });

  describe('visual elements', () => {
    it('should render mini bar chart for health status', () => {
      const { container } = render(<SummaryCards {...defaultProps} />);

      // The mini bar chart consists of 8 bars
      const bars = container.querySelectorAll('[class*="rounded-sm"]');
      expect(bars.length).toBeGreaterThanOrEqual(8);
    });
  });
});
