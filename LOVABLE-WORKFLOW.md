# 🎨 VibeOps + Lovable Workflow

**Problem:** You build in Lovable but want environment separation and security.
**Solution:** VibeOps gives you this automatically!

## 🚀 Quick Start for Lovable Users

### 1️⃣ Create Your Project from VibeOps

**Option A: Fork this repo**
```bash
# Click "Fork" on GitHub
# Or use GitHub CLI:
gh repo fork mbjorke/vibeops-template --clone
```

**Option B: Use this template**
```bash
# Click "Use this template" on GitHub
# Choose a name for your project, e.g., "my-awesome-app"
```

### 2️⃣ Configure Supabase Environments

**Create 3 Supabase projects:**

1. **DEV** (development): `my-app-dev`
2. **BETA** (test): `my-app-beta`
3. **PROD** (live): `my-app-prod`

**Add GitHub Secrets:**

Go to your repo → Settings → Secrets and variables → Actions:

```
DEV environment:
├── VITE_SUPABASE_URL_DEV=https://xxx-dev.supabase.co
└── VITE_SUPABASE_ANON_KEY_DEV=eyJhbGc...

BETA environment:
├── VITE_SUPABASE_URL_BETA=https://xxx-beta.supabase.co
└── VITE_SUPABASE_ANON_KEY_BETA=eyJhbGc...

PROD environment:
├── VITE_SUPABASE_URL_PROD=https://xxx-prod.supabase.co
└── VITE_SUPABASE_ANON_KEY_PROD=eyJhbGc...
```

### 3️⃣ Connect to Lovable

**Option A: Import to Lovable**
1. Go to [lovable.dev](https://lovable.dev)
2. Click **"Import from GitHub"**
3. Select your project
4. Lovable reads your code and you can start building! 🎉

**Option B: Push Lovable Code to VibeOps**
1. Build in Lovable first
2. Export/Push to GitHub
3. Merge with VibeOps template

### 4️⃣ Develop in Lovable

**Build as usual in Lovable:**
- Use AI chat to build features
- Components are created automatically
- Supabase queries are handled by Lovable

**VibeOps automatically adds:**
- ✅ Environment badge (shows DEV/BETA/PROD)
- ✅ Secure Supabase client
- ✅ GitHub Actions for scanning
- ✅ RLS migrations

### 5️⃣ Push & Deploy

```bash
# Lovable pushes automatically to GitHub
# Or manually:
git add .
git commit -m "Add new feature"
git push
```

**What happens automatically:**
1. ✅ GitHub Actions starts
2. ✅ ESLint runs
3. ✅ TypeScript compiles
4. ✅ CodeQL scans for security issues
5. ✅ Gitleaks checks for secrets
6. ✅ Dependabot checks dependencies
7. ✅ Deploy preview is created (if Vercel configured)

### 6️⃣ Environment Management

**DEV (development):**
```bash
# Locally or in Lovable
VITE_APP_ENV=DEV
```
- Blue badge
- Experiment freely
- Use DEV Supabase

**BETA (staging):**
```bash
VITE_APP_ENV=BETA
```
- Orange badge
- Test with "real" data
- Use BETA Supabase
- Show to clients before PROD

**PROD (live):**
```bash
VITE_APP_ENV=PROD
```
- Red badge
- Live for users
- Use PROD Supabase
- Only pushes from main/production branch

## 🔄 Typical Workflow

```
┌─────────────────────────────────────────────────┐
│  1. Build in Lovable with AI                   │
│     "Create a dashboard with user stats"       │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│  2. Lovable pushes to GitHub                   │
│     (automatically or manually)                │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│  3. GitHub Actions run automatically           │
│     ✓ Security scanning                        │
│     ✓ Lint & Build                             │
│     ✓ Deploy preview                           │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│  4. Merge to correct branch                    │
│     develop → BETA environment                 │
│     main    → PROD environment                 │
└─────────────────────────────────────────────────┘
```

## 🎯 Best Practices

### Branching Strategy

```
main (PROD)
 ↑
develop (BETA)
 ↑
feature/* (DEV)
```

**Feature branch:**
```bash
git checkout -b feature/user-dashboard
# Build in Lovable
git push origin feature/user-dashboard
# → Runs against DEV environment
```

**Merge to staging:**
```bash
git checkout develop
git merge feature/user-dashboard
git push
# → Runs against BETA environment
```

**Deploy to production:**
```bash
git checkout main
git merge develop
git push
# → Runs against PROD environment
```

### Environment Badge in Lovable App

VibeOps automatically adds an environment badge. It's visible in all environments:

```typescript
// src/App.tsx
import { EnvironmentBadge } from './components/EnvironmentBadge'

function App() {
  return (
    <>
      <EnvironmentBadge />
      {/* Your Lovable app */}
      <YourLovableComponents />
    </>
  )
}
```

### Supabase Client

Use VibeOps Supabase client instead of creating your own:

```typescript
// Lovable default:
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(url, key)  // ❌ Hardcoded

// VibeOps (better):
import { supabase } from './lib/supabase'  // ✅ Environment-aware
```

## 🔐 Security

### What VibeOps Checks Automatically:

1. **CodeQL**: Finds XSS, SQL injection, etc.
2. **Gitleaks**: Finds exposed API keys
3. **Dependabot**: Finds vulnerable npm packages
4. **RLS Policies**: Examples of Row Level Security

### Lovable + Supabase Security Tips:

```sql
-- Secure your Supabase tables with RLS
-- See: supabase/migrations/00001_initial_schema.sql

CREATE POLICY "Users see only own data"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);
```

## 🐛 Troubleshooting

### "Environment badge shows wrong environment"

Check that correct env vars are set:
```bash
# Locally (.env.local):
VITE_APP_ENV=DEV

# GitHub Actions (repo secrets):
VITE_SUPABASE_URL_DEV=...
```

### "GitHub Actions failing"

1. Check Actions tab on GitHub
2. Read error message
3. Usually: missing secrets or lint errors

### "Lovable can't import project"

1. Ensure package.json exists
2. Ensure it's a valid React/Vite project
3. Contact Lovable support if issue persists

## 📚 More Info

- [README.md](./README.md) - Complete documentation
- [SECURITY.md](./SECURITY.md) - Security guidelines
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribute to VibeOps

## 💡 Tips

**For Lovable power users:**
- Use Lovable for rapid prototyping (DEV)
- Test in BETA before PROD
- Let GitHub Actions catch bugs early
- Environment badges prevent "developed in PROD" mistakes!

---

**Built for Lovable users who want enterprise security with consumer simplicity.** 🚀
