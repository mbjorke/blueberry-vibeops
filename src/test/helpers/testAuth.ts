/**
 * Test Authentication Helpers
 * 
 * Utilities for signing in as test users in integration tests.
 * These use real test users created via the seed script.
 */

import { supabase } from '@/integrations/supabase/client';
import { getTestUserCredentials, TEST_USER_CREDENTIALS } from '@/test/fixtures/testUsers';

export type TestUserRole = keyof typeof TEST_USER_CREDENTIALS;

/**
 * Sign in as a test user
 * @param role - The role to sign in as ('superadmin', 'admin', or 'client')
 * @returns The session and user data
 */
export async function signInAsTestUser(role: TestUserRole) {
  const credentials = getTestUserCredentials(role);
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password,
  });

  if (error) {
    throw new Error(`Failed to sign in as test ${role}: ${error.message}`);
  }

  if (!data.session || !data.user) {
    throw new Error(`Sign in succeeded but no session/user returned for ${role}`);
  }

  return {
    session: data.session,
    user: data.user,
    credentials,
  };
}

/**
 * Sign out the current user
 */
export async function signOutTestUser() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(`Failed to sign out: ${error.message}`);
  }
}

/**
 * Get the current test user's role from the database
 * @param userId - The user ID to check
 * @returns The user's role or null
 */
export async function getTestUserRole(userId: string): Promise<'superadmin' | 'admin' | 'client' | null> {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to get user role: ${error.message}`);
  }

  return data?.role as 'superadmin' | 'admin' | 'client' | null;
}

/**
 * Verify a test user has the expected role
 * @param userId - The user ID to check
 * @param expectedRole - The expected role
 * @returns true if role matches, false otherwise
 */
export async function verifyTestUserRole(
  userId: string,
  expectedRole: TestUserRole
): Promise<boolean> {
  const actualRole = await getTestUserRole(userId);
  return actualRole === expectedRole;
}
