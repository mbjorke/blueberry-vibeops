# 🎨 VibeOps + Lovable Workflow

**Problem:** Du bygger i Lovable men vill ha miljöseparation och säkerhet.
**Lösning:** VibeOps ger dig detta automatiskt!

## 🚀 Quick Start för Lovable-användare

### 1️⃣ Skapa ditt projekt från VibeOps

**Option A: Fork detta repo**
```bash
# Klicka "Fork" på GitHub
# Eller använd GitHub CLI:
gh repo fork mbjorke/vibeops-template --clone
```

**Option B: Use this template**
```bash
# Klicka "Use this template" på GitHub
# Välj namn för ditt projekt, t.ex. "my-awesome-app"
```

### 2️⃣ Konfigurera Supabase-miljöer

**Skapa 3 Supabase-projekt:**

1. **DEV** (utveckling): `my-app-dev`
2. **BETA** (test): `my-app-beta`
3. **PROD** (live): `my-app-prod`

**Lägg till GitHub Secrets:**

Gå till ditt repo → Settings → Secrets and variables → Actions:

```
DEV miljö:
├── VITE_SUPABASE_URL_DEV=https://xxx-dev.supabase.co
└── VITE_SUPABASE_ANON_KEY_DEV=eyJhbGc...

BETA miljö:
├── VITE_SUPABASE_URL_BETA=https://xxx-beta.supabase.co
└── VITE_SUPABASE_ANON_KEY_BETA=eyJhbGc...

PROD miljö:
├── VITE_SUPABASE_URL_PROD=https://xxx-prod.supabase.co
└── VITE_SUPABASE_ANON_KEY_PROD=eyJhbGc...
```

### 3️⃣ Koppla till Lovable

**Option A: Importera till Lovable**
1. Gå till [lovable.dev](https://lovable.dev)
2. Klicka **"Import from GitHub"**
3. Välj ditt projekt
4. Lovable läser din kod och du kan börja bygga! 🎉

**Option B: Push Lovable-kod till VibeOps**
1. Bygg i Lovable först
2. Exportera/Push till GitHub
3. Merge med VibeOps template

### 4️⃣ Utveckla i Lovable

**Bygg som vanligt i Lovable:**
- Använd AI-chatten för att bygga features
- Komponenter skapas automatiskt
- Supabase queries hanteras av Lovable

**VibeOps adderar automatiskt:**
- ✅ Environment badge (visar DEV/BETA/PROD)
- ✅ Säker Supabase client
- ✅ GitHub Actions för scanning
- ✅ RLS migrations

### 5️⃣ Push & Deploy

```bash
# Lovable pushar automatiskt till GitHub
# Eller manuellt:
git add .
git commit -m "Add new feature"
git push
```

**Vad händer automatiskt:**
1. ✅ GitHub Actions startar
2. ✅ ESLint körs
3. ✅ TypeScript kompileras
4. ✅ CodeQL scannar efter säkerhetsproblem
5. ✅ Gitleaks kollar efter secrets
6. ✅ Dependabot kollar dependencies
7. ✅ Deploy preview skapas (om Vercel konfigurerat)

### 6️⃣ Miljöhantering

**DEV (utveckling):**
```bash
# Lokalt eller i Lovable
VITE_APP_ENV=DEV
```
- Blå badge
- Experimentera fritt
- Använd DEV Supabase

**BETA (staging):**
```bash
VITE_APP_ENV=BETA
```
- Orange badge
- Testa med "riktig" data
- Använd BETA Supabase
- Visa för kunder innan PROD

**PROD (live):**
```bash
VITE_APP_ENV=PROD
```
- Röd badge
- Live för användare
- Använd PROD Supabase
- Endast pushes från main/production branch

## 🔄 Typisk Workflow

```
┌─────────────────────────────────────────────────┐
│  1. Bygg i Lovable med AI                      │
│     "Skapa en dashboard med user stats"        │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│  2. Lovable pushar till GitHub                 │
│     (automatiskt eller manuellt)               │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│  3. GitHub Actions kör automatiskt             │
│     ✓ Säkerhetsscanning                        │
│     ✓ Lint & Build                             │
│     ✓ Deploy preview                           │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│  4. Merge till rätt branch                     │
│     develop → BETA miljö                       │
│     main    → PROD miljö                       │
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
# Bygg i Lovable
git push origin feature/user-dashboard
# → Kör mot DEV miljö
```

**Merge till staging:**
```bash
git checkout develop
git merge feature/user-dashboard
git push
# → Kör mot BETA miljö
```

**Deploy till production:**
```bash
git checkout main
git merge develop
git push
# → Kör mot PROD miljö
```

### Environment Badge i Lovable-app

VibeOps lägger automatiskt till environment badge. Den syns i alla miljöer:

```typescript
// src/App.tsx
import { EnvironmentBadge } from './components/EnvironmentBadge'

function App() {
  return (
    <>
      <EnvironmentBadge />
      {/* Din Lovable-app */}
      <YourLovableComponents />
    </>
  )
}
```

### Supabase Client

Använd VibeOps Supabase client istället för att skapa egen:

```typescript
// Lovable default:
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(url, key)  // ❌ Hårdkodat

// VibeOps (bättre):
import { supabase } from './lib/supabase'  // ✅ Miljö-aware
```

## 🔐 Säkerhet

### Vad VibeOps checkar automatiskt:

1. **CodeQL**: Hittar XSS, SQL injection, etc.
2. **Gitleaks**: Hittar exponerade API keys
3. **Dependabot**: Hittar sårbara npm packages
4. **RLS Policies**: Exempel på Row Level Security

### Lovable + Supabase Security Tips:

```sql
-- Säkra dina Supabase-tabeller med RLS
-- Se: supabase/migrations/00001_initial_schema.sql

CREATE POLICY "Users see only own data"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);
```

## 🐛 Troubleshooting

### "Environment badge visar fel miljö"

Kolla att rätt env vars är satta:
```bash
# Lokalt (.env.local):
VITE_APP_ENV=DEV

# GitHub Actions (repo secrets):
VITE_SUPABASE_URL_DEV=...
```

### "GitHub Actions failar"

1. Kolla Actions tab på GitHub
2. Läs felmeddelandet
3. Oftast: missing secrets eller lint errors

### "Lovable kan inte importera projektet"

1. Se till att package.json finns
2. Se till att det är ett giltigt React/Vite projekt
3. Kontakta Lovable support om issue kvarstår

## 📚 Mer Info

- [README.md](./README.md) - Komplett dokumentation
- [SECURITY.md](./SECURITY.md) - Säkerhetsriktlinjer
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Bidra till VibeOps

## 💡 Tips

**För Lovable-power-users:**
- Använd Lovable för snabb prototyping (DEV)
- Testa i BETA innan PROD
- Låt GitHub Actions fånga buggar tidigt
- Environment badges förhindrar "utvecklade i PROD"-misstag!

---

**Byggt för Lovable-användare som vill ha enterprise-säkerhet med consumer-enkelhet.** 🚀
