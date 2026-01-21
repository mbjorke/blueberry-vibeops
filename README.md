# VibeOps 🚀

**Managed DevSecOps Template för AI-kodade appar**

En produktionsredo GitHub-template som ger dig en komplett DevSecOps-uppsättning på 5 minuter. Perfekt för applikationer byggda med Lovable, Cursor och andra AI-kodningsverktyg.

## ✨ Features

- 🔐 **Säkerhet först**: CodeQL, Dependabot, och secrets scanning inbyggt
- 🎨 **3 miljöer**: DEV, BETA, och PROD med visuella badges
- ⚡ **Snabb setup**: Fork, konfigurera, och du är igång på 5 minuter
- 🤖 **AI-vänlig**: Optimerad för Lovable, Cursor och liknande verktyg
- 🔄 **CI/CD**: Automatisk scanning och deploy via GitHub Actions
- 📦 **Supabase-ready**: Pre-konfigurerad med RLS policies
- 🎯 **Production-ready landing page**: Modern, responsiv landing page inbyggd

## 🎨 Landing Page

Templatet inkluderar en fullt fungerande landing page med:

- **Hero section** med gradient och call-to-action
- **Feature showcase** med 6 key features
- **Environment badges showcase** (DEV/BETA/PROD)
- **Quick Start guide** med steg-för-steg instruktioner
- **Tech stack display** med ikoner
- **Footer** med länkar till dokumentation

Landing page är byggd med Tailwind CSS och är helt responsiv. Anpassa den enkelt genom att redigera `src/components/LandingPage.tsx`.

### Anpassa Landing Page

```typescript
// src/components/LandingPage.tsx

// Ändra GitHub URL:
href="https://github.com/YOURUSERNAME/YOURREPO"

// Anpassa färger i Tailwind:
className="bg-gradient-to-r from-blue-500 to-purple-600"

// Lägg till/ta bort features:
// Redigera features array i Features Section
```

## 🚀 Quick Start (5 minuter)

### 1. Fork detta repository

Klicka på "Use this template" längst upp på sidan eller fork:a repot direkt.

### 2. Skapa Supabase-projekt

Skapa tre separata Supabase-projekt för dina miljöer:

- `your-app-dev` (DEV)
- `your-app-beta` (BETA)
- `your-app-prod` (PROD)

Gå till [Supabase Dashboard](https://app.supabase.com) → New Project

### 3. Konfigurera environment variables

```bash
# Kopiera exempel-filen
cp .env.example .env.local

# Redigera .env.local och lägg till dina Supabase-credentials
# Hämta dessa från Supabase Dashboard → Settings → API
```

**.env.local exempel:**
```env
VITE_SUPABASE_URL=https://your-project-dev.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_APP_ENV=DEV
```

### 4. Installera och kör

```bash
npm install
npm run dev
```

Öppna [http://localhost:5173](http://localhost:5173) - du bör se en blå "DEV" badge längst ner till höger! 🎉

### 5. Push till GitHub

```bash
git add .
git commit -m "Initial setup"
git push
```

GitHub Actions kommer automatiskt att köra säkerhetsscanningar på varje push!

## 🎨 Miljöer

Projektet har stöd för tre miljöer, synliga via färgkodade badges:

| Miljö | Färg | Användning |
|-------|------|------------|
| **DEV** | 🔵 Blå | Utveckling och Lovable iteration |
| **BETA** | 🟠 Orange | Testning med data |
| **PROD** | 🔴 Röd | Live-produktion |

Miljön bestäms automatiskt från:
1. `VITE_APP_ENV` environment variable
2. Supabase URL (t.ex. `-dev`, `-beta`, `-prod` i URL:en)

## 🔐 Säkerhet & Compliance

### Automatiska säkerhetskontroller

Varje push och pull request kör:

- ✅ **ESLint** - Kod-kvalitet och best practices
- ✅ **CodeQL** - SAST (Static Application Security Testing)
- ✅ **npm audit** - Dependency vulnerability scanning
- ✅ **Gitleaks** - Secrets detection
- ✅ **Dependabot** - Automatiska dependency updates

### Supabase RLS

Projektet inkluderar exempel-migrations med Row Level Security (RLS) policies:

```sql
-- Se supabase/migrations/00001_initial_schema.sql
CREATE POLICY "Users can only view their own data"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);
```

Kör migrations:
```bash
# Installera Supabase CLI om du inte har det
npm install -g supabase

# Länka ditt projekt
supabase link --project-ref your-project-ref

# Kör migrations
supabase db push
```

## 📋 GitHub Actions Workflows

### CI & Security Scan (`.github/workflows/ci-scan.yml`)

Körs på: `push`, `pull_request`

- Lint & build
- CodeQL analysis
- Dependency scanning
- Secrets scanning

### Deploy Preview (`.github/workflows/deploy.yml`)

Körs på: `pull_request`

- Bygger appen
- Deployer till Vercel (kräver konfiguration)
- Kommenterar PR med preview URL

### Konfigurera Vercel Deployment (Valfritt)

1. Skapa ett projekt på [Vercel](https://vercel.com)
2. Lägg till GitHub Secrets:
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **CI/CD**: GitHub Actions
- **Deployment**: Vercel (eller valfri platform)

## 📁 Projektstruktur

```
vibeops-template/
├── src/
│   ├── lib/
│   │   └── supabase.ts          # Supabase client med env-config
│   ├── components/
│   │   └── EnvironmentBadge.tsx # Visuell miljö-indikator
│   ├── utils/
│   │   └── security.ts          # Säkerhetsverktyg
│   └── App.tsx                  # Main app component
├── supabase/
│   ├── migrations/              # Database migrations med RLS
│   └── seed.sql                 # Test-data för DEV/BETA
├── .github/
│   └── workflows/
│       ├── ci-scan.yml          # CI & säkerhetsscanningar
│       └── deploy.yml           # Deploy previews
├── .env.example                 # Environment variables template
└── README.md                    # Denna fil
```

## 🔧 Development

### Tillgängliga kommandon

```bash
npm run dev          # Starta dev server
npm run build        # Bygg för produktion
npm run preview      # Preview production build
npm run lint         # Kör ESLint
```

### Lägg till nya features

1. Utveckla i DEV-miljön (blå badge)
2. Testa i BETA-miljön (orange badge)
3. Deploy till PROD när allt fungerar (röd badge)

## 🚢 Deployment

### Vercel (Rekommenderat)

```bash
npm install -g vercel
vercel
```

### Andra platformar

Projektet fungerar med alla Vite-kompatibla hosting-tjänster:
- Netlify
- Cloudflare Pages
- AWS Amplify
- GitHub Pages

## 📝 Best Practices

### Environment Variables

- ✅ Använd alltid `.env.local` för lokala secrets
- ✅ Håll `.env.example` uppdaterad utan riktiga värden
- ❌ Commit aldrig `.env` eller `.env.local` till git

### Säkerhet

- ✅ Aktivera RLS på alla Supabase-tabeller
- ✅ Kör `npm audit` regelbundet
- ✅ Håll dependencies uppdaterade
- ❌ Exponera aldrig service_role keys i frontend

### Git Workflow

```bash
main      # Produktion (PROD)
  ↑
develop   # Staging (BETA)
  ↑
feature/* # Development (DEV)
```

## 🤝 Contributing

Bidrag är välkomna! Öppna en issue eller skicka en PR.

## 📄 License

MIT License - använd fritt för både personliga och kommersiella projekt.

## 🆘 Support

- 📚 [Supabase Docs](https://supabase.com/docs)
- 📚 [Vite Docs](https://vitejs.dev)
- 📚 [React Docs](https://react.dev)
- 🐛 [Report Issues](https://github.com/mbjorke/vibeops-template/issues)

## 🙏 Credits

Byggd för vibe-kodare som vill fokusera på att bygga, inte sätta upp infrastruktur.

---

**Made with ❤️ for the AI coding community**

[⭐ Star this repo](https://github.com/mbjorke/vibeops-template) if you find it useful!
