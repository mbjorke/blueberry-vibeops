# Blueberry Fintech 🫐💰

**Personal Finance Management App with VibeOps DevSecOps**

A modern fintech application built with React, TypeScript, and Supabase, enhanced with VibeOps managed DevSecOps infrastructure for secure, multi-environment deployment.

## ✨ Features

### Application Features
- 📊 **Financial Dashboard**: Real-time account overview and transaction tracking
- 💳 **Multiple Accounts**: Support for checking, savings, and credit cards
- 📈 **Spending Insights**: Visual analytics and budget tracking
- 🔔 **Smart Alerts**: Notifications for important financial events
- 🎨 **Modern UI**: Beautiful component library built with Radix UI
- 🌙 **Dark Mode**: Full dark mode support with theme toggle

### DevSecOps Features (VibeOps)
- 🔐 **Security First**: CodeQL, Dependabot, and secrets scanning built-in
- 🎨 **3 Environments**: DEV, BETA, and PROD with visual badges
- 🔄 **CI/CD**: Automatic scanning and deployment via GitHub Actions
- 📦 **Supabase-Ready**: Pre-configured with RLS policies
- 🛡️ **Compliance**: OWASP, GDPR, and SOC2 documentation

## 🎯 Environment Badges

The app shows a color-coded badge indicating which environment you're running:

| Environment | Color | Usage |
|-------------|-------|-------|
| **DEV** | 🔵 Blue | Development and rapid iteration |
| **BETA** | 🟠 Orange | Testing with real data |
| **PROD** | 🔴 Red | Live production |
| **LOCAL** | ⚫ Gray | Local development without Supabase |

## 🚀 Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
# Copy the example file
cp .env.example .env.local

# Edit .env.local with your Supabase credentials
```

**.env.local example:**
```env
VITE_SUPABASE_URL=https://your-project-dev.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_APP_ENV=DEV
```

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:8080](http://localhost:8080) - you should see the app with an environment badge in the bottom-right corner! 🎉

## 🔐 Security & Compliance

### Automatic Security Checks

Every push runs:

- ✅ **ESLint** - Code quality and best practices
- ✅ **CodeQL** - SAST (Static Application Security Testing)
- ✅ **npm audit** - Dependency vulnerability scanning
- ✅ **Gitleaks** - Secrets detection
- ✅ **Dependabot** - Automatic dependency updates

View security status: https://github.com/mbjorke/blueberry-vibeops/security

### Supabase RLS

Database migrations include Row Level Security (RLS) policies:

```bash
# Install Supabase CLI
npm install -g supabase

# Link your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

See [SECURITY.md](./SECURITY.md) for complete security documentation.

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS v4** - Styling with @tailwindcss/vite
- **Radix UI** - Accessible component primitives
- **React Router** - Navigation
- **TanStack Query** - Data fetching and caching

### Backend
- **Supabase** - PostgreSQL database, authentication, and storage
- **Row Level Security** - Database-level access control

### DevOps
- **GitHub Actions** - CI/CD and security scanning
- **Vitest** - Unit and component testing
- **Playwright** - Visual regression testing
- **Storybook** - Component documentation

## 📁 Project Structure

```
blueberry-vibeops/
├── src/
│   ├── components/
│   │   ├── fintech/           # Fintech-specific components
│   │   ├── ui/                # Reusable UI components
│   │   ├── theme/             # Theme provider & toggle
│   │   └── EnvironmentBadge.tsx # Environment indicator
│   ├── pages/
│   │   ├── Dashboard.tsx      # Main financial dashboard
│   │   └── Index.tsx          # Landing page
│   ├── lib/
│   │   ├── supabase.ts        # Supabase client with env detection
│   │   ├── utils.ts           # Utility functions
│   │   └── format-currency.ts # Currency formatting
│   ├── hooks/                 # Custom React hooks
│   ├── stories/               # Storybook stories
│   └── test/                  # Test utilities
├── supabase/
│   ├── migrations/            # Database schema with RLS
│   └── seed.sql               # Test data
├── .github/
│   └── workflows/
│       ├── ci-scan.yml        # Security scanning
│       └── deploy.yml         # Deployment previews
└── README.md                  # This file
```

## 🔧 Development

### Available Commands

```bash
npm run dev              # Start dev server (port 8080)
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Run ESLint
npm run type-check       # TypeScript type checking
npm run test             # Run unit tests
npm run test:visual      # Run Playwright tests
npm run storybook        # Start Storybook
```

### Component Development

This project uses Storybook for component development:

```bash
npm run storybook
```

Visit http://localhost:6006 to browse and develop components in isolation.

## 🚢 Deployment

### Multi-Environment Setup

1. **Create Supabase projects** for each environment:
   - `blueberry-dev` (DEV)
   - `blueberry-beta` (BETA)
   - `blueberry-prod` (PROD)

2. **Configure GitHub Secrets** for each environment:
   ```
   SUPABASE_URL_DEV
   SUPABASE_ANON_KEY_DEV
   SUPABASE_URL_BETA
   SUPABASE_ANON_KEY_BETA
   SUPABASE_URL_PROD
   SUPABASE_ANON_KEY_PROD
   ```

3. **Push to GitHub** - Actions will automatically run security scans

### Vercel Deployment (Recommended)

```bash
npm install -g vercel
vercel
```

Set environment variables in Vercel dashboard for each environment.

## 📝 Best Practices

### Environment Variables

- ✅ Use `.env.local` for local development
- ✅ Keep `.env.example` updated (without real values)
- ❌ Never commit `.env` or `.env.local` to git

### Git Workflow

```bash
main      # Production (PROD)
  ↑
develop   # Staging (BETA)
  ↑
feature/* # Development (DEV)
```

### Security

- ✅ Enable RLS on all Supabase tables
- ✅ Review security scan results on every push
- ✅ Keep dependencies updated via Dependabot
- ❌ Never expose service_role keys in frontend code

## 📚 Documentation

- [SECURITY.md](./SECURITY.md) - Security policies and compliance
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines
- [LOVABLE-WORKFLOW.md](./LOVABLE-WORKFLOW.md) - Lovable integration guide

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## 📄 License

MIT License - use freely for both personal and commercial projects.

## 🆘 Support

- 📚 [Supabase Docs](https://supabase.com/docs)
- 📚 [Vite Docs](https://vitejs.dev)
- 📚 [React Docs](https://react.dev)
- 📚 [Tailwind CSS Docs](https://tailwindcss.com)
- 🐛 [Report Issues](https://github.com/mbjorke/blueberry-vibeops/issues)

## 🙏 Credits

- **Blueberry Fintech** - Original application
- **VibeOps** - DevSecOps infrastructure ([vibeops-template](https://github.com/mbjorke/vibeops-template))

---

**Made with ❤️ for secure fintech development**

[⭐ Star this repo](https://github.com/mbjorke/blueberry-vibeops) if you find it useful!
