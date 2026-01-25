# Authentication Strategy: Clerk vs Supabase Auth

## Current State

### UXDB
- **Auth Provider**: Clerk
- **User ID Format**: TEXT (Clerk user IDs)
- **Components Used**: `SignIn`, `SignUp`, `useAuth`, `useUser` from `@clerk/clerk-react`
- **Files**: `src/pages/Auth.tsx`, multiple components using `useUser()`

### VibeOps
- **Auth Provider**: Supabase Auth
- **User ID Format**: UUID (Supabase user IDs)
- **Components**: Custom `useAuth` hook, `Login.tsx`, `Signup.tsx`
- **Features**: Email/password, password reset, multi-tenant org support

## Feature Comparison

| Feature | Clerk | Supabase Auth | Winner |
|---------|-------|---------------|--------|
| **Email/Password** | ✅ | ✅ | Tie |
| **Social OAuth** | ✅ (Built-in UI) | ✅ (Manual setup) | Clerk |
| **User Management** | ✅ (Dashboard) | ✅ (API/Studio) | Clerk |
| **Session Management** | ✅ (Automatic) | ✅ (Automatic) | Tie |
| **Multi-tenant Support** | ✅ (Organizations) | ✅ (Custom RLS) | Tie |
| **Database Integration** | ❌ (Separate) | ✅ (Native) | Supabase |
| **RLS Integration** | ⚠️ (Manual) | ✅ (Native) | Supabase |
| **Cost** | 💰 (Paid tiers) | ✅ (Free tier generous) | Supabase |
| **Self-hosted** | ❌ | ✅ (Open source) | Supabase |
| **Customization** | ⚠️ (Limited) | ✅ (Full control) | Supabase |

## Recommendation: Migrate UXDB to Supabase Auth

### Reasons

1. **Unified Database**: Supabase Auth integrates natively with database RLS policies
2. **Cost**: Supabase free tier is more generous than Clerk
3. **Consistency**: VibeOps already uses Supabase Auth
4. **Multi-tenant**: Both support it, but Supabase RLS is more flexible
5. **Self-hosting**: Supabase can be self-hosted if needed
6. **Data Ownership**: All auth data in your database, not external service

### Trade-offs

**What we lose**:
- Clerk's polished UI components (but we can build our own)
- Clerk's built-in social OAuth UI (but Supabase supports it)
- Clerk's user management dashboard (but Supabase Studio works)

**What we gain**:
- Unified auth system
- Native RLS integration
- Lower cost
- Better data control
- Consistent user IDs (UUID everywhere)

## Migration Strategy

### Phase 1: User Data Export

**Steps**:
1. Export all Clerk users via Clerk API
2. Extract: email, name, profile data, verification status
3. Create mapping: `clerk_user_id → supabase_user_id`

**Clerk API Export**:
```typescript
// Export script
const clerkUsers = await clerkClient.users.getUserList();
const exportData = clerkUsers.data.map(user => ({
  clerk_id: user.id,
  email: user.emailAddresses[0]?.emailAddress,
  first_name: user.firstName,
  last_name: user.lastName,
  verified: user.emailAddresses[0]?.verification?.status === 'verified',
  created_at: user.createdAt,
  metadata: user.publicMetadata
}));
```

### Phase 2: Supabase User Creation

**Options**:

**Option A: Bulk Import (Admin API)**
```typescript
// Use Supabase Admin API to create users
for (const clerkUser of exportedUsers) {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: clerkUser.email,
    email_confirm: clerkUser.verified,
    user_metadata: {
      first_name: clerkUser.first_name,
      last_name: clerkUser.last_name,
      clerk_id: clerkUser.clerk_id // For reference
    }
  });
  
  // Store mapping
  await supabase.from('clerk_user_migration').insert({
    clerk_id: clerkUser.clerk_id,
    supabase_id: data.user.id
  });
}
```

**Option B: Invite Flow**
- Send password reset emails to all users
- Users set password on first login
- More user-friendly but requires user action

**Recommendation**: Option A for active users, Option B for inactive users

### Phase 3: Data Migration

**Update Foreign Keys**:

```sql
-- Create migration mapping table
CREATE TABLE clerk_user_migration (
  clerk_id TEXT PRIMARY KEY,
  supabase_id UUID REFERENCES auth.users(id),
  migrated_at TIMESTAMPTZ DEFAULT now()
);

-- Update tool_reviews
UPDATE tool_reviews tr
SET user_id = cum.supabase_id::uuid
FROM clerk_user_migration cum
WHERE tr.user_id::text = cum.clerk_id;

-- Update review_votes
UPDATE review_votes rv
SET user_id = cum.supabase_id::text
FROM clerk_user_migration cum
WHERE rv.user_id = cum.clerk_id;

-- Verify all updates
SELECT 
  'tool_reviews' as table_name,
  COUNT(*) as unmigrated_count
FROM tool_reviews tr
WHERE NOT EXISTS (
  SELECT 1 FROM clerk_user_migration cum 
  WHERE tr.user_id::text = cum.clerk_id
)
UNION ALL
SELECT 
  'review_votes' as table_name,
  COUNT(*) as unmigrated_count
FROM review_votes rv
WHERE NOT EXISTS (
  SELECT 1 FROM clerk_user_migration cum 
  WHERE rv.user_id = cum.clerk_id
);
```

### Phase 4: Frontend Migration

**Replace Clerk Components**:

**Before (Clerk)**:
```tsx
import { SignIn, SignUp, useAuth, useUser } from "@clerk/clerk-react";

const { isSignedIn, userId } = useAuth();
const { user } = useUser();
```

**After (Supabase Auth)**:
```tsx
import { useAuth } from "@/hooks/useAuth";

const { user, isAdmin, isSuperAdmin } = useAuth();
const userId = user?.id;
```

**Migration Checklist**:
- [ ] Replace `Auth.tsx` with Supabase auth components
- [ ] Update `Header.tsx` to use `useAuth` hook
- [ ] Update `ToolReviews.tsx` to use Supabase user
- [ ] Update `SimpleAddToList.tsx` to use Supabase user
- [ ] Update `MyLists.tsx` to use Supabase user
- [ ] Remove `@clerk/clerk-react` dependency
- [ ] Remove `ClerkProvider` from `main.tsx`
- [ ] Add `AuthProvider` from VibeOps

### Phase 5: Session Migration

**Challenge**: Active Clerk sessions won't work with Supabase

**Solution**:
1. Notify users via email about migration
2. Provide clear migration instructions
3. Users re-login with Supabase Auth
4. Optionally: Temporary dual-auth period (both systems work)

## Migration Timeline

### Week 1: Preparation
- Export Clerk users
- Create migration scripts
- Test user creation process
- Set up mapping table

### Week 2: Data Migration
- Create Supabase users
- Update foreign keys
- Verify data integrity
- Test with sample users

### Week 3: Frontend Migration
- Replace Clerk components
- Update all auth hooks
- Test authentication flows
- Update protected routes

### Week 4: Testing & Rollout
- Test with beta users
- Fix migration issues
- Notify all users
- Complete migration
- Deprecate Clerk

## Rollback Plan

**If migration fails**:
1. Keep Clerk active during migration
2. Run both systems in parallel
3. Sync data bidirectionally
4. Gradual user migration
5. Full rollback if critical issues

## Post-Migration

### Benefits
- Unified auth system
- Consistent UUID user IDs
- Native RLS integration
- Lower costs
- Better data control

### Maintenance
- Remove Clerk dependency
- Archive Clerk data
- Update documentation
- Monitor auth metrics

## Alternative: Keep Clerk, Add Supabase Bridge

**If migration is too risky**:

**Option**: Keep Clerk for UXDB, use Supabase Auth for VibeOps, bridge them

**Implementation**:
```sql
-- Bridge table
CREATE TABLE auth_bridge (
  clerk_id TEXT PRIMARY KEY,
  supabase_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ
);

-- Function to get Supabase ID from Clerk ID
CREATE FUNCTION get_supabase_id_from_clerk(clerk_id TEXT)
RETURNS UUID AS $$
  SELECT supabase_id FROM auth_bridge WHERE clerk_id = $1;
$$ LANGUAGE sql;
```

**Pros**: No migration risk, gradual transition
**Cons**: Two auth systems to maintain, complexity

**Recommendation**: Full migration is better long-term, but bridge is viable short-term.
