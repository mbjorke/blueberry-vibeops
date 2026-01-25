import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useGitHubApp } from '../useGitHubApp';

// Mock environment variables
vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co');
vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', 'test-key');

// Mock fetch
global.fetch = vi.fn();

describe('useGitHubApp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('should start with empty state', () => {
      const { result } = renderHook(() => useGitHubApp());

      expect(result.current.installations).toEqual([]);
      expect(result.current.repositories).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('fetchInstallations', () => {
    it('should fetch installations successfully', async () => {
      const mockInstallations = [
        {
          id: 123456,
          account: {
            login: 'test-org',
            avatar_url: 'https://avatars.githubusercontent.com/u/123',
            type: 'Organization',
          },
          app_id: 12345,
          target_type: 'Organization',
          permissions: {
            contents: 'read',
            metadata: 'read',
          },
          events: ['push', 'pull_request'],
        },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ installations: mockInstallations }),
      });

      const { result } = renderHook(() => useGitHubApp());

      await result.current.fetchInstallations();

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.installations).toHaveLength(1);
      expect(result.current.installations[0].id).toBe(123456);
      expect(result.current.installations[0].account.login).toBe('test-org');
      expect(result.current.error).toBeNull();
    });

    it('should handle empty installations list', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ installations: [] }),
      });

      const { result } = renderHook(() => useGitHubApp());

      await result.current.fetchInstallations();

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.installations).toEqual([]);
      expect(result.current.error).toBeNull();
    });

    it('should handle fetch errors', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal server error' }),
      });

      const { result } = renderHook(() => useGitHubApp());

      await result.current.fetchInstallations();

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.installations).toEqual([]);
      expect(result.current.error).toBeTruthy();
      expect(result.current.error).toContain('Failed to fetch installations');
    });

    it('should handle network errors', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useGitHubApp());

      await result.current.fetchInstallations();

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Network error');
    });

    it('should set loading state during fetch', async () => {
      let resolveFetch: (value: any) => void;
      const fetchPromise = new Promise((resolve) => {
        resolveFetch = resolve;
      });

      (global.fetch as any).mockReturnValueOnce(fetchPromise);

      const { result } = renderHook(() => useGitHubApp());

      const fetchPromise2 = result.current.fetchInstallations();

      // Loading should be true while fetching
      expect(result.current.loading).toBe(true);

      resolveFetch!({
        ok: true,
        json: async () => ({ installations: [] }),
      });

      await fetchPromise2;

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe('fetchRepositories', () => {
    it('should fetch repositories for installation', async () => {
      const mockRepositories = [
        {
          id: 789012,
          name: 'test-repo',
          full_name: 'test-org/test-repo',
          description: 'Test repository',
          private: false,
          html_url: 'https://github.com/test-org/test-repo',
          language: 'TypeScript',
          stargazers_count: 42,
          default_branch: 'main',
          owner: {
            login: 'test-org',
            avatar_url: 'https://avatars.githubusercontent.com/u/123',
          },
        },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ repositories: mockRepositories }),
      });

      const { result } = renderHook(() => useGitHubApp());

      await result.current.fetchRepositories(123456);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.repositories).toHaveLength(1);
      expect(result.current.repositories[0].id).toBe(789012);
      expect(result.current.repositories[0].name).toBe('test-repo');
      expect(result.current.repositories[0].full_name).toBe('test-org/test-repo');
      expect(result.current.error).toBeNull();
    });

    it('should clear previous repositories when fetching new ones', async () => {
      // First fetch
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          repositories: [{ id: 1, name: 'repo-1', full_name: 'org/repo-1' }],
        }),
      });

      const { result } = renderHook(() => useGitHubApp());

      await result.current.fetchRepositories(123456);

      await waitFor(() => {
        expect(result.current.repositories).toHaveLength(1);
      });

      // Second fetch should clear previous
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          repositories: [{ id: 2, name: 'repo-2', full_name: 'org/repo-2' }],
        }),
      });

      await result.current.fetchRepositories(789012);

      await waitFor(() => {
        expect(result.current.repositories).toHaveLength(1);
        expect(result.current.repositories[0].id).toBe(2);
      });
    });

    it('should handle empty repositories list', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ repositories: [] }),
      });

      const { result } = renderHook(() => useGitHubApp());

      await result.current.fetchRepositories(123456);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.repositories).toEqual([]);
      expect(result.current.error).toBeNull();
    });

    it('should handle fetch errors', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({}),
      });

      const { result } = renderHook(() => useGitHubApp());

      await result.current.fetchRepositories(123456);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.repositories).toEqual([]);
      expect(result.current.error).toBeTruthy();
      expect(result.current.error).toContain('Failed to fetch repositories');
    });

    it('should use correct URL and headers', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ repositories: [] }),
      });

      const { result } = renderHook(() => useGitHubApp());

      await result.current.fetchRepositories(123456);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://test.supabase.co/functions/v1/github-app-auth?action=list-repos&installation_id=123456',
        {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer test-key',
            'Content-Type': 'application/json',
          },
        }
      );
    });
  });

  describe('error handling', () => {
    it('should clear error on successful fetch after error', async () => {
      // First fetch fails
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Server error' }),
      });

      const { result } = renderHook(() => useGitHubApp());

      await result.current.fetchInstallations();

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      // Second fetch succeeds
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ installations: [] }),
      });

      await result.current.fetchInstallations();

      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });
    });
  });
});
