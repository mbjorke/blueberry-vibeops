# Contributing to VibeOps

Thank you for your interest in contributing to VibeOps! This document provides guidelines for contributing to this project.

## How to Contribute

### Reporting Bugs

If you find a bug, please open an issue with:
- Clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)
- Environment details (OS, browser, Node version)

### Suggesting Enhancements

We welcome suggestions for new features or improvements:
- Open an issue describing your idea
- Explain the use case and benefits
- Be open to discussion and feedback

### Pull Requests

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/vibeops-template.git
   cd vibeops-template
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow the existing code style
   - Add tests if applicable
   - Update documentation as needed

4. **Test your changes**
   ```bash
   npm run lint    # Check code quality
   npm run build   # Ensure it builds
   npm run dev     # Test locally
   ```

5. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

   Use conventional commit format:
   - `feat:` New feature
   - `fix:` Bug fix
   - `docs:` Documentation changes
   - `style:` Code style changes (formatting, etc.)
   - `refactor:` Code refactoring
   - `test:` Adding tests
   - `chore:` Maintenance tasks

6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Open a Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your branch
   - Fill in the PR template with details

## Development Setup

### Prerequisites

- Node.js 20+
- npm or yarn
- Git

### Setup

```bash
# Clone your fork
git clone https://github.com/yourusername/vibeops-template.git
cd vibeops-template

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Start development server
npm run dev
```

### Project Structure

```
vibeops-template/
├── src/                    # Source code
│   ├── components/         # React components
│   ├── lib/                # Libraries and utilities
│   └── utils/              # Helper functions
├── supabase/               # Database migrations
├── .github/                # GitHub Actions and config
├── public/                 # Static assets
└── tests/                  # Test files (if added)
```

## Code Style

- Use TypeScript for type safety
- Follow ESLint rules (run `npm run lint`)
- Use Prettier for formatting (configure in your editor)
- Write clear, descriptive variable and function names
- Add comments for complex logic

## Testing

Currently, the project uses:
- ESLint for code quality
- TypeScript for type checking
- Build process for integration testing

Future additions may include:
- Unit tests (Vitest)
- E2E tests (Playwright)

## Documentation

When adding features:
- Update README.md if user-facing
- Add JSDoc comments for functions
- Update SECURITY.md for security-related changes
- Create migration files for database changes

## Security

- Never commit secrets or credentials
- Test security features locally
- Follow OWASP best practices
- Report vulnerabilities privately (see SECURITY.md)

## Community Guidelines

- Be respectful and inclusive
- Provide constructive feedback
- Help others when possible
- Keep discussions focused and professional

## Questions?

- Open an issue for questions
- Join discussions in existing issues
- Check README.md and SECURITY.md first

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to VibeOps! Your efforts help make this project better for everyone.
