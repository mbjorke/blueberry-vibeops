# TODO / Technical Debt

## Security & Dependencies

### ⚠️ Vite Upgrade (Moderate Priority)
- **Issue**: esbuild vulnerability in dev environment
- **Action**: Upgrade Vite 5.4.19 → 7.3.1+
- **Status**: Deferred
- **Details**: See `.github/ISSUE_TEMPLATE/vite_upgrade.md`
- **Impact**: Dev-only, not production-critical

## Future Enhancements

### Test Infrastructure
- [ ] Add integration tests using real test users (testAuth.ts helpers)
- [ ] Consider E2E tests with Playwright using test users
- [ ] Document integration test patterns

### Documentation
- [ ] Update TESTING.md with integration test examples
- [ ] Add migration guide for Vite 7 when upgrading

---

*Last updated: 2026-01-25*
