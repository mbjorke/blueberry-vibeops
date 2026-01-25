
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useProjects } from '../useProjects';
import { mockProjects } from '@/test/fixtures/projects';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => {
  const mockFrom = vi.fn((table: string) => {
    const mockQuery = {
      select: vi.fn(() => mockQuery),
      order: vi.fn(() => mockQuery),
      eq: vi.fn(() => mockQuery),
    };
    return mockQuery;
  });

  const mockChannel = vi.fn(() => ({
    on: vi.fn(() => ({
      subscribe: vi.fn(() => ({
        unsubscribe: vi.fn(),
      })),
    })),
    subscribe: vi.fn(() => ({
      unsubscribe: vi.fn(),
    })),
  }));

  const mockRemoveChannel = vi.fn();

  return {
    supabase: {
      from: mockFrom,
      channel: mockChannel,
      removeChannel: mockRemoveChannel,
    },
  };
});

describe('useProjects', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('should start with loading state', () => {
      const { result } = renderHook(() => useProjects());

      expect(result.current.loading).toBe(true);
      expect(result.current.projects).toEqual([]);
      expect(result.current.error).toBeNull();
    });
  });

  describe('fetching projects', () => {
    it('should fetch projects successfully', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const mockDbRepos = [
        {
          id: 'repo-1',
          name: 'Test Project 1',
          full_name: 'test/project-1',
          description: 'Test description',
          industry: 'Software',
          status: 'healthy',
          environments: {
            dev: 'ok',
            staging: 'ok',
            prod: 'ok',
          },
          security_score: 95,
          last_deploy: '2024-01-15T10:00:00Z',
          issues: [],
          github_repo_id: 123,
          github_url: 'https://github.com/test/project-1',
          private: false,
          language: 'TypeScript',
          stars_count: 10,
          created_at: '2024-01-01T00:00:00Z',
        },
        {
          id: 'repo-2',
          name: 'Test Project 2',
          full_name: 'test/project-2',
          description: 'Test description 2',
          industry: 'Finance',
          status: 'warning',
          environments: {
            dev: 'ok',
            staging: 'warning',
            prod: 'ok',
          },
          security_score: 75,
          last_deploy: '2024-01-10T10:00:00Z',
          issues: ['Security vulnerability'],
          github_repo_id: 456,
          github_url: 'https://github.com/test/project-2',
          private: true,
          language: 'Python',
          stars_count: 5,
          created_at: '2024-01-02T00:00:00Z',
        },
      ];

      const mockFrom = supabase.from as any;
      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          order: vi.fn(async () => ({
            data: mockDbRepos,
            error: null,
          })),
        })),
      });

      const { result } = renderHook(() => useProjects());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.projects).toHaveLength(2);
      expect(result.current.projects[0].name).toBe('Test Project 1');
      expect(result.current.projects[0].status).toBe('healthy');
      expect(result.current.projects[0].securityScore).toBe(95);
      expect(result.current.projects[1].name).toBe('Test Project 2');
      expect(result.current.projects[1].status).toBe('warning');
      expect(result.current.projects[1].securityScore).toBe(75);
      expect(result.current.error).toBeNull();
    });

    it('should handle empty projects list', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const mockFrom = supabase.from as any;
      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          order: vi.fn(async () => ({
            data: [],
            error: null,
          })),
        })),
      });

      const { result } = renderHook(() => useProjects());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.projects).toEqual([]);
      expect(result.current.error).toBeNull();
    });

    it('should handle fetch errors', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const mockFrom = supabase.from as any;
      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          order: vi.fn(async () => ({
            data: null,
            error: { message: 'Database connection failed' },
          })),
        })),
      });

      const { result } = renderHook(() => useProjects());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.projects).toEqual([]);
      // The implementation uses a generic error message as fallback
      expect(result.current.error).toBeTruthy();
      expect(result.current.error).toContain('Failed to fetch');
    });

    it('should map database repos to projects correctly', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const mockDbRepo = {
        id: 'repo-1',
        name: 'My Project',
        full_name: 'user/my-project',
        description: 'A test project',
        industry: null,
        status: 'healthy',
        environments: {
          dev: 'ok',
          staging: 'ok',
          prod: 'ok',
        },
        security_score: 85,
        last_deploy: '2024-01-15T10:00:00Z',
        issues: null,
        github_repo_id: 123,
        github_url: 'https://github.com/user/my-project',
        private: false,
        language: 'TypeScript',
        stars_count: 10,
        created_at: '2024-01-01T00:00:00Z',
      };

      const mockFrom = supabase.from as any;
      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          order: vi.fn(async () => ({
            data: [mockDbRepo],
            error: null,
          })),
        })),
      });

      const { result } = renderHook(() => useProjects());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const project = result.current.projects[0];
      expect(project.id).toBe('repo-1');
      expect(project.name).toBe('My Project');
      expect(project.industry).toBe('TypeScript'); // Uses language as fallback
      expect(project.status).toBe('healthy');
      expect(project.securityScore).toBe(85);
      expect(project.logoInitial).toBe('M');
      expect(project.issues).toEqual([]);
    });
  });

  describe('realtime updates', () => {
    it('should set up realtime subscription', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const mockFrom = supabase.from as any;
      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          order: vi.fn(async () => ({
            data: [],
            error: null,
          })),
        })),
      });

      renderHook(() => useProjects());

      await waitFor(() => {
        expect(supabase.channel).toHaveBeenCalledWith('repositories-changes');
      });

      const channelCall = (supabase.channel as any).mock.results[0].value;
      expect(channelCall.on).toHaveBeenCalledWith(
        'postgres_changes',
        expect.objectContaining({
          event: '*',
          schema: 'public',
          table: 'repositories',
        }),
        expect.any(Function)
      );
    });

    it('should refetch projects on realtime update', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const mockFrom = supabase.from as any;
      let fetchCount = 0;
      
      mockFrom.mockImplementation(() => {
        fetchCount++;
        return {
          select: vi.fn(() => ({
            order: vi.fn(async () => ({
              data: [{ id: `repo-${fetchCount}`, name: `Project ${fetchCount}` }],
              error: null,
            })),
          })),
        };
      });

      const { result } = renderHook(() => useProjects());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Trigger realtime callback
      const channelCall = (supabase.channel as any).mock.results[0].value;
      const onCallback = (channelCall.on as any).mock.calls[0][2];
      onCallback();

      await waitFor(() => {
        expect(fetchCount).toBeGreaterThan(1);
      });
    });
  });

  describe('refetch', () => {
    it('should allow manual refetch', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const mockFrom = supabase.from as any;
      let fetchCount = 0;
      
      mockFrom.mockImplementation(() => {
        fetchCount++;
        return {
          select: vi.fn(() => ({
            order: vi.fn(async () => ({
              data: [{ id: `repo-${fetchCount}`, name: `Project ${fetchCount}` }],
              error: null,
            })),
          })),
        };
      });

      const { result } = renderHook(() => useProjects());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const initialCount = fetchCount;
      await result.current.refetch();

      await waitFor(() => {
        expect(fetchCount).toBeGreaterThan(initialCount);
      });
    });
  });

  describe('edge cases', () => {
    it('should handle null security_score', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const mockDbRepo = {
        id: 'repo-1',
        name: 'Test Project',
        full_name: 'test/project',
        description: null,
        industry: null,
        status: 'healthy',
        environments: {
          dev: 'ok',
          staging: 'ok',
          prod: 'ok',
        },
        security_score: null,
        last_deploy: null,
        issues: null,
        github_repo_id: null,
        github_url: null,
        private: null,
        language: null,
        stars_count: null,
        created_at: '2024-01-01T00:00:00Z',
      };

      const mockFrom = supabase.from as any;
      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          order: vi.fn(async () => ({
            data: [mockDbRepo],
            error: null,
          })),
        })),
      });

      const { result } = renderHook(() => useProjects());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.projects[0].securityScore).toBe(85); // Default value
      expect(result.current.projects[0].lastDeploy).toBe('Never');
    });

    it('should handle missing environments', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const mockDbRepo = {
        id: 'repo-1',
        name: 'Test Project',
        full_name: 'test/project',
        description: null,
        industry: null,
        status: 'healthy',
        environments: null,
        security_score: 90,
        last_deploy: '2024-01-15T10:00:00Z',
        issues: [],
        github_repo_id: 123,
        github_url: 'https://github.com/test/project',
        private: false,
        language: 'TypeScript',
        stars_count: 10,
        created_at: '2024-01-01T00:00:00Z',
      };

      const mockFrom = supabase.from as any;
      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          order: vi.fn(async () => ({
            data: [mockDbRepo],
            error: null,
          })),
        })),
      });

      const { result } = renderHook(() => useProjects());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const project = result.current.projects[0];
      expect(project.environments.dev).toBe('ok'); // Default value
      expect(project.environments.staging).toBe('ok'); // Default value
      expect(project.environments.prod).toBe('ok'); // Default value
    });
  });
});
