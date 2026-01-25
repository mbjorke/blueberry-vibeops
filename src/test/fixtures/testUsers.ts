/**
 * Test User Credentials
 * 
 * These are real test users created in the database via seed script.
 * Use these for integration tests that need actual database records.
 * 
 * To create these users, run: npm run seed:test-users
 * 
 * ⚠️ These are TEST users only - never use in production!
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
