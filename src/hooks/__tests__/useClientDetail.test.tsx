import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useClientDetail } from '../useClientDetail';
import { ReactNode } from 'react';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => {
  const mockFrom = vi.fn((table: string) => {
    const mockQuery = {
      select: vi.fn(() => mockQuery),
      insert: vi.fn(() => mockQuery),
      update: vi.fn(() => mockQuery),
      delete: vi.fn(() => mockQuery),
      eq: vi.fn(() => mockQuery),
      in: vi.fn(() => mockQuery),
      single: vi.fn(async () => ({ data: null, error: null })),
    };
    return mockQuery;
  });

  const createMockChannel = () => {
    const channel = {
      on: vi.fn(() => channel), // Return channel for chaining
      subscribe: vi.fn(() => ({
        unsubscribe: vi.fn(),
      })),
    };
    return channel;
  };

  const mockChannel = vi.fn(() => createMockChannel());
  const mockRemoveChannel = vi.fn();

  return {
    supabase: {
      from: mockFrom,
      channel: mockChannel,
      removeChannel: mockRemoveChannel,
    },
  };
});

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useClientDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('fetching client details', () => {
    it('should fetch client details when clientId provided', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const mockFrom = supabase.from as any;

      const mockClient = {
        id: 'client-1',
        name: 'Test Client',
        billing_email: 'billing@test.com',
        industry: 'Software',
        logo_initial: 'T',
        logo_color: 'bg-blue-500',
        notes: 'Test notes',
        monthly_rate: 1000,
        created_by: 'user-1',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      // Mock client query
      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(async () => ({
              data: mockClient,
              error: null,
            })),
          })),
        })),
      });

      // Mock client_users query
      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(async () => ({
            data: [],
            error: null,
          })),
        })),
      });

      // Mock profiles query (empty since no users)
      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          in: vi.fn(async () => ({
            data: [],
            error: null,
          })),
        })),
      });

      // Mock client_repos query
      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(async () => ({
            data: [],
            error: null,
          })),
        })),
      });

      // Mock repositories query (empty since no repos)
      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          in: vi.fn(async () => ({
            data: [],
            error: null,
          })),
        })),
      });

      const { result } = renderHook(() => useClientDetail('client-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      }, { timeout: 3000 });

      expect(result.current.client).toBeTruthy();
      if (result.current.client) {
        expect(result.current.client.name).toBe('Test Client');
        expect(result.current.client.id).toBe('client-1');
      }
    });

    it('should not fetch when clientId is undefined', async () => {
      const { result } = renderHook(() => useClientDetail(undefined), {
        wrapper: createWrapper(),
      });

      // When clientId is undefined, queries are disabled, so isLoading should be false immediately
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      }, { timeout: 1000 });

      expect(result.current.client).toBeNull();
      expect(result.current.users).toEqual([]);
      expect(result.current.repos).toEqual([]);
    });

    it('should handle fetch errors', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const mockFrom = supabase.from as any;

      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(async () => ({
              data: null,
              error: { message: 'Client not found' },
            })),
          })),
        })),
      });

      const { result } = renderHook(() => useClientDetail('client-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      }, { timeout: 3000 });

      expect(result.current.error).toBeTruthy();
    });
  });

  describe('fetching client users', () => {
    it('should fetch users with profiles', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const mockFrom = supabase.from as any;

      // Mock client query
      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(async () => ({
              data: { id: 'client-1', name: 'Test Client' },
              error: null,
            })),
          })),
        })),
      });

      // Mock client_users query
      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(async () => ({
            data: [
              { id: 'cu-1', user_id: 'user-1', client_id: 'client-1' },
              { id: 'cu-2', user_id: 'user-2', client_id: 'client-1' },
            ],
            error: null,
          })),
        })),
      });

      // Mock profiles query
      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          in: vi.fn(async () => ({
            data: [
              { user_id: 'user-1', email: 'user1@test.com', full_name: 'User 1' },
              { user_id: 'user-2', email: 'user2@test.com', full_name: 'User 2' },
            ],
            error: null,
          })),
        })),
      });

      // Mock client_repos query
      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(async () => ({
            data: [],
            error: null,
          })),
        })),
      });

      // Mock repositories query
      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          in: vi.fn(async () => ({
            data: [],
            error: null,
          })),
        })),
      });

      const { result } = renderHook(() => useClientDetail('client-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      }, { timeout: 3000 });

      expect(result.current.users).toHaveLength(2);
      expect(result.current.users[0].profile?.email).toBe('user1@test.com');
      expect(result.current.users[1].profile?.email).toBe('user2@test.com');
    });
  });

  describe('fetching client repos', () => {
    it('should fetch repos with repository details', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const mockFrom = supabase.from as any;

      // Mock client query
      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(async () => ({
              data: { id: 'client-1', name: 'Test Client' },
              error: null,
            })),
          })),
        })),
      });

      // Mock client_users query
      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(async () => ({
            data: [],
            error: null,
          })),
        })),
      });

      // Mock profiles query
      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          in: vi.fn(async () => ({
            data: [],
            error: null,
          })),
        })),
      });

      // Mock client_repos query
      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(async () => ({
            data: [
              { id: 'cr-1', repo_id: 'repo-1', client_id: 'client-1' },
            ],
            error: null,
          })),
        })),
      });

      // Mock repositories query
      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          in: vi.fn(async () => ({
            data: [
              {
                id: 'repo-1',
                name: 'Test Repo',
                full_name: 'test/repo',
                description: 'Test description',
                github_url: 'https://github.com/test/repo',
                status: 'healthy',
                security_score: 95,
                last_deploy: '2024-01-15T10:00:00Z',
                language: 'TypeScript',
              },
            ],
            error: null,
          })),
        })),
      });

      const { result } = renderHook(() => useClientDetail('client-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      }, { timeout: 3000 });

      expect(result.current.repos).toHaveLength(1);
      expect(result.current.repos[0].repository?.name).toBe('Test Repo');
    });
  });

  describe('mutations', () => {
    it('should remove user from client', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const mockFrom = supabase.from as any;

      // Mock initial queries
      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(async () => ({
              data: { id: 'client-1' },
              error: null,
            })),
          })),
        })),
      });

      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(async () => ({
            data: [],
            error: null,
          })),
        })),
      });

      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          in: vi.fn(async () => ({
            data: [],
            error: null,
          })),
        })),
      });

      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(async () => ({
            data: [],
            error: null,
          })),
        })),
      });

      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          in: vi.fn(async () => ({
            data: [],
            error: null,
          })),
        })),
      });

      const { result } = renderHook(() => useClientDetail('client-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      }, { timeout: 3000 });

      // Mock delete mutation
      mockFrom.mockReturnValueOnce({
        delete: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(async () => ({ error: null })),
          })),
        })),
      });

      await result.current.removeUser.mutateAsync('user-1');

      expect(mockFrom).toHaveBeenCalledWith('client_users');
    });

    it('should unassign repo from client', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const mockFrom = supabase.from as any;

      // Mock initial queries
      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(async () => ({
              data: { id: 'client-1' },
              error: null,
            })),
          })),
        })),
      });

      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(async () => ({
            data: [],
            error: null,
          })),
        })),
      });

      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          in: vi.fn(async () => ({
            data: [],
            error: null,
          })),
        })),
      });

      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(async () => ({
            data: [],
            error: null,
          })),
        })),
      });

      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          in: vi.fn(async () => ({
            data: [],
            error: null,
          })),
        })),
      });

      const { result } = renderHook(() => useClientDetail('client-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      }, { timeout: 3000 });

      // Mock delete mutation
      mockFrom.mockReturnValueOnce({
        delete: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(async () => ({ error: null })),
          })),
        })),
      });

      await result.current.unassignRepo.mutateAsync('repo-1');

      expect(mockFrom).toHaveBeenCalledWith('client_repos');
    });

    it('should update user role', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const mockFrom = supabase.from as any;

      // Mock initial queries
      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(async () => ({
              data: { id: 'client-1' },
              error: null,
            })),
          })),
        })),
      });

      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(async () => ({
            data: [],
            error: null,
          })),
        })),
      });

      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          in: vi.fn(async () => ({
            data: [],
            error: null,
          })),
        })),
      });

      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(async () => ({
            data: [],
            error: null,
          })),
        })),
      });

      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          in: vi.fn(async () => ({
            data: [],
            error: null,
          })),
        })),
      });

      const { result } = renderHook(() => useClientDetail('client-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      }, { timeout: 3000 });

      // Mock update mutation
      mockFrom.mockReturnValueOnce({
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(async () => ({ error: null })),
          })),
        })),
      });

      await result.current.updateUserRole.mutateAsync({
        userId: 'user-1',
        role: 'admin',
      });

      expect(mockFrom).toHaveBeenCalledWith('client_users');
    });
  });

  describe('realtime subscription', () => {
    it('should set up realtime subscriptions', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const mockFrom = supabase.from as any;

      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(async () => ({
              data: { id: 'client-1' },
              error: null,
            })),
          })),
        })),
      });

      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(async () => ({
            data: [],
            error: null,
          })),
        })),
      });

      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          in: vi.fn(async () => ({
            data: [],
            error: null,
          })),
        })),
      });

      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(async () => ({
            data: [],
            error: null,
          })),
        })),
      });

      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          in: vi.fn(async () => ({
            data: [],
            error: null,
          })),
        })),
      });

      renderHook(() => useClientDetail('client-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(supabase.channel).toHaveBeenCalledWith('client-detail-client-1');
      });

      const channelCall = (supabase.channel as any).mock.results[0].value;
      // Should have 3 .on() calls (for clients, client_users, client_repos)
      expect(channelCall.on).toHaveBeenCalledTimes(3);
    });
  });
});
