import { vi } from 'vitest';
import type { User, Session, AuthError } from '@supabase/supabase-js';

// Mock user data
export const mockUser: User = {
  id: '00000000-0000-0000-0000-000000000004',
  email: 'test@example.com',
  created_at: '2024-01-01T00:00:00Z',
  app_metadata: {},
  user_metadata: {
    full_name: 'Test User',
    company_name: 'Test Company',
  },
  aud: 'authenticated',
  confirmation_sent_at: null,
  recovery_sent_at: null,
  email_change_sent_at: null,
  new_email: null,
  invited_at: null,
  action_link: null,
  email_change: null,
  phone: null,
  phone_confirmed_at: null,
  phone_change: null,
  phone_change_token: null,
  phone_change_sent_at: null,
  confirmed_at: '2024-01-01T00:00:00Z',
  email_confirmed_at: '2024-01-01T00:00:00Z',
  last_sign_in_at: '2024-01-01T00:00:00Z',
  role: 'authenticated',
  updated_at: '2024-01-01T00:00:00Z',
};

export const mockSession: Session = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  expires_at: Date.now() / 1000 + 3600,
  token_type: 'bearer',
  user: mockUser,
};

// Mock Supabase client
export const createMockSupabaseClient = () => {
  const mockAuth = {
    user: null as User | null,
    session: null as Session | null,
    onAuthStateChange: vi.fn((callback) => {
      // Store callback for manual triggering
      mockAuth._authStateCallback = callback;
      return {
        data: { subscription: { unsubscribe: vi.fn() } },
      };
    }),
    getSession: vi.fn(async () => ({
      data: { session: mockAuth.session },
      error: null,
    })),
    signInWithPassword: vi.fn(async ({ email, password }) => {
      if (email === 'error@example.com') {
        return {
          data: { user: null, session: null },
          error: { message: 'Invalid credentials', status: 400 } as AuthError,
        };
      }
      mockAuth.user = mockUser;
      mockAuth.session = mockSession;
      // Trigger auth state change
      if (mockAuth._authStateCallback) {
        mockAuth._authStateCallback('SIGNED_IN', mockSession);
      }
      return {
        data: { user: mockUser, session: mockSession },
        error: null,
      };
    }),
    signUp: vi.fn(async ({ email, password, options }) => {
      if (email === 'exists@example.com') {
        return {
          data: { user: null, session: null },
          error: { message: 'User already exists', status: 400 } as AuthError,
        };
      }
      mockAuth.user = mockUser;
      mockAuth.session = mockSession;
      // Trigger auth state change
      if (mockAuth._authStateCallback) {
        mockAuth._authStateCallback('SIGNED_UP', mockSession);
      }
      return {
        data: { user: mockUser, session: mockSession },
        error: null,
      };
    }),
    signOut: vi.fn(async () => {
      mockAuth.user = null;
      mockAuth.session = null;
      // Trigger auth state change
      if (mockAuth._authStateCallback) {
        mockAuth._authStateCallback('SIGNED_OUT', null);
      }
      return { error: null };
    }),
    _authStateCallback: null as ((event: string, session: Session | null) => void) | null,
  };

  const mockFrom = vi.fn((table: string) => {
    const mockQuery = {
      select: vi.fn(() => mockQuery),
      insert: vi.fn(() => mockQuery),
      update: vi.fn(() => mockQuery),
      delete: vi.fn(() => mockQuery),
      eq: vi.fn(() => mockQuery),
      neq: vi.fn(() => mockQuery),
      order: vi.fn(() => mockQuery),
      maybeSingle: vi.fn(async () => ({ data: null, error: null })),
      single: vi.fn(async () => ({ data: null, error: null })),
      limit: vi.fn(() => mockQuery),
      execute: vi.fn(async () => ({ data: null, error: null })),
    };
    return mockQuery;
  });

  const mockChannel = vi.fn((name: string) => {
    return {
      on: vi.fn(() => ({
        subscribe: vi.fn(() => ({
          unsubscribe: vi.fn(),
        })),
      })),
      subscribe: vi.fn(() => ({
        unsubscribe: vi.fn(),
      })),
    };
  });

  const mockRemoveChannel = vi.fn();

  return {
    auth: mockAuth,
    from: mockFrom,
    channel: mockChannel,
    removeChannel: mockRemoveChannel,
  };
};

// Export a default mock instance
export const mockSupabase = createMockSupabaseClient();
