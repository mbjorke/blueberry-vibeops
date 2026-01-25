import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useClients } from '../useClients';
import { ReactNode } from 'react';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => {
  const mockAuth = {
    getUser: vi.fn(async () => ({
      data: { user: { id: '00000000-0000-0000-0000-000000000004' } },
      error: null,
    })),
  };

  const mockFrom = vi.fn((table: string) => {
    const mockQuery = {
      select: vi.fn(() => mockQuery),
      insert: vi.fn(() => mockQuery),
      update: vi.fn(() => mockQuery),
      delete: vi.fn(() => mockQuery),
      eq: vi.fn(() => mockQuery),
      order: vi.fn(() => mockQuery),
      single: vi.fn(async () => ({ data: null, error: null })),
    };
    return mockQuery;
  });

  const mockChannel = vi.fn(() => {
    const channel = {
      on: vi.fn(() => channel), // Return channel for chaining
      subscribe: vi.fn(() => ({
        unsubscribe: vi.fn(),
      })),
    };
    return channel;
  });

  const mockRemoveChannel = vi.fn();

  return {
    supabase: {
      auth: mockAuth,
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

describe('useClients', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('fetching clients', () => {
    it('should fetch all clients with counts', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const mockFrom = supabase.from as any;

      const mockClients = [
        {
          id: 'client-1',
          name: 'Test Client 1',
          billing_email: 'billing@test.com',
          industry: 'Software',
          logo_initial: 'T',
          logo_color: 'bg-blue-500',
          notes: null,
          monthly_rate: 1000,
          created_by: 'user-1',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ];

      // Mock clients query
      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          order: vi.fn(async () => ({
            data: mockClients,
            error: null,
          })),
        })),
      });

      // Mock repo count query
      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(async () => ({
            count: 5,
            data: null,
            error: null,
          })),
        })),
      });

      // Mock user count query
      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(async () => ({
            count: 3,
            data: null,
            error: null,
          })),
        })),
      });

      const { result } = renderHook(() => useClients(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.clients).toHaveLength(1);
      expect(result.current.clients[0].name).toBe('Test Client 1');
      expect(result.current.clients[0].repo_count).toBe(5);
      expect(result.current.clients[0].user_count).toBe(3);
    });

    it('should handle empty clients list', async () => {
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

      const { result } = renderHook(() => useClients(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.clients).toEqual([]);
    });

    it('should handle fetch errors', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const mockFrom = supabase.from as any;

      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          order: vi.fn(async () => ({
            data: null,
            error: { message: 'Database error' },
          })),
        })),
      });

      const { result } = renderHook(() => useClients(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
    });
  });

  describe('mutations', () => {
    it('should create a new client', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const mockFrom = supabase.from as any;

      // Mock initial fetch
      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          order: vi.fn(async () => ({
            data: [],
            error: null,
          })),
        })),
      });

      const { result } = renderHook(() => useClients(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Mock create mutation
      const newClient = {
        name: 'New Client',
        billing_email: 'new@test.com',
        industry: 'Finance',
        logo_initial: 'N',
        logo_color: 'bg-green-500',
        notes: 'Test notes',
        monthly_rate: 2000,
      };

      mockFrom.mockReturnValueOnce({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(async () => ({
              data: { id: 'client-new', ...newClient, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
              error: null,
            })),
          })),
        })),
      });

      await result.current.createClient.mutateAsync(newClient);

      expect(mockFrom).toHaveBeenCalledWith('clients');
    });

    it('should update an existing client', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const mockFrom = supabase.from as any;

      // Mock initial fetch
      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          order: vi.fn(async () => ({
            data: [],
            error: null,
          })),
        })),
      });

      const { result } = renderHook(() => useClients(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Mock update mutation
      mockFrom.mockReturnValueOnce({
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(async () => ({
                data: { id: 'client-1', name: 'Updated Client' },
                error: null,
              })),
            })),
          })),
        })),
      });

      await result.current.updateClient.mutateAsync({
        id: 'client-1',
        name: 'Updated Client',
      });

      expect(mockFrom).toHaveBeenCalledWith('clients');
    });

    it('should delete a client', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const mockFrom = supabase.from as any;

      // Mock initial fetch
      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          order: vi.fn(async () => ({
            data: [],
            error: null,
          })),
        })),
      });

      const { result } = renderHook(() => useClients(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Mock delete mutation
      mockFrom.mockReturnValueOnce({
        delete: vi.fn(() => ({
          eq: vi.fn(async () => ({ error: null })),
        })),
      });

      await result.current.deleteClient.mutateAsync('client-1');

      expect(mockFrom).toHaveBeenCalledWith('clients');
    });
  });

  describe('realtime subscription', () => {
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

      renderHook(() => useClients(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(supabase.channel).toHaveBeenCalledWith('clients-changes');
      });

      const channelCall = (supabase.channel as any).mock.results[0].value;
      expect(channelCall.on).toHaveBeenCalledWith(
        'postgres_changes',
        expect.objectContaining({
          event: '*',
          schema: 'public',
          table: 'clients',
        }),
        expect.any(Function)
      );
    });
  });
});
