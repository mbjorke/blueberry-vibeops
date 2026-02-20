/**
 * Test User Credentials (Database Users)
 * 
 * These are REAL test users created in the database via seed script.
 * Use these for:
 * - Integration tests (test real auth flows, RLS policies, etc.)
 * - End-to-end testing
 * - Manual testing with known credentials
 * 
 * To create these users, run: npm run seed:test-users
 * 
 * ⚠️ For unit tests (fast, isolated), use mock users from '@/test/fixtures/users' instead.
 * ⚠️ These are TEST users only - never use in production!
 * 
 * @see users.ts for mock users (unit tests, dev mode)
 */

export const TEST_USER_CREDENTIALS = {
  superadmin: {
    email: 'test-superadmin@vibeops.test',
    password: 'TestSuperAdmin123!',
    role: 'superadmin' as const,
  },
  admin: {
    email: 'test-admin@vibeops.test',
    password: 'TestAdmin123!',
    role: 'admin' as const,
  },
  client: {
    email: 'test-client@vibeops.test',
    password: 'TestClient123!',
    role: 'client' as const,
  },
} as const;

/**
 * Get test user credentials by role
 */
export function getTestUserCredentials(role: 'superadmin' | 'admin' | 'client') {
  return TEST_USER_CREDENTIALS[role];
}

/**
 * All test user emails (for cleanup, etc.)
 */
export const TEST_USER_EMAILS = Object.values(TEST_USER_CREDENTIALS).map(u => u.email);

/**
 * Check if an email belongs to a test user
 */
export function isTestUserEmail(email: string): boolean {
  return TEST_USER_EMAILS.includes(email);
}
