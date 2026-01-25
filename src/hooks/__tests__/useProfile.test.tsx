import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { useProfile } from '../useProfile';
import { AuthProvider } from '../useAuth';
import { mockAdminUser } from '@/test/fixtures/users';

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
            unsubscribe: vi.fn() 
          } 
        },
      };
    }),
    getSession: vi.fn(async () => ({
      data: { session: mockAuth.session },
      error: null,
    })),
    getUser: vi.fn(async () => ({
      data: { user: mockAuth.user },
      error: null,
    })),
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    _authStateCallback: null as any,
  };

  const mockStorage = {
    from: vi.fn((bucket: string) => ({
      remove: vi.fn(async () => ({ error: null })),
      upload: vi.fn(async () => ({ error: null })),
      getPublicUrl: vi.fn(() => ({
        data: { publicUrl: `https://storage.supabase.co/${bucket}/test-url` },
      })),
    })),
  };

  const mockFrom = vi.fn((table: string) => {
    const mockQuery = {
      select: vi.fn(() => mockQuery),
      insert: vi.fn(() => mockQuery),
      update: vi.fn(() => mockQuery),
      upsert: vi.fn(() => mockQuery),
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
      storage: mockStorage,
      from: mockFrom,
      channel: mockChannel,
      removeChannel: mockRemoveChannel,
    },
  };
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <AuthProvider>{children}</AuthProvider>
  </BrowserRouter>
);

describe('useProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('should start with loading state when no user', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      supabase.auth.getSession = vi.fn(async () => ({
        data: { session: null },
        error: null,
      }));

      const mockFrom = supabase.from as any;
      // Mock queries by table name (order-independent)
      mockFrom.mockImplementation((table: string) => {
        const mockQuery = {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              maybeSingle: vi.fn(async () => ({ data: null, error: null })),
            })),
            in: vi.fn(async () => ({ data: [], error: null })),
          })),
        };
        return mockQuery;
      });

      const { result } = renderHook(() => useProfile(), { wrapper });

      // Loading might be true initially, but useAuth/useProfile resolve quickly
      // So we just wait for loading to be false and profile to be null
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      }, { timeout: 3000 });

      expect(result.current.profile).toBeNull();
    });

    it('should fetch profile when user is authenticated', async () => {
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

      const mockProfile = {
        id: 'profile-1',
        user_id: mockAdminUser.id,
        email: mockAdminUser.email,
        full_name: 'Test User',
        company_name: 'Test Company',
        display_name: null,
        logo_url: null,
        email_notifications: true,
        security_alerts: true,
        deployment_updates: false,
        onboarding_completed: false,
        onboarding_step: 0,
      };

      const mockFrom = supabase.from as any;
      // Mock queries by table name (order-independent)
      mockFrom.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi.fn(async () => ({
                  data: mockProfile,
                  error: null,
                })),
              })),
            })),
          };
        }
        if (table === 'user_roles') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi.fn(async () => ({
                  data: { role: 'admin' },
                  error: null,
                })),
              })),
            })),
          };
        }
        if (table === 'client_users') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(async () => ({
                data: [],
                error: null,
              })),
            })),
          };
        }
        // Default mock
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              maybeSingle: vi.fn(async () => ({ data: null, error: null })),
            })),
          })),
        };
      });

      const { result } = renderHook(() => useProfile(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      }, { timeout: 3000 });

      await waitFor(() => {
        expect(result.current.profile).toBeTruthy();
      }, { timeout: 2000 });

      if (result.current.profile) {
        expect(result.current.profile.email).toBe(mockAdminUser.email);
        expect(result.current.profile.full_name).toBe('Test User');
      }
    });
  });

  describe('updateProfile', () => {
    it('should update profile successfully', async () => {
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
      
      // Mock initial profile fetch
      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn(async () => ({
              data: {
                id: 'profile-1',
                user_id: mockAdminUser.id,
                email: mockAdminUser.email,
              },
              error: null,
            })),
          })),
        })),
      });

      // Mock role/org queries
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

      const { result } = renderHook(() => useProfile(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      }, { timeout: 3000 });

      // Mock upsert for update
      mockFrom.mockReturnValueOnce({
        upsert: vi.fn(async () => ({ error: null })),
      });

      // Mock refetch after update
      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn(async () => ({
              data: {
                id: 'profile-1',
                user_id: mockAdminUser.id,
                email: mockAdminUser.email,
                full_name: 'Updated Name',
              },
              error: null,
            })),
          })),
        })),
      });

      const updateResult = await result.current.updateProfile({
        full_name: 'Updated Name',
      });

      expect(updateResult.error).toBeNull();
      expect(mockFrom).toHaveBeenCalledWith('profiles');
    });

    it('should return error when not authenticated', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      supabase.auth.getSession = vi.fn(async () => ({
        data: { session: null },
        error: null,
      }));

      const { result } = renderHook(() => useProfile(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const updateResult = await result.current.updateProfile({
        full_name: 'Test',
      });

      expect(updateResult.error).toBeTruthy();
    });
  });

  describe('uploadLogo', () => {
    it('should upload logo successfully', async () => {
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
      
      // Mock initial profile fetch
      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn(async () => ({
              data: {
                id: 'profile-1',
                user_id: mockAdminUser.id,
                email: mockAdminUser.email,
              },
              error: null,
            })),
          })),
        })),
      });

      // Mock role/org queries
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

      const { result } = renderHook(() => useProfile(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      }, { timeout: 3000 });

      // Create mock file
      const mockFile = new File(['test'], 'logo.png', { type: 'image/png' });

      // Mock storage operations
      const mockStorage = supabase.storage as any;
      mockStorage.from.mockReturnValueOnce({
        remove: vi.fn(async () => ({ error: null })),
        upload: vi.fn(async () => ({ error: null })),
        getPublicUrl: vi.fn(() => ({
          data: { publicUrl: 'https://storage.supabase.co/avatars/test-url' },
        })),
      });

      // Mock upsert for profile update
      mockFrom.mockReturnValueOnce({
        upsert: vi.fn(async () => ({ error: null })),
      });

      // Mock refetch
      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn(async () => ({
              data: {
                id: 'profile-1',
                user_id: mockAdminUser.id,
                email: mockAdminUser.email,
                logo_url: 'https://storage.supabase.co/avatars/test-url',
              },
              error: null,
            })),
          })),
        })),
      });

      const uploadResult = await result.current.uploadLogo(mockFile);

      expect(uploadResult.error).toBeNull();
      expect(uploadResult.url).toBeTruthy();
    });

    it('should reject non-image files', async () => {
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
              data: { id: 'profile-1', user_id: mockAdminUser.id, email: mockAdminUser.email },
              error: null,
            })),
          })),
        })),
      });

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

      const { result } = renderHook(() => useProfile(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      }, { timeout: 3000 });

      const mockFile = new File(['test'], 'document.pdf', { type: 'application/pdf' });

      const uploadResult = await result.current.uploadLogo(mockFile);

      expect(uploadResult.error).toBeTruthy();
      expect(uploadResult.error?.message).toContain('image');
    });

    it('should reject files larger than 2MB', async () => {
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
              data: { id: 'profile-1', user_id: mockAdminUser.id, email: mockAdminUser.email },
              error: null,
            })),
          })),
        })),
      });

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

      const { result } = renderHook(() => useProfile(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      }, { timeout: 3000 });

      // Create a file larger than 2MB
      const largeFile = new File(['x'.repeat(3 * 1024 * 1024)], 'large.png', { type: 'image/png' });

      const uploadResult = await result.current.uploadLogo(largeFile);

      expect(uploadResult.error).toBeTruthy();
      expect(uploadResult.error?.message).toContain('2MB');
    });
  });

  describe('removeLogo', () => {
    it('should remove logo successfully', async () => {
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
              data: {
                id: 'profile-1',
                user_id: mockAdminUser.id,
                email: mockAdminUser.email,
                logo_url: 'https://example.com/logo.png',
              },
              error: null,
            })),
          })),
        })),
      });

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

      const { result } = renderHook(() => useProfile(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      }, { timeout: 3000 });

      // Mock storage remove
      const mockStorage = supabase.storage as any;
      mockStorage.from.mockReturnValueOnce({
        remove: vi.fn(async () => ({ error: null })),
      });

      // Mock profile update
      mockFrom.mockReturnValueOnce({
        update: vi.fn(() => ({
          eq: vi.fn(async () => ({ error: null })),
        })),
      });

      // Mock refetch
      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn(async () => ({
              data: {
                id: 'profile-1',
                user_id: mockAdminUser.id,
                email: mockAdminUser.email,
                logo_url: null,
              },
              error: null,
            })),
          })),
        })),
      });

      const removeResult = await result.current.removeLogo();

      expect(removeResult.error).toBeNull();
    });
  });

  describe('refetch', () => {
    it('should refetch profile data', async () => {
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
      let fetchCount = 0;
      
      mockFrom.mockImplementation(() => {
        fetchCount++;
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              maybeSingle: vi.fn(async () => ({
                data: {
                  id: 'profile-1',
                  user_id: mockAdminUser.id,
                  email: mockAdminUser.email,
                },
                error: null,
              })),
            })),
          })),
        };
      });

      const { result } = renderHook(() => useProfile(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      }, { timeout: 3000 });

      const initialCount = fetchCount;
      await result.current.refetch();

      await waitFor(() => {
        expect(fetchCount).toBeGreaterThan(initialCount);
      });
    });
  });
});
