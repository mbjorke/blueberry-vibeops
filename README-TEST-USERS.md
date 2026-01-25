# Test Users Quick Start

## Quick Setup

1. **Install dependencies** (if needed):
   ```bash
   npm install
   ```

2. **Start Supabase** (if not running):
   ```bash
   npm run db:start
   ```

3. **Get service role key**:
   ```bash
   supabase status
   ```
   Copy the `service_role key` value.

4. **Add to `.env.local`**:
   ```env
   VITE_SUPABASE_URL=http://127.0.0.1:54321
   SUPABASE_SERVICE_ROLE_KEY=<paste service_role key here>
   ```

5. **Create test users**:
   ```bash
   npm run seed:test-users
   ```

## Test User Credentials

| Email | Password | Role |
|-------|----------|------|
| `test-superadmin@vibeops.test` | `TestSuperAdmin123!` | superadmin |
| `test-admin@vibeops.test` | `TestAdmin123!` | admin |
| `test-client@vibeops.test` | `TestClient123!` | client |

## Usage in Tests

```typescript
import { signInAsTestUser } from '@/test/helpers/testAuth';

// Sign in as admin
const { session, user } = await signInAsTestUser('admin');

// Use the session for authenticated requests
```

## Reset Test Users

```bash
npm run seed:test-users:reset
```

This deletes and recreates all test users.

## More Info

See `docs/02-DESIGN/TEST_USERS.md` for complete documentation.
