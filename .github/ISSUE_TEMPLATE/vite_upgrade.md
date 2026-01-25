# Upgrade Vite to v7.x

## Summary

Upgrade Vite from v5.4.19 to v7.3.1+ to address security vulnerabilities in esbuild dependency.

## Security Issue

- **Severity**: Moderate
- **Package**: esbuild <=0.24.2
- **Issue**: Enables any website to send requests to the development server and read the response
- **Reference**: https://github.com/advisories/GHSA-67mh-4wv8-2f99
- **Impact**: Development environment only (not production)

## Current State

- **Current Version**: Vite 5.4.19
- **Target Version**: Vite 7.3.1+
- **Breaking Changes**: Yes (major version upgrade)

## Migration Steps

1. Review Vite 7 migration guide: https://main.vite.dev/guide/migration
2. Check breaking changes: https://vite.dev/changes/
3. Update `package.json`:
   ```json
   "vite": "^7.3.1"
   ```
4. Update `@vitejs/plugin-react-swc` if needed
5. Test configuration changes:
   - Default browser target changed (Chrome 107→111, Firefox 104→114, Safari 16.0→16.4)
   - Review any custom build targets
6. Test all build commands:
   - `npm run dev`
   - `npm run build`
   - `npm run preview`
7. Verify tests still pass: `npm test`
8. Check for any plugin compatibility issues

## Breaking Changes to Watch

- Default `build.target` updated to Baseline Widely Available (2026-01-01)
- Potential plugin API changes
- HMR behavior changes

## Testing Checklist

- [ ] Dev server starts correctly
- [ ] Hot module replacement works
- [ ] Production build succeeds
- [ ] Preview server works
- [ ] All tests pass
- [ ] No console warnings/errors
- [ ] Browser compatibility verified

## Related Files

- `package.json` - Update vite version
- `vite.config.ts` - May need config updates
- `package-lock.json` - Will update automatically

## Priority

**Low-Medium** - Dev-only vulnerability, not urgent but should be addressed

## Notes

- This is a development-time vulnerability only
- Production builds are not affected
- Can be deferred but should be done before next major release cycle
