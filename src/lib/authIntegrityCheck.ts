/**
 * Auth Integrity Check Utility
 * 
 * This utility verifies that a user's authentication state is consistent
 * after operations like password reset. It checks:
 * - User has a profile
 * - User has a role
 * - User has organization membership (if applicable)
 * 
 * Use this after password reset or other auth operations to ensure
 * permissions weren't lost.
 */

import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

export interface IntegrityCheckResult {
  passed: boolean;
  warnings: string[];
  errors: string[];
  details: {
    hasProfile: boolean;
    hasRole: boolean;
    role?: string;
    organizationCount: number;
  };
}

/**
 * Check the integrity of a user's auth state
 * @param user - The user to check (defaults to current session user)
 * @returns Integrity check result
 */
export async function checkAuthIntegrity(user?: User | null): Promise<IntegrityCheckResult> {
  const warnings: string[] = [];
  const errors: string[] = [];
  
  // Get current user if not provided
  if (!user) {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) {
      return {
        passed: false,
        warnings: [],
        errors: ['No user session found'],
        details: {
          hasProfile: false,
          hasRole: false,
          organizationCount: 0,
        },
      };
    }
    user = currentUser;
  }

  const details = {
    hasProfile: false,
    hasRole: false,
    role: undefined as string | undefined,
    organizationCount: 0,
  };

  // Check 1: Profile exists
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('user_id, email')
    .eq('user_id', user.id)
    .maybeSingle();

  if (profileError) {
    errors.push(`Failed to check profile: ${profileError.message}`);
  } else if (!profile) {
    errors.push('User profile does not exist');
  } else {
    details.hasProfile = true;
  }

  // Check 2: Role exists
  const { data: roleData, error: roleError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle();

  if (roleError) {
    errors.push(`Failed to check role: ${roleError.message}`);
  } else if (!roleData) {
    warnings.push('User has no role assigned');
  } else {
    details.hasRole = true;
    details.role = roleData.role;
  }

  // Check 3: Multiple roles (shouldn't happen)
  const { data: allRoles, error: rolesError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id);

  if (!rolesError && allRoles && allRoles.length > 1) {
    warnings.push(`User has ${allRoles.length} roles (expected 1)`);
  }

  // Check 4: Organization membership
  const { data: orgMemberships, error: orgError } = await supabase
    .from('client_users')
    .select('client_id')
    .eq('user_id', user.id);

  if (orgError) {
    warnings.push(`Failed to check organization membership: ${orgError.message}`);
  } else {
    details.organizationCount = orgMemberships?.length || 0;
    
    // Superadmin doesn't need org membership, but others should have it
    if (details.role === 'superadmin') {
      // Superadmin doesn't require org membership
    } else if (details.role && details.organizationCount === 0) {
      warnings.push(`User with role '${details.role}' has no organization membership`);
    }
  }

  const passed = errors.length === 0;

  return {
    passed,
    warnings,
    errors,
    details,
  };
}

/**
 * Verify user permissions after password reset
 * This is a convenience function that checks integrity and logs results
 * @param user - The user to check (defaults to current session user)
 * @returns true if integrity check passed, false otherwise
 */
export async function verifyAfterPasswordReset(user?: User | null): Promise<boolean> {
  console.log('[authIntegrityCheck] Verifying user state after password reset...');
  
  const result = await checkAuthIntegrity(user);
  
  if (result.passed && result.warnings.length === 0) {
    console.log('[authIntegrityCheck] ✓ All checks passed');
    return true;
  }
  
  if (result.errors.length > 0) {
    console.error('[authIntegrityCheck] ✗ Errors found:', result.errors);
  }
  
  if (result.warnings.length > 0) {
    console.warn('[authIntegrityCheck] ⚠ Warnings:', result.warnings);
  }
  
  console.log('[authIntegrityCheck] Details:', result.details);
  
  return result.passed;
}

/**
 * Get a human-readable summary of the integrity check
 * @param result - The integrity check result
 * @returns Human-readable summary string
 */
export function getIntegritySummary(result: IntegrityCheckResult): string {
  if (result.passed && result.warnings.length === 0) {
    return 'All checks passed ✓';
  }
  
  const parts: string[] = [];
  
  if (result.errors.length > 0) {
    parts.push(`Errors: ${result.errors.join(', ')}`);
  }
  
  if (result.warnings.length > 0) {
    parts.push(`Warnings: ${result.warnings.join(', ')}`);
  }
  
  return parts.join(' | ');
}

/**
 * Check if user has required permissions for their role
 * @param user - The user to check (defaults to current session user)
 * @returns true if permissions are correct, false otherwise
 */
export async function verifyRolePermissions(user?: User | null): Promise<boolean> {
  const result = await checkAuthIntegrity(user);
  
  if (!result.passed) {
    return false;
  }
  
  if (!result.details.hasRole) {
    return false;
  }
  
  // Superadmin doesn't need org membership
  if (result.details.role === 'superadmin') {
    return true;
  }
  
  // Admin and client should have org membership
  if (result.details.organizationCount === 0) {
    return false;
  }
  
  return true;
}
