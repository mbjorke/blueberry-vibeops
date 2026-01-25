#!/usr/bin/env tsx
/**
 * Seed Test Users Script
 * 
 * Creates real test users in the database for integration testing.
 * These users have known credentials and can be used for both frontend and backend tests.
 * 
 * Usage:
 *   npm run seed:test-users
 *   npm run seed:test-users -- --reset  (deletes and recreates)
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { Client } from 'pg';

// Declare variables that will be set from environment
let SUPABASE_URL: string;
let SUPABASE_SERVICE_ROLE_KEY: string;

// Try to load environment variables from .env.local
SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// If not in env, try to read from .env.local
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  try {
    const envFile = readFileSync(resolve(process.cwd(), '.env.local'), 'utf-8');
    const envLines = envFile.split('\n');
    
    for (const line of envLines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        const value = valueParts.join('=').replace(/^["']|["']$/g, '');
        
        if (key === 'VITE_SUPABASE_URL' || key === 'SUPABASE_URL') {
          SUPABASE_URL = value;
        } else if (key === 'SUPABASE_SERVICE_ROLE_KEY') {
          SUPABASE_SERVICE_ROLE_KEY = value;
        }
      }
    }
  } catch (error) {
    // .env.local might not exist, that's okay
  }
}

// For local Supabase, try to get from status file
if (!SUPABASE_SERVICE_ROLE_KEY && SUPABASE_URL?.includes('127.0.0.1') || SUPABASE_URL?.includes('localhost')) {
  try {
    const statusFile = readFileSync(resolve(process.cwd(), 'supabase/.temp/cli-latest'), 'utf-8');
    // Try to get service role from Supabase status
    // Note: This is a fallback - ideally use .env.local
  } catch (error) {
    // Ignore
  }
}

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   VITE_SUPABASE_URL or SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  console.error('\n💡 Options:');
  console.error('   1. Add to .env.local:');
  console.error('      VITE_SUPABASE_URL=http://127.0.0.1:54321');
  console.error('      SUPABASE_SERVICE_ROLE_KEY=<get from: supabase status>');
  console.error('   2. Or set as environment variables');
  console.error('\n   For local Supabase, get service role key with:');
  console.error('   supabase status | grep "service_role key"');
  process.exit(1);
}

// Helper to call Admin API directly (bypasses JWT verification issues with local Supabase)
// This uses fetch instead of the Supabase JS client to avoid JWT signature verification issues
async function adminApiCall(endpoint: string, method: string, body?: any) {
  const url = `${SUPABASE_URL}/auth/v1${endpoint}`;
  
  console.log(`[DEBUG] Calling ${method} ${url}`);
  
  const response = await fetch(url, {
    method,
    headers: {
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText || response.statusText };
    }
    console.error(`[DEBUG] Error response:`, errorData);
    throw new Error(errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

// Create admin client for database operations (bypasses RLS)
// Note: We use REST API directly for auth.admin operations to avoid JWT verification issues
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Test user definitions
const TEST_USERS = [
  {
    email: 'test-superadmin@vibeops.test',
    password: 'TestSuperAdmin123!',
    fullName: 'Test Superadmin',
    companyName: 'VibeOps Platform',
    role: 'superadmin' as const,
    organization: null,
    isOrgAdmin: false,
  },
  {
    email: 'test-admin@vibeops.test',
    password: 'TestAdmin123!',
    fullName: 'Test Admin',
    companyName: 'Test Admin Company',
    role: 'admin' as const,
    organization: 'Test Admin Company',
    isOrgAdmin: true,
  },
  {
    email: 'test-client@vibeops.test',
    password: 'TestClient123!',
    fullName: 'Test Client',
    companyName: null,
    role: 'client' as const,
    organization: null, // Will be added to admin's org
    isOrgAdmin: false,
  },
];

interface TestUserResult {
  email: string;
  userId: string | null;
  success: boolean;
  error?: string;
  organizationId?: string;
}

async function deleteTestUsers(): Promise<void> {
  console.log('🗑️  Deleting existing test users...');
  
  for (const user of TEST_USERS) {
    try {
      // Find and delete user by email using direct database connection
      const dbUrl = 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';
      const dbClient = new Client({ connectionString: dbUrl });
      await dbClient.connect();
      
      try {
        // Find user by email in profiles
        const profileResult = await dbClient.query(
          'SELECT user_id FROM public.profiles WHERE email = $1',
          [user.email]
        );
        
        if (profileResult.rows.length > 0) {
          const userId = profileResult.rows[0].user_id;
          
          // Delete user data in reverse order of dependencies
          // First, handle organizations created by this user (must be done before deleting user)
          await dbClient.query('UPDATE public.clients SET created_by = NULL WHERE created_by = $1', [userId]);
          
          // Also delete organizations created by test users (cleanup)
          await dbClient.query('DELETE FROM public.clients WHERE created_by = $1', [userId]);
          
          // Delete organization memberships
          await dbClient.query('DELETE FROM public.client_users WHERE user_id = $1', [userId]);
          
          // Delete roles
          await dbClient.query('DELETE FROM public.user_roles WHERE user_id = $1', [userId]);
          
          // Delete profile
          await dbClient.query('DELETE FROM public.profiles WHERE user_id = $1', [userId]);
          
          // Delete from auth.users using SQL function
          await dbClient.query('SELECT public.delete_test_user($1)', [userId]);
          
          console.log(`  ✓ Deleted ${user.email}`);
        }
      } catch (error: any) {
        console.warn(`  ⚠️  Could not delete ${user.email}: ${error.message}`);
      } finally {
        await dbClient.end();
      }
    } catch (error) {
      console.warn(`  ⚠️  Error deleting ${user.email}:`, error);
    }
  }
  
  console.log('✓ Test user cleanup completed\n');
}

async function createTestUser(userDef: typeof TEST_USERS[0]): Promise<TestUserResult> {
  const result: TestUserResult = {
    email: userDef.email,
    userId: null,
    success: false,
  };

  try {
    // Create user via direct database connection (bypasses PostgREST RPC issues)
    // Extract database connection from Supabase URL
    // Local Supabase: postgresql://postgres:postgres@127.0.0.1:54322/postgres
    const dbUrl = 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';
    const dbClient = new Client({ connectionString: dbUrl });
    await dbClient.connect();
    
    try {
      const queryResult = await dbClient.query(
        `SELECT public.create_test_user($1, $2, $3, $4) as user_id`,
        [
          userDef.email,
          userDef.password,
          userDef.fullName,
          userDef.companyName || null,
        ]
      );
      
      result.userId = queryResult.rows[0].user_id;
      
      if (!result.userId) {
        result.error = 'User creation returned no user ID';
        return result;
      }

      console.log(`  ✓ Created auth user: ${userDef.email} (${result.userId})`);
    } finally {
      await dbClient.end();
    }

      // Wait a moment for trigger to fire
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Verify profile was created by trigger using direct DB connection
      const dbClient2 = new Client({ connectionString: dbUrl });
      await dbClient2.connect();
      
      try {
        const profileCheck = await dbClient2.query(
          'SELECT * FROM public.profiles WHERE user_id = $1',
          [result.userId]
        );

        if (profileCheck.rows.length === 0) {
          console.warn(`  ⚠️  Profile not created by trigger, creating manually...`);
          await dbClient2.query(
            `INSERT INTO public.profiles (user_id, email, full_name) VALUES ($1, $2, $3)`,
            [result.userId, userDef.email, userDef.fullName]
          );
        }
      } finally {
        await dbClient2.end();
      }

      // Verify/update role
      const { data: existingRole } = await supabaseAdmin
        .from('user_roles')
        .select('role')
        .eq('user_id', result.userId)
        .maybeSingle();

    // Verify/update role using direct DB connection
    const dbClient3 = new Client({ connectionString: dbUrl });
    await dbClient3.connect();
    
    try {
      const roleCheck = await dbClient3.query(
        'SELECT role FROM public.user_roles WHERE user_id = $1',
        [result.userId]
      );

      // Delete existing role if wrong
      if (roleCheck.rows.length > 0 && roleCheck.rows[0].role !== userDef.role) {
        await dbClient3.query(
          'DELETE FROM public.user_roles WHERE user_id = $1',
          [result.userId]
        );
      }

      // Insert correct role if it doesn't exist or was wrong
      if (roleCheck.rows.length === 0 || roleCheck.rows[0].role !== userDef.role) {
        await dbClient3.query(
          `INSERT INTO public.user_roles (user_id, role) VALUES ($1, $2)
           ON CONFLICT (user_id, role) DO NOTHING`,
          [result.userId, userDef.role]
        );
      }
    } finally {
      await dbClient3.end();
    }

    console.log(`  ✓ Assigned role: ${userDef.role}`);

    // Handle organization membership using direct DB connection
    if (userDef.organization) {
      const dbUrl = 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';
      const dbClient4 = new Client({ connectionString: dbUrl });
      await dbClient4.connect();
      
      try {
        let orgId: string;

        if (userDef.role === 'admin') {
          // Admin creates their own org
          const orgCheck = await dbClient4.query(
            'SELECT id FROM public.clients WHERE created_by = $1',
            [result.userId]
          );

          if (orgCheck.rows.length === 0) {
            // Create org for admin
            const newOrgResult = await dbClient4.query(
              `INSERT INTO public.clients (name, logo_initial, logo_color, created_by)
               VALUES ($1, $2, $3, $4)
               RETURNING id`,
              [
                userDef.organization,
                userDef.organization.charAt(0).toUpperCase(),
                'bg-primary',
                result.userId,
              ]
            );
            orgId = newOrgResult.rows[0].id;
          } else {
            orgId = orgCheck.rows[0].id;
          }

          // Add admin as org admin
          await dbClient4.query(
            `INSERT INTO public.client_users (client_id, user_id, is_org_admin, role)
             VALUES ($1, $2, true, 'admin')
             ON CONFLICT (client_id, user_id) DO UPDATE
             SET is_org_admin = true, role = 'admin'`,
            [orgId, result.userId]
          );

          result.organizationId = orgId;
          console.log(`  ✓ Added to organization: ${userDef.organization}`);
      } else if (userDef.role === 'client') {
        // Client gets added to admin's org
        // Find admin user that was created earlier in this run
        const adminUserDef = TEST_USERS.find(u => u.role === 'admin');
        if (adminUserDef) {
          // Find admin's profile
          const adminProfileResult = await dbClient4.query(
            'SELECT user_id FROM public.profiles WHERE email = $1',
            [adminUserDef.email]
          );

          if (adminProfileResult.rows.length > 0) {
            const adminUserId = adminProfileResult.rows[0].user_id;
            
            // Find admin's org
            const adminOrgResult = await dbClient4.query(
              'SELECT id FROM public.clients WHERE created_by = $1',
              [adminUserId]
            );

            if (adminOrgResult.rows.length > 0) {
              const adminOrgId = adminOrgResult.rows[0].id;
              
              await dbClient4.query(
                `INSERT INTO public.client_users (client_id, user_id, is_org_admin, role)
                 VALUES ($1, $2, false, 'viewer')
                 ON CONFLICT (client_id, user_id) DO UPDATE
                 SET is_org_admin = false, role = 'viewer'`,
                [adminOrgId, result.userId]
              );

              result.organizationId = adminOrgId;
              console.log(`  ✓ Added to admin's organization`);
            } else {
              console.warn(`  ⚠️  Admin organization not found for client user`);
            }
          } else {
            console.warn(`  ⚠️  Admin user not found, client will be created without org membership`);
          }
        }
      }
      } finally {
        await dbClient4.end();
      }
    }

    result.success = true;
    return result;
  } catch (error: any) {
    result.error = error.message || 'Unknown error';
    return result;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const reset = args.includes('--reset') || args.includes('-r');

  // Check if test users already exist
  const dbUrl = 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';
  const checkClient = new Client({ connectionString: dbUrl });
  await checkClient.connect();
  
  try {
    const existingUsers = await checkClient.query(
      `SELECT email FROM public.profiles WHERE email = ANY($1::text[])`,
      [[
        'test-superadmin@vibeops.test',
        'test-admin@vibeops.test',
        'test-client@vibeops.test',
      ]]
    );
    
    if (existingUsers.rows.length > 0 && !reset) {
      console.log('⚠️  Test users already exist!');
      console.log(`   Found ${existingUsers.rows.length} existing test user(s):`);
      existingUsers.rows.forEach(row => console.log(`   - ${row.email}`));
      console.log('\n   To recreate them, run: npm run seed:test-users:reset');
      console.log('   Or use the --reset flag: npm run seed:test-users -- --reset\n');
      process.exit(0);
    }
    
    if (reset || existingUsers.rows.length > 0) {
      await deleteTestUsers();
    }
  } finally {
    await checkClient.end();
  }

  console.log('🌱 Seeding test users...\n');

  const results: TestUserResult[] = [];

  for (const userDef of TEST_USERS) {
    console.log(`Creating: ${userDef.email} (${userDef.role})...`);
    const result = await createTestUser(userDef);
    results.push(result);

    if (result.success) {
      console.log(`  ✅ Success!\n`);
    } else {
      console.log(`  ❌ Failed: ${result.error}\n`);
    }
  }

  // Summary
  console.log('\n📊 Summary:');
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  successful.forEach(r => {
    console.log(`  ✅ ${r.email} (${r.userId})`);
    if (r.organizationId) {
      console.log(`     Organization: ${r.organizationId}`);
    }
  });

  if (failed.length > 0) {
    console.log('\n❌ Failed:');
    failed.forEach(r => {
      console.log(`  ❌ ${r.email}: ${r.error}`);
    });
  }

  console.log(`\n✅ Created ${successful.length}/${results.length} test users`);
  console.log('\n📝 Test User Credentials:');
  TEST_USERS.forEach(u => {
    console.log(`  ${u.email} / ${u.password} (${u.role})`);
  });

  if (failed.length > 0) {
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
