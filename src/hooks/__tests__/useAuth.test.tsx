import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAuth, AuthProvider } from '../useAuth';
import { mockAdminUser, mockClientUser, mockSuperAdminUser } from '@/test/fixtures/users';
import { mockOrganization1, mockOrganization2 } from '@/test/fixtures/organizations';
import { BrowserRouter } from 'react-router-dom';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => {
  const mockAuth = {
    user: null as any,
    session: null as any,
    onAuthStateChange: vi.fn((callback) => {
      // Store callback for manual triggering
      (mockAuth as any)._authStateCallback = callback;
      return {
        data: { 
          subscription: { 
            unsubscribe: vi.fn() 
          } 
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

describe('useAuth', () => {
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

  describe('initial state', () => {
    it('should start with loading state', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      expect(result.current.loading).toBe(true);
      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
      expect(result.current.role).toBeNull();
    });

    it('should initialize with no session', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      supabase.auth.getSession = vi.fn(async () => ({
        data: { session: null },
        error: null,
      }));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
    });
  });

  describe('signIn', () => {
    it('should sign in successfully', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const mockSession = {
        access_token: 'token',
        refresh_token: 'refresh',
        expires_in: 3600,
        expires_at: Date.now() / 1000 + 3600,
        token_type: 'bearer',
        user: mockAdminUser,
      };

      supabase.auth.signInWithPassword = vi.fn(async () => ({
        data: { user: mockAdminUser, session: mockSession },
        error: null,
      }));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const signInResult = await result.current.signIn('test@example.com', 'password');

      expect(signInResult.error).toBeNull();
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
      });
    });

    it('should handle sign in errors', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const authError = { message: 'Invalid credentials', status: 400 };

      supabase.auth.signInWithPassword = vi.fn(async () => ({
        data: { user: null, session: null },
        error: authError as any,
      }));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const signInResult = await result.current.signIn('error@example.com', 'wrong');

      expect(signInResult.error).toBeTruthy();
    });
  });

  describe('signUp', () => {
    it('should sign up successfully', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const mockSession = {
        access_token: 'token',
        refresh_token: 'refresh',
        expires_in: 3600,
        expires_at: Date.now() / 1000 + 3600,
        token_type: 'bearer',
        user: mockAdminUser,
      };

      supabase.auth.signUp = vi.fn(async () => ({
        data: { user: mockAdminUser, session: mockSession },
        error: null,
      }));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const signUpResult = await result.current.signUp(
        'new@example.com',
        'password123',
        'Test User',
        'Test Company'
      );

      expect(signUpResult.error).toBeNull();
      expect(signUpResult.data?.user).toBeTruthy();
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'new@example.com',
        password: 'password123',
        options: {
          emailRedirectTo: expect.any(String),
          data: {
            full_name: 'Test User',
            company_name: 'Test Company',
          },
        },
      });
    });

    it('should handle sign up errors', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const authError = { message: 'User already exists', status: 400 };

      supabase.auth.signUp = vi.fn(async () => ({
        data: { user: null, session: null },
        error: authError as any,
      }));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const signUpResult = await result.current.signUp(
        'exists@example.com',
        'password123',
        'Test User'
      );

      expect(signUpResult.error).toBeTruthy();
      // When error occurs, Supabase may return data with null user
      // The implementation returns { user: data.user } which becomes { user: null }
      expect(signUpResult.data).toBeTruthy();
      expect(signUpResult.data?.user).toBeNull();
    });
  });

  describe('signOut', () => {
    it('should sign out successfully', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      
      supabase.auth.signOut = vi.fn(async () => ({ error: null }));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.signOut();

      expect(supabase.auth.signOut).toHaveBeenCalled();
    });
  });

  describe('role fetching', () => {
    it('should fetch admin role', async () => {
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

      // Mock role fetch
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
            data: [],
            error: null,
          })),
        })),
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      }, { timeout: 3000 });

      // Note: Role fetching happens asynchronously, so we may need to wait
      await waitFor(() => {
        expect(result.current.role).toBe('admin');
      }, { timeout: 3000 });
    });

    it('should fetch superadmin role', async () => {
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

      // Mock role fetch
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

      // Mock organizations fetch
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
    });

    it('should fetch client role', async () => {
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

      // Mock role fetch
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

      // Mock organizations fetch
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
        expect(result.current.role).toBe('client');
        expect(result.current.isAdmin).toBe(false);
        expect(result.current.isSuperAdmin).toBe(false);
      }, { timeout: 3000 });
    });
  });

  describe('organization fetching', () => {
    it('should fetch user organizations', async () => {
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
      
      // Mock role fetch
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
              {
                client_id: mockOrganization2.id,
                is_org_admin: false,
                clients: mockOrganization2,
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
        expect(result.current.organizations).toHaveLength(2);
        expect(result.current.currentOrganization).toBeTruthy();
        expect(result.current.currentOrganization?.id).toBe(mockOrganization1.id);
      }, { timeout: 3000 });
    });
  });

  describe('permission flags', () => {
    it('should set isAdmin correctly for admin role', async () => {
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

      await waitFor(() => {
        expect(result.current.isAdmin).toBe(true);
        expect(result.current.isSuperAdmin).toBe(false);
      }, { timeout: 3000 });
    });

    it('should set isOrgAdmin correctly', async () => {
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
        expect(result.current.isOrgAdmin).toBe(true);
      }, { timeout: 3000 });
    });
  });

  describe('error handling', () => {
    it('should handle errors when fetching role', async () => {
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

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      }, { timeout: 3000 });

      // Role should remain null on error
      await waitFor(() => {
        expect(result.current.role).toBeNull();
      }, { timeout: 3000 });
    });
  });
});
