import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useIsMobile } from '../use-mobile';

// Mock window.matchMedia
const mockMatchMedia = vi.fn();

beforeEach(() => {
  // Reset all mocks before each test
  mockMatchMedia.mockReset();

  // Reset window properties
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: mockMatchMedia,
  });

  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    value: 1024, // Default to desktop width
  });
});

describe('useIsMobile', () => {
  it('returns false for desktop screen sizes', () => {
    // Mock window.innerWidth to be desktop size
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 1024, // Desktop width
    });

    mockMatchMedia.mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it('returns true for mobile screen sizes', () => {
    // Mock window.innerWidth to be mobile size
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 500, // Mobile width
    });

    mockMatchMedia.mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it('updates when screen size changes', () => {
    // Mock window.innerWidth to be desktop initially
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 1024, // Desktop width
    });

    const matches = false;
    let callback: ((event: { matches: boolean }) => void) | undefined;

    const addEventListener = vi.fn((event, cb) => {
      callback = cb;
    });

    mockMatchMedia.mockReturnValue({
      matches,
      addEventListener,
      removeEventListener: vi.fn(),
    });

    const { result } = renderHook(() => useIsMobile());

    // Initial state should be false (desktop)
    expect(result.current).toBe(false);

    // Simulate screen size change to mobile
    if (callback) {
      // Update window.innerWidth to mobile size
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 500, // Mobile width
      });
      callback({ matches: true });
    }
  });

  it('cleans up event listeners on unmount', () => {
    const removeEventListener = vi.fn();
    mockMatchMedia.mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener,
    });

    const { unmount } = renderHook(() => useIsMobile());
    unmount();

    expect(removeEventListener).toHaveBeenCalled();
  });
});
