# Authentication Flow Documentation

This document describes the complete authentication flow in VibeOps, including user signup, password reset, role assignment, and the database triggers that manage these processes.

## Overview

VibeOps uses Supabase Auth for authentication with a custom multi-tenant role system. The system automatically assigns roles and creates organizations through database triggers when users sign up.

## Key Components

### Database Trigger: `handle_new_user()`

**Location**: `supabase/migrations/20260125000000_fix_handle_new_user_idempotent.sql`

This trigger function runs automatically when a new user is inserted into `auth.users`. It is **idempotent** - meaning it can be called multiple times safely without duplicating data or losing permissions.

**When it runs:**
- After a new user signs up
- Potentially during password reset (if Supabase triggers user updates)

**What it does:**
1. Creates a user profile (if it doesn't exist)
2. Assigns a role based on context (if role doesn't exist)
3. Creates organization membership (if applicable)

## User Signup Flows

### Flow 1: First User (Superadmin)

**Scenario**: The very first user to sign up in the system.

```
User Signs Up
    ↓
handle_new_user() Trigger Fires
    ↓
Check: Is this the first user? (user_count = 0)
    ↓ YES
Create Profile
Assign Role: 'superadmin'
    ↓
Complete
```

**Result:**
- User gets `superadmin` role
- No organization created (superadmin manages all orgs)

### Flow 2: New Organization Signup (Admin)

**Scenario**: A new user signs up without an invitation, creating a new organization.

```
User Signs Up (with company_name in metadata)
    ↓
handle_new_user() Trigger Fires
    ↓
Check: First user? → NO
Check: Has invitation? → NO
    ↓
Create Profile
Create Organization (from company_name)
Assign Role: 'admin'
Add to Organization as org_admin
    ↓
Complete
```

**Result:**
- User gets `admin` role
- New organization created
- User is `is_org_admin = true` for their organization

### Flow 3: Invited User (Client)

**Scenario**: A user signs up via an invitation link.

```
User Signs Up (with invitation token)
    ↓
handle_new_user() Trigger Fires
    ↓
Check: First user? → NO
Check: Has valid invitation? → YES
    ↓
Create Profile
Assign Role: 'client'
Add to Organization (from invitation.organization_id)
    ↓
Complete
```

**Result:**
- User gets `client` role
- User added to the inviting organization
- User is `is_org_admin = false` (viewer role)

## Password Reset Flow

### Step-by-Step Process

```
1. User clicks "Forgot Password"
   ↓
2. User enters email
   ↓
3. Supabase sends password reset email
   ↓
4. User clicks link in email
   ↓
5. User redirected to /reset-password with tokens in URL
   ↓
6. ResetPassword component:
   - Extracts tokens from URL hash
   - Sets session using setSession()
   - Shows password reset form
   ↓
7. User enters new password
   ↓
8. supabase.auth.updateUser({ password }) called
   ↓
9. Password updated in auth.users
   ↓
10. Session refreshed
    ↓
11. useAuth hook:
    - Detects session change
    - Fetches user role from user_roles table
    - Fetches organizations from client_users table
    ↓
12. User permissions verified
```

### Critical Safeguards

**Idempotency Protection:**

The `handle_new_user()` function includes multiple safeguards to prevent permission loss:

1. **Profile Check**: Only creates profile if it doesn't exist
   ```sql
   IF NOT profile_exists THEN
     INSERT INTO profiles ...
   END IF;
   ```

2. **Role Preservation**: If user already has a role, it's preserved
   ```sql
   IF role_exists THEN
     RAISE NOTICE 'User already has role, preserving permissions';
     RETURN NEW;  -- Exit early, don't modify role
   END IF;
   ```

3. **Organization Check**: If user has org membership, don't create new org
   ```sql
   IF EXISTS(SELECT 1 FROM client_users WHERE user_id = NEW.id) THEN
     -- User is existing member, skip org creation
     RETURN NEW;
   END IF;
   ```

4. **Conflict Handling**: All INSERTs use `ON CONFLICT DO NOTHING`
   ```sql
   INSERT INTO user_roles (user_id, role) 
   VALUES (NEW.id, 'admin')
   ON CONFLICT (user_id, role) DO NOTHING;
   ```

## Role Hierarchy

| Role | Scope | Capabilities |
|------|-------|--------------|
| `superadmin` | Platform | Manage all organizations, platform settings, see all data |
| `admin` | Organization | Manage their org's repos, invite users, configure branding |
| `client` | Organization | View assigned projects within their org only |

## Edge Cases & Safeguards

### Edge Case 1: User with Profile but No Role

**Scenario**: Profile exists but role was deleted or never created.

**Handling**: 
- If user has org membership, assign default 'client' role
- Otherwise, follow normal signup flow

### Edge Case 2: User with Role but No Org Membership

**Scenario**: Role exists but user isn't in any organization.

**Handling**:
- Role is preserved
- No new organization created (user might be superadmin or orphaned)

### Edge Case 3: Expired Invitation

**Scenario**: User signs up after invitation expires.

**Handling**:
- No invitation found → Treated as new organization signup
- User becomes admin of new org

### Edge Case 4: Multiple Trigger Calls

**Scenario**: `handle_new_user()` is called multiple times (e.g., during password reset).

**Handling**:
- All checks are idempotent
- Existing data is never overwritten
- Permissions are always preserved

## Database Schema

### Key Tables

**`profiles`**
- Stores user profile information
- One-to-one with `auth.users`
- `user_id` is UNIQUE

**`user_roles`**
- Stores global role assignments
- One user can have one role (enforced by application logic)
- `(user_id, role)` is UNIQUE

**`client_users`**
- Junction table for organization membership
- Links users to organizations
- `(client_id, user_id)` is UNIQUE

**`invitations`**
- Stores pending invitations
- Links to organizations via `organization_id`
- Expires based on `expires_at`

## Testing the Flow

### Manual Test Checklist

1. **First User Signup**
   - [ ] Sign up as first user
   - [ ] Verify superadmin role assigned
   - [ ] Verify no organization created

2. **New Organization Signup**
   - [ ] Sign up with company name
   - [ ] Verify admin role assigned
   - [ ] Verify organization created
   - [ ] Verify user is org admin

3. **Invited User Signup**
   - [ ] Create invitation
   - [ ] Sign up with invitation token
   - [ ] Verify client role assigned
   - [ ] Verify user added to organization

4. **Password Reset - Admin User**
   - [ ] Request password reset as admin
   - [ ] Reset password
   - [ ] Verify admin role preserved
   - [ ] Verify organization membership preserved
   - [ ] Verify permissions still work

5. **Password Reset - Client User**
   - [ ] Request password reset as client
   - [ ] Reset password
   - [ ] Verify client role preserved
   - [ ] Verify organization membership preserved

6. **Password Reset - Superadmin**
   - [ ] Request password reset as superadmin
   - [ ] Reset password
   - [ ] Verify superadmin role preserved

## Troubleshooting

### User Lost Permissions After Password Reset

**Symptoms**: User can't access features they could before.

**Diagnosis**:
1. Check `user_roles` table: `SELECT * FROM user_roles WHERE user_id = 'USER_ID';`
2. Check `client_users` table: `SELECT * FROM client_users WHERE user_id = 'USER_ID';`
3. Check trigger logs: Look for RAISE NOTICE messages in Supabase logs

**Fix**:
- If role is missing, manually restore: `INSERT INTO user_roles (user_id, role) VALUES ('USER_ID', 'admin') ON CONFLICT DO NOTHING;`
- If org membership missing, restore from backup or recreate

### Trigger Not Firing

**Symptoms**: New users don't get profiles/roles.

**Diagnosis**:
1. Check trigger exists: `SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';`
2. Check function exists: `SELECT * FROM pg_proc WHERE proname = 'handle_new_user';`

**Fix**:
- Re-run migration: `supabase db push`
- Or manually create trigger (see migration file)

## Related Files

- **Database Function**: `supabase/migrations/20260125000000_fix_handle_new_user_idempotent.sql`
- **Reset Password Page**: `src/pages/ResetPassword.tsx`
- **Signup Page**: `src/pages/Signup.tsx`
- **Auth Hook**: `src/hooks/useAuth.tsx`
- **Forgot Password Page**: `src/pages/ForgotPassword.tsx`

## Future Improvements

- [ ] Add audit logging for role changes
- [ ] Add automated integrity checks
- [ ] Add email notifications for role changes
- [ ] Add admin UI for role management
- [ ] Add automated tests for all flows
