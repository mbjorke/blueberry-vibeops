# Test Users Documentation

This document describes the automated test user system for VibeOps.

## Overview

Instead of using only mocks, VibeOps uses **real test users** created in the database. This enables:
- Integration tests with actual database records
- End-to-end testing of authentication flows
- Testing password reset, role changes, and permissions
- Manual testing with known credentials

## Test Users

Three test users are automatically created:

| Email | Password | Role | Organization |
|-------|----------|------|---------------|
| `test-superadmin@vibeops.test` | `TestSuperAdmin123!` | `superadmin` | None (platform-wide access) |
| `test-admin@vibeops.test` | `TestAdmin123!` | `admin` | "Test Admin Company" |
| `test-client@vibeops.test` | `TestClient123!` | `client` | Added to admin's org |

## Creating Test Users

### Initial Setup

```bash
# Create test users
npm run seed:test-users

# Reset and recreate (deletes existing first)
npm run seed:test-users:reset
```

### Requirements

The seed script requires:
- `VITE_SUPABASE_URL` or `SUPABASE_URL` in `.env.local`
- `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` (bypasses RLS)

**⚠️ Security Note**: The service role key has full database access. Never commit it to git!

### What Gets Created

For each test user, the script:
1. Creates user in `auth.users` via Admin API
2. Waits for `handle_new_user()` trigger to create profile/role
3. Verifies profile and role were created correctly
4. Creates/assigns organization membership if needed
5. Outputs user IDs and credentials

## Using Test Users in Tests

### Import Credentials

```typescript
import { getTestUserCredentials, TEST_USER_CREDENTIALS } from '@/test/fixtures/testUsers';

// Get credentials for a specific role
const adminCreds = getTestUserCredentials('admin');
// { email: 'test-admin@vibeops.test', password: 'TestAdmin123!', role: 'admin' }

// Or use directly
const { email, password } = TEST_USER_CREDENTIALS.superadmin;
```

### Integration Test Example

```typescript
import { supabase } from '@/integrations/supabase/client';
import { getTestUserCredentials } from '@/test/fixtures/testUsers';

describe('Password Reset Integration', () => {
  it('should preserve admin role after password reset', async () => {
    const { email, password } = getTestUserCredentials('admin');
    
    // Sign in as admin
    const { data: { session } } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    expect(session).toBeTruthy();
    
    // Get user's role
    const { data: role } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .single();
    
    expect(role?.role).toBe('admin');
    
    // Reset password
    await supabase.auth.updateUser({ password: 'NewPassword123!' });
    
    // Verify role still exists
    const { data: roleAfter } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .single();
    
    expect(roleAfter?.role).toBe('admin');
  });
});
```

### Manual Testing

You can also use these credentials for manual testing:

1. Go to `/login`
2. Use any test user email/password
3. Test features as that role
4. Reset password to test password reset flow

## Test User Lifecycle

### Creation

Test users are created via the seed script which:
- Uses Supabase Admin API to create users
- Triggers `handle_new_user()` automatically
- Sets up roles and organizations
- Outputs all user IDs for reference

### Cleanup

To reset test users:

```bash
npm run seed:test-users:reset
```

This will:
1. Delete existing test users (by email)
2. Recreate them with fresh data
3. Reassign roles and organizations

### Identification

Test users are identified by their email domain: `@vibeops.test`

You can check if a user is a test user:

```typescript
import { isTestUserEmail } from '@/test/fixtures/testUsers';

if (isTestUserEmail(user.email)) {
  // This is a test user
}
```

## Database Functions

### Finding Test Users

```sql
-- Find all test users
SELECT u.id, u.email, p.full_name, ur.role
FROM auth.users u
JOIN profiles p ON p.user_id = u.id
LEFT JOIN user_roles ur ON ur.user_id = u.id
WHERE u.email LIKE '%@vibeops.test'
ORDER BY u.email;
```

### Verifying Test User State

```sql
-- Check integrity of a test user
SELECT * FROM verify_user_integrity('USER_ID_HERE');
```

## Best Practices

1. **Never use test users in production** - They're only for development/testing
2. **Reset test users regularly** - Use `--reset` flag to clean slate
3. **Don't modify test user passwords manually** - Use the seed script
4. **Use test users for integration tests** - More realistic than mocks
5. **Keep credentials in sync** - Update `testUsers.ts` if you change seed script

## Troubleshooting

### Test users not created

- Check `.env.local` has `SUPABASE_SERVICE_ROLE_KEY`
- Verify Supabase is running: `npm run db:status`
- Check seed script output for errors

### Test users missing roles

- Run seed script again: `npm run seed:test-users:reset`
- Check database logs for trigger errors
- Verify `handle_new_user()` function exists

### Can't sign in with test user

- Verify user was created: Check Supabase Auth dashboard
- Try resetting: `npm run seed:test-users:reset`
- Check email confirmation status (seed script auto-confirms)

## Related Files

- **Seed Script**: `scripts/seed-test-users.ts`
- **Test Credentials**: `src/test/fixtures/testUsers.ts`
- **Mock Users** (for unit tests): `src/test/fixtures/users.ts`
- **Auth Flow Docs**: `docs/02-DESIGN/AUTH_FLOW.md`
