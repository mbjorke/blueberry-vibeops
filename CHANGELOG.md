# Changelog

All notable changes to VibeOps will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-21

### Added
- Initial release of VibeOps template
- React 19 + TypeScript + Vite setup
- Tailwind CSS v4 with PostCSS configuration
- Supabase client with environment-based configuration
- Environment Badge component (DEV/BETA/PROD/LOCAL)
- **Production-ready landing page** with:
  - Hero section with gradient and CTA
  - Feature showcase (6 key features)
  - Environment badges showcase
  - Quick start guide
  - Tech stack display
  - Responsive footer
- GitHub Actions workflows:
  - CI & Security Scan (CodeQL, Dependabot, Gitleaks)
  - Deploy Preview (Vercel integration)
- Supabase migrations with RLS examples
- Comprehensive README with 5-minute onboarding
- SECURITY.md with security guidelines
- CONTRIBUTING.md for contributors
- Dependabot configuration
- GitHub issue templates (bug report, feature request)
- Pull request template
- VS Code configuration and recommended extensions
- .env.example for environment variables
- Complete .gitignore for security
- MIT License
- CHANGELOG.md for version tracking

### Security
- Row Level Security (RLS) enabled by default
- Secrets detection with Gitleaks
- Dependency vulnerability scanning
- CodeQL static analysis
- No secrets committed to repository

[1.0.0]: https://github.com/yourusername/vibeops-template/releases/tag/v1.0.0
