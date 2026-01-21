# VibeOps 🚀

**Managed DevSecOps Template for AI-coded Apps**

A production-ready GitHub template that gives you a complete DevSecOps setup in 5 minutes. Perfect for applications built with Lovable, Cursor, and other AI coding tools.

## ✨ Features

- 🔐 **Security First**: CodeQL, Dependabot, and secrets scanning built-in
- 🎨 **3 Environments**: DEV, BETA, and PROD with visual badges
- ⚡ **Quick Setup**: Fork, configure, and you're ready in 5 minutes
- 🤖 **AI-Friendly**: Optimized for Lovable, Cursor, and similar tools
- 🔄 **CI/CD**: Automatic scanning and deploy via GitHub Actions
- 📦 **Supabase-Ready**: Pre-configured with RLS policies
- 🎯 **Production-Ready Landing Page**: Modern, responsive landing page included

## 🎨 Landing Page

The template includes a fully functional landing page with:

- **Hero section** with gradient and call-to-action
- **Feature showcase** with 6 key features
- **Environment badges showcase** (DEV/BETA/PROD)
- **Quick Start guide** with step-by-step instructions
- **Tech stack display** with icons
- **Footer** with documentation links

Landing page is built with Tailwind CSS and is fully responsive. Easily customize by editing `src/components/LandingPage.tsx`.

### Customize Landing Page

```typescript
// src/components/LandingPage.tsx

// Change GitHub URL:
href="https://github.com/YOURUSERNAME/YOURREPO"

// Customize colors in Tailwind:
className="bg-gradient-to-r from-blue-500 to-purple-600"

// Add/remove features:
// Edit features array in Features Section
```

## 🚀 Quick Start (5 minutes)

### 1. Fork this repository

Click "Use this template" at the top of the page or fork the repo directly.

### 2. Create Supabase projects

Create three separate Supabase projects for your environments:

- `your-app-dev` (DEV)
- `your-app-beta` (BETA)
- `your-app-prod` (PROD)

Go to [Supabase Dashboard](https://app.supabase.com) → New Project

### 3. Configure environment variables

```bash
# Copy the example file
cp .env.example .env.local

# Edit .env.local and add your Supabase credentials
# Get these from Supabase Dashboard → Settings → API
```

**.env.local example:**
```env
VITE_SUPABASE_URL=https://your-project-dev.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_APP_ENV=DEV
```

### 4. Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) - you should see a blue "DEV" badge in the bottom right corner! 🎉

### 5. Push to GitHub

```bash
git add .
git commit -m "Initial setup"
git push
```

GitHub Actions will automatically run security scans on every push!

## 🎨 Environments

The project supports three environments, visible via color-coded badges:

| Environment | Color | Usage |
|-------------|-------|-------|
| **DEV** | 🔵 Blue | Development and Lovable iteration |
| **BETA** | 🟠 Orange | Testing with data |
| **PROD** | 🔴 Red | Live production |

The environment is automatically determined from:
1. `VITE_APP_ENV` environment variable
2. Supabase URL (e.g., `-dev`, `-beta`, `-prod` in URL)

## 🔐 Security & Compliance

### Automatic Security Checks

Every push and pull request runs:

- ✅ **ESLint** - Code quality and best practices
- ✅ **CodeQL** - SAST (Static Application Security Testing)
- ✅ **npm audit** - Dependency vulnerability scanning
- ✅ **Gitleaks** - Secrets detection
- ✅ **Dependabot** - Automatic dependency updates

### Supabase RLS

The project includes example migrations with Row Level Security (RLS) policies:

```sql
-- See supabase/migrations/00001_initial_schema.sql
CREATE POLICY "Users can only view their own data"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);
```

Run migrations:
```bash
# Install Supabase CLI if you don't have it
npm install -g supabase

# Link your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

## 📋 GitHub Actions Workflows

### CI & Security Scan (`.github/workflows/ci-scan.yml`)

Runs on: `push`, `pull_request`

- Lint & build
- CodeQL analysis
- Dependency scanning
- Secrets scanning

### Deploy Preview (`.github/workflows/deploy.yml`)

Runs on: `pull_request`

- Builds the app
- Deploys to Vercel (requires configuration)
- Comments on PR with preview URL

### Configure Vercel Deployment (Optional)

1. Create a project on [Vercel](https://vercel.com)
2. Add GitHub Secrets:
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **CI/CD**: GitHub Actions
- **Deployment**: Vercel (or any platform)

## 📁 Project Structure

```
vibeops-template/
├── src/
│   ├── lib/
│   │   └── supabase.ts          # Supabase client with env config
│   ├── components/
│   │   ├── EnvironmentBadge.tsx # Visual environment indicator
│   │   └── LandingPage.tsx      # Production-ready landing page
│   ├── utils/
│   │   └── security.ts          # Security utilities
│   └── App.tsx                  # Main app component
├── supabase/
│   ├── migrations/              # Database migrations with RLS
│   └── seed.sql                 # Test data for DEV/BETA
├── .github/
│   └── workflows/
│       ├── ci-scan.yml          # CI & security scans
│       └── deploy.yml           # Deploy previews
├── .env.example                 # Environment variables template
└── README.md                    # This file
```

## 🔧 Development

### Available Commands

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Add New Features

1. Develop in DEV environment (blue badge)
2. Test in BETA environment (orange badge)
3. Deploy to PROD when everything works (red badge)

## 🚢 Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

### Other Platforms

The project works with all Vite-compatible hosting services:
- Netlify
- Cloudflare Pages
- AWS Amplify
- GitHub Pages

## 📝 Best Practices

### Environment Variables

- ✅ Always use `.env.local` for local secrets
- ✅ Keep `.env.example` updated without real values
- ❌ Never commit `.env` or `.env.local` to git

### Security

- ✅ Enable RLS on all Supabase tables
- ✅ Run `npm audit` regularly
- ✅ Keep dependencies updated
- ❌ Never expose service_role keys in frontend

### Git Workflow

```bash
main      # Production (PROD)
  ↑
develop   # Staging (BETA)
  ↑
feature/* # Development (DEV)
```

## 🎨 Lovable Integration

Perfect for Lovable users who want environment separation and automatic security scanning without DevOps configuration.

See [LOVABLE-WORKFLOW.md](./LOVABLE-WORKFLOW.md) for complete integration guide.

## 🤝 Contributing

Contributions are welcome! Open an issue or submit a PR.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## 📄 License

MIT License - use freely for both personal and commercial projects.

## 🆘 Support

- 📚 [Supabase Docs](https://supabase.com/docs)
- 📚 [Vite Docs](https://vitejs.dev)
- 📚 [React Docs](https://react.dev)
- 🐛 [Report Issues](https://github.com/mbjorke/vibeops-template/issues)

## 🙏 Credits

Built for vibe coders who want to focus on building, not setting up infrastructure.

---

**Made with ❤️ for the AI coding community**

[⭐ Star this repo](https://github.com/mbjorke/vibeops-template) if you find it useful!
