import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAuth, AuthProvider } from '../useAuth';
import { mockAdminUser, mockClientUser, mockSuperAdminUser } from '@/test/fixtures/users';
import { mockOrganization1 } from '@/test/fixtures/organizations';
import { BrowserRouter } from 'react-router-dom';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => {
  const mockAuth = {
    user: null as any,
    session: null as any,
    onAuthStateChange: vi.fn((callback) => {
      (mockAuth as any)._authStateCallback = callback;
      return {
        data: {
          subscription: {
            unsubscribe: vi.fn(),
          },
        },
      };
    }),
    getSession: vi.fn(async () => ({
      data: { session: mockAuth.session },
      error: null,
    })),
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    updateUser: vi.fn(),
    setSession: vi.fn(),
    _authStateCallback: null as any,
  };

  const mockFrom = vi.fn((table: string) => {
    const mockQuery = {
      select: vi.fn(() => mockQuery),
      eq: vi.fn(() => mockQuery),
      maybeSingle: vi.fn(async () => ({ data: null, error: null })),
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
      auth: mockAuth,
      from: mockFrom,
      channel: mockChannel,
      removeChannel: mockRemoveChannel,
    },
  };
});

describe('useAuth - Password Reset Scenarios', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>
      <AuthProvider>{children}</AuthProvider>
    </BrowserRouter>
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Role Preservation After Password Reset', () => {
    it('should preserve admin role after password reset', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const mockSession = {
        access_token: 'token',
        refresh_token: 'refresh',
        expires_in: 3600,
        expires_at: Date.now() / 1000 + 3600,
        token_type: 'bearer',
        user: mockAdminUser,
      };

      // Initial session setup
      supabase.auth.getSession = vi.fn(async () => ({
        data: { session: mockSession },
        error: null,
      }));

      // Mock role fetch - admin role exists
      const mockFrom = supabase.from as any;
      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn(async () => ({
              data: { role: 'admin' },
              error: null,
            })),
          })),
        })),
      });

      // Mock organizations fetch
      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(async () => ({
            data: [
              {
                client_id: mockOrganization1.id,
                is_org_admin: true,
                clients: mockOrganization1,
              },
            ],
            error: null,
          })),
        })),
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      }, { timeout: 3000 });

      // Verify initial role
      await waitFor(() => {
        expect(result.current.role).toBe('admin');
        expect(result.current.isAdmin).toBe(true);
      }, { timeout: 3000 });

      // Simulate password reset - trigger auth state change
      const newSession = {
        ...mockSession,
        access_token: 'new_token',
      };

      if (supabase.auth._authStateCallback) {
        supabase.auth._authStateCallback('PASSWORD_RECOVERY', newSession);
      }

      // Mock role fetch after password reset - should still be admin
      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn(async () => ({
              data: { role: 'admin' },
              error: null,
            })),
          })),
        })),
      });

      // Mock organizations fetch after password reset
      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(async () => ({
            data: [
              {
                client_id: mockOrganization1.id,
                is_org_admin: true,
                clients: mockOrganization1,
              },
            ],
            error: null,
          })),
        })),
      });

      // Wait for role to be refetched
      await waitFor(() => {
        expect(result.current.role).toBe('admin');
        expect(result.current.isAdmin).toBe(true);
      }, { timeout: 3000 });
    });

    it('should preserve client role after password reset', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const mockSession = {
        access_token: 'token',
        refresh_token: 'refresh',
        expires_in: 3600,
        expires_at: Date.now() / 1000 + 3600,
        token_type: 'bearer',
        user: mockClientUser,
      };

      supabase.auth.getSession = vi.fn(async () => ({
        data: { session: mockSession },
        error: null,
      }));

      const mockFrom = supabase.from as any;
      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn(async () => ({
              data: { role: 'client' },
              error: null,
            })),
          })),
        })),
      });

      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(async () => ({
            data: [
              {
                client_id: mockOrganization1.id,
                is_org_admin: false,
                clients: mockOrganization1,
              },
            ],
            error: null,
          })),
        })),
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      }, { timeout: 3000 });

      await waitFor(() => {
        expect(result.current.role).toBe('client');
        expect(result.current.isAdmin).toBe(false);
      }, { timeout: 3000 });

      // Simulate password reset
      const newSession = {
        ...mockSession,
        access_token: 'new_token',
      };

      if (supabase.auth._authStateCallback) {
        supabase.auth._authStateCallback('PASSWORD_RECOVERY', newSession);
      }

      // Role should still be client after reset
      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn(async () => ({
              data: { role: 'client' },
              error: null,
            })),
          })),
        })),
      });

      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(async () => ({
            data: [
              {
                client_id: mockOrganization1.id,
                is_org_admin: false,
                clients: mockOrganization1,
              },
            ],
            error: null,
          })),
        })),
      });

      await waitFor(() => {
        expect(result.current.role).toBe('client');
        expect(result.current.isAdmin).toBe(false);
      }, { timeout: 3000 });
    });

    it('should preserve superadmin role after password reset', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const mockSession = {
        access_token: 'token',
        refresh_token: 'refresh',
        expires_in: 3600,
        expires_at: Date.now() / 1000 + 3600,
        token_type: 'bearer',
        user: mockSuperAdminUser,
      };

      supabase.auth.getSession = vi.fn(async () => ({
        data: { session: mockSession },
        error: null,
      }));

      const mockFrom = supabase.from as any;
      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn(async () => ({
              data: { role: 'superadmin' },
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

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      }, { timeout: 3000 });

      await waitFor(() => {
        expect(result.current.role).toBe('superadmin');
        expect(result.current.isSuperAdmin).toBe(true);
        expect(result.current.isAdmin).toBe(true);
      }, { timeout: 3000 });

      // Simulate password reset
      const newSession = {
        ...mockSession,
        access_token: 'new_token',
      };

      if (supabase.auth._authStateCallback) {
        supabase.auth._authStateCallback('PASSWORD_RECOVERY', newSession);
      }

      // Role should still be superadmin after reset
      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn(async () => ({
              data: { role: 'superadmin' },
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

      await waitFor(() => {
        expect(result.current.role).toBe('superadmin');
        expect(result.current.isSuperAdmin).toBe(true);
        expect(result.current.isAdmin).toBe(true);
      }, { timeout: 3000 });
    });
  });

  describe('Organization Preservation After Password Reset', () => {
    it('should preserve organization membership after password reset', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const mockSession = {
        access_token: 'token',
        refresh_token: 'refresh',
        expires_in: 3600,
        expires_at: Date.now() / 1000 + 3600,
        token_type: 'bearer',
        user: mockAdminUser,
      };

      supabase.auth.getSession = vi.fn(async () => ({
        data: { session: mockSession },
        error: null,
      }));

      const mockFrom = supabase.from as any;
      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn(async () => ({
              data: { role: 'admin' },
              error: null,
            })),
          })),
        })),
      });

      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(async () => ({
            data: [
              {
                client_id: mockOrganization1.id,
                is_org_admin: true,
                clients: mockOrganization1,
              },
            ],
            error: null,
          })),
        })),
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      }, { timeout: 3000 });

      await waitFor(() => {
        expect(result.current.organizations).toHaveLength(1);
        expect(result.current.currentOrganization?.id).toBe(mockOrganization1.id);
        expect(result.current.isOrgAdmin).toBe(true);
      }, { timeout: 3000 });

      // Simulate password reset
      const newSession = {
        ...mockSession,
        access_token: 'new_token',
      };

      if (supabase.auth._authStateCallback) {
        supabase.auth._authStateCallback('PASSWORD_RECOVERY', newSession);
      }

      // Organizations should still be present after reset
      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn(async () => ({
              data: { role: 'admin' },
              error: null,
            })),
          })),
        })),
      });

      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(async () => ({
            data: [
              {
                client_id: mockOrganization1.id,
                is_org_admin: true,
                clients: mockOrganization1,
              },
            ],
            error: null,
          })),
        })),
      });

      await waitFor(() => {
        expect(result.current.organizations).toHaveLength(1);
        expect(result.current.currentOrganization?.id).toBe(mockOrganization1.id);
        expect(result.current.isOrgAdmin).toBe(true);
      }, { timeout: 3000 });
    });
  });

  describe('Permission Flags After Password Reset', () => {
    it('should maintain correct permission flags after password reset', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const mockSession = {
        access_token: 'token',
        refresh_token: 'refresh',
        expires_in: 3600,
        expires_at: Date.now() / 1000 + 3600,
        token_type: 'bearer',
        user: mockAdminUser,
      };

      supabase.auth.getSession = vi.fn(async () => ({
        data: { session: mockSession },
        error: null,
      }));

      const mockFrom = supabase.from as any;
      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn(async () => ({
              data: { role: 'admin' },
              error: null,
            })),
          })),
        })),
      });

      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(async () => ({
            data: [
              {
                client_id: mockOrganization1.id,
                is_org_admin: true,
                clients: mockOrganization1,
              },
            ],
            error: null,
          })),
        })),
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      }, { timeout: 3000 });

      // Verify initial permission flags
      await waitFor(() => {
        expect(result.current.isAdmin).toBe(true);
        expect(result.current.isSuperAdmin).toBe(false);
        expect(result.current.isOrgAdmin).toBe(true);
      }, { timeout: 3000 });

      // Simulate password reset
      const newSession = {
        ...mockSession,
        access_token: 'new_token',
      };

      if (supabase.auth._authStateCallback) {
        supabase.auth._authStateCallback('PASSWORD_RECOVERY', newSession);
      }

      // Refetch data
      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn(async () => ({
              data: { role: 'admin' },
              error: null,
            })),
          })),
        })),
      });

      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(async () => ({
            data: [
              {
                client_id: mockOrganization1.id,
                is_org_admin: true,
                clients: mockOrganization1,
              },
            ],
            error: null,
          })),
        })),
      });

      // Verify permission flags are still correct
      await waitFor(() => {
        expect(result.current.isAdmin).toBe(true);
        expect(result.current.isSuperAdmin).toBe(false);
        expect(result.current.isOrgAdmin).toBe(true);
      }, { timeout: 3000 });
    });
  });

  describe('Error Handling During Password Reset', () => {
    it('should handle role fetch errors gracefully after password reset', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const mockSession = {
        access_token: 'token',
        refresh_token: 'refresh',
        expires_in: 3600,
        expires_at: Date.now() / 1000 + 3600,
        token_type: 'bearer',
        user: mockAdminUser,
      };

      supabase.auth.getSession = vi.fn(async () => ({
        data: { session: mockSession },
        error: null,
      }));

      const mockFrom = supabase.from as any;
      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn(async () => ({
              data: { role: 'admin' },
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

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      }, { timeout: 3000 });

      // Simulate password reset
      const newSession = {
        ...mockSession,
        access_token: 'new_token',
      };

      if (supabase.auth._authStateCallback) {
        supabase.auth._authStateCallback('PASSWORD_RECOVERY', newSession);
      }

      // Simulate role fetch error after password reset
      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn(async () => ({
              data: null,
              error: { message: 'Database error' },
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

      // Should handle error gracefully - role becomes null but doesn't crash
      await waitFor(() => {
        expect(result.current.role).toBeNull();
      }, { timeout: 3000 });
    });
  });
});
