import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProtectedRoute } from '../ProtectedRoute';
import { AuthProvider } from '@/hooks/useAuth';
import { mockAdminUser, mockClientUser, mockSuperAdminUser } from '@/test/fixtures/users';
import { mockOrganization1 } from '@/test/fixtures/organizations';

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

const TestComponent = () => <div>Protected Content</div>;

const renderWithAuth = (
  ui: React.ReactElement,
  initialUser?: {
    id: string;
    email: string;
    role?: 'admin' | 'client' | 'superadmin';
    organizations?: Array<{
      id: string;
      name: string;
      logo_initial: string;
      logo_color: string;
      is_org_admin: boolean;
    }>;
  }
) => {
  return render(
    <MemoryRouter>
      <AuthProvider>{ui}</AuthProvider>
    </MemoryRouter>
  );
};

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loading state', () => {
    it('should show loading spinner while loading', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      supabase.auth.getSession = vi.fn(() => new Promise(() => {})); // Never resolves

      const { container } = renderWithAuth(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );

      // Should show loading spinner (check for spinner class or animation)
      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('unauthenticated users', () => {
    it('should redirect to login when user is not authenticated', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      supabase.auth.getSession = vi.fn(async () => ({
        data: { session: null },
        error: null,
      }));

      renderWithAuth(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );

      // Wait for auth to resolve
      await new Promise(resolve => setTimeout(resolve, 100));

      // Should redirect to login (Navigate component behavior)
      // In test environment, we check that protected content is not shown
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });

  describe('authenticated users', () => {
    it('should render children for authenticated regular user', async () => {
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
            data: [],
            error: null,
          })),
        })),
      });

      renderWithAuth(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );

      // Wait for auth to resolve
      await new Promise(resolve => setTimeout(resolve, 500));

      // Should render protected content
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  describe('admin routes', () => {
    it('should allow admin users to access admin routes', async () => {
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

      renderWithAuth(
        <ProtectedRoute requireAdmin>
          <TestComponent />
        </ProtectedRoute>
      );

      await new Promise(resolve => setTimeout(resolve, 500));

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should redirect non-admin users from admin routes', async () => {
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
            data: [],
            error: null,
          })),
        })),
      });

      renderWithAuth(
        <ProtectedRoute requireAdmin>
          <TestComponent />
        </ProtectedRoute>
      );

      await new Promise(resolve => setTimeout(resolve, 500));

      // Should redirect (content not shown)
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });

  describe('superadmin routes', () => {
    it('should allow superadmin users to access superadmin routes', async () => {
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

      renderWithAuth(
        <ProtectedRoute requireSuperAdmin>
          <TestComponent />
        </ProtectedRoute>
      );

      await new Promise(resolve => setTimeout(resolve, 500));

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should redirect non-superadmin users from superadmin routes', async () => {
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

      renderWithAuth(
        <ProtectedRoute requireSuperAdmin>
          <TestComponent />
        </ProtectedRoute>
      );

      await new Promise(resolve => setTimeout(resolve, 500));

      // Should redirect (content not shown)
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });

  describe('org admin routes', () => {
    it('should allow org admin users to access org admin routes', async () => {
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

      renderWithAuth(
        <ProtectedRoute requireOrgAdmin>
          <TestComponent />
        </ProtectedRoute>
      );

      await new Promise(resolve => setTimeout(resolve, 500));

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should redirect non-org-admin users from org admin routes', async () => {
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

      renderWithAuth(
        <ProtectedRoute requireOrgAdmin>
          <TestComponent />
        </ProtectedRoute>
      );

      await new Promise(resolve => setTimeout(resolve, 500));

      // Should redirect (content not shown)
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });
});
