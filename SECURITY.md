# Security Policy

## 🔐 Security Overview

VibeOps takes security seriously. This document outlines our security practices and how to report vulnerabilities.

## Supported Versions

We release security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| Latest  | :white_check_mark: |

## Built-in Security Features

### 1. Automated Security Scanning

Every push and pull request triggers:

- **CodeQL Analysis**: Static application security testing (SAST)
- **Dependency Scanning**: Vulnerability detection in npm packages
- **Secrets Detection**: Gitleaks scans for exposed credentials
- **Dependabot**: Automatic security updates

### 2. Supabase Security

- **Row Level Security (RLS)**: Enabled by default on all tables
- **API Key Management**: Anon key safe for frontend, service key never exposed
- **Authentication**: Built-in JWT-based auth with Supabase Auth

### 3. Environment Isolation

- **Separate databases**: DEV, BETA, and PROD use isolated Supabase projects
- **Environment variables**: Secrets never committed to version control
- **`.gitignore`**: Pre-configured to exclude sensitive files

## Security Best Practices

### Environment Variables

✅ **DO:**
- Store secrets in `.env.local` (gitignored)
- Use different credentials for DEV/BETA/PROD
- Rotate API keys regularly
- Use GitHub Secrets for CI/CD variables

❌ **DON'T:**
- Commit `.env` files to git
- Hardcode secrets in source code
- Share production credentials
- Use production keys in development

### Supabase RLS Policies

Always enable Row Level Security on all tables:

```sql
-- Enable RLS
ALTER TABLE your_table ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can only view their own data"
  ON your_table FOR SELECT
  USING (auth.uid() = user_id);
```

### API Security

✅ **DO:**
- Use `anon` key for frontend (public)
- Keep `service_role` key secret (backend only)
- Validate all user input
- Sanitize data before display

❌ **DON'T:**
- Expose `service_role` key in frontend
- Trust user input without validation
- Skip RLS policies
- Bypass authentication checks

### Dependencies

✅ **DO:**
- Run `npm audit` regularly
- Keep dependencies updated
- Review Dependabot PRs promptly
- Use exact versions for critical packages

❌ **DON'T:**
- Ignore security warnings
- Use packages with known vulnerabilities
- Install untrusted packages

## GitHub Security Configuration

### Enable Security Features

1. Go to **Settings** → **Security & analysis**
2. Enable:
   - Dependabot alerts
   - Dependabot security updates
   - Code scanning (CodeQL)
   - Secret scanning

### Required GitHub Secrets

For full CI/CD functionality, add these secrets:

```
VITE_SUPABASE_URL_DEV       # DEV environment Supabase URL
VITE_SUPABASE_ANON_KEY_DEV  # DEV environment anon key
VITE_SUPABASE_URL_BETA      # BETA environment Supabase URL
VITE_SUPABASE_ANON_KEY_BETA # BETA environment anon key
VITE_SUPABASE_URL_PROD      # PROD environment Supabase URL
VITE_SUPABASE_ANON_KEY_PROD # PROD environment anon key
VERCEL_TOKEN                # (Optional) For deploy previews
VERCEL_ORG_ID               # (Optional) For deploy previews
VERCEL_PROJECT_ID           # (Optional) For deploy previews
```

## Reporting a Vulnerability

If you discover a security vulnerability, please follow these steps:

### 1. **Do NOT** Open a Public Issue

Security vulnerabilities should not be disclosed publicly until fixed.

### 2. Report Privately

Send details to: **[your-security-email@domain.com]**

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### 3. Response Time

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Varies by severity

## Security Update Process

1. **Vulnerability Reported** → We acknowledge receipt
2. **Investigation** → We verify and assess severity
3. **Fix Development** → We develop and test a patch
4. **Release** → We deploy the fix and notify users
5. **Disclosure** → After fix is deployed, we publish details

## Severity Levels

| Level | Description | Response Time |
|-------|-------------|---------------|
| 🔴 **Critical** | Remote code execution, data breach | 24 hours |
| 🟠 **High** | Authentication bypass, privilege escalation | 3 days |
| 🟡 **Medium** | XSS, CSRF, information disclosure | 7 days |
| 🟢 **Low** | Minor issues, best practice improvements | 30 days |

## Security Checklist

Before deploying to production:

- [ ] All Supabase tables have RLS enabled
- [ ] Service role key is never exposed in frontend
- [ ] Environment variables are properly configured
- [ ] `npm audit` shows no high/critical vulnerabilities
- [ ] CodeQL analysis passes
- [ ] Secrets scanning passes
- [ ] Authentication is properly implemented
- [ ] User input is validated and sanitized
- [ ] HTTPS is enforced
- [ ] CORS is properly configured

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security](https://supabase.com/docs/guides/platform/security)
- [GitHub Security Best Practices](https://docs.github.com/en/code-security)
- [npm Security Best Practices](https://docs.npmjs.com/packages-and-modules/securing-your-code)

## License

This security policy is part of the VibeOps template and follows the MIT License.

---

**Last Updated**: 2026-01-21

For general questions, open an issue on GitHub. For security concerns, email us directly.
