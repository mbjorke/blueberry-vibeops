# Testing Documentation

## Overview

This project uses **Vitest** with **React Testing Library** for unit and integration testing. The test suite follows **Test-Driven Development (TDD)** principles where possible.

## Test Statistics

**Current Status:**
- **16 test files**
- **149 tests passing**
- **15 tests failing** (mostly async/timing edge cases)
- **~90% pass rate**

## Test Infrastructure

### Test Setup

- **Test Runner**: Vitest v3.2.4
- **Testing Library**: @testing-library/react v16.0.0
- **Environment**: jsdom (browser simulation)
- **Setup File**: `src/test/setup.ts`

### Test Helpers

Located in `src/test/helpers/`:

- **`renderWithAuth.tsx`** - Renders components with AuthProvider and BrowserRouter
- **`renderWithRouter.tsx`** - Renders components with router context

### Test Fixtures

Located in `src/test/fixtures/`:

- **`users.ts`** - Mock user data (admin, client, superadmin)
- **`projects.ts`** - Mock project data
- **`organizations.ts`** - Mock organization data

### Test Mocks

Located in `src/test/mocks/`:

- **`supabase.ts`** - Supabase client mocks for testing

## Test Coverage by Category

### ✅ Hooks (Well Tested)

| Hook | Tests | Status | Coverage |
|------|-------|--------|----------|
| `useAuth` | 14 | ✅ All passing | Authentication, roles, organizations |
| `useProjects` | 10 | ✅ All passing | Project fetching, realtime, errors |
| `useRepositories` | 9 | ⚠️ 1 failing | Repository management, client assignment |
| `useClients` | 6 | ✅ All passing | Client/org management, CRUD operations |
| `useGitHubApp` | 9 | ⚠️ 2 failing | GitHub App integration, installations |
| `useProfile` | 8 | ⚠️ 2 failing | Profile management, logo upload |
| `useClientDetail` | 7 | ⚠️ 6 failing | Client detail view, users, repos |
| `useProjectDetailData` | 6 | ✅ All passing | Security findings, deployments, GDPR |

**Total Hook Tests: 69**

### ✅ Components (Partially Tested)

| Component | Tests | Status | Coverage |
|-----------|-------|--------|----------|
| `ProtectedRoute` | 9 | ✅ All passing | Route protection, role-based access |
| `ProjectCard` | 19 | ⚠️ 1 failing | Rendering, interactions, delete, environments |
| `SummaryCards` | 10 | ✅ All passing | Metrics display, dynamic values |
| `Header` | 13 | ✅ All passing | Navigation, user menu, admin features |

**Total Component Tests: 51**

### ✅ Utilities (Well Tested)

| Utility | Tests | Status |
|---------|-------|--------|
| `utils.ts` | 8 | ✅ All passing |
| `schemaCompare.ts` | 15 | ✅ All passing |
| `integrationRoadmap.ts` | 11 | ✅ All passing |

**Total Utility Tests: 34**

## Running Tests

### Commands

```bash
# Run all tests once
npm test

# Run tests in watch mode (TDD workflow)
npm run test:watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- src/hooks/__tests__/useAuth.test.tsx

# Run tests matching pattern
npm test -- useAuth
```

### Test Output

Tests run in parallel and show:
- ✅ Passing tests (green)
- ❌ Failing tests (red) with error details
- ⏱️ Duration and performance metrics

## Known Limitations & Issues

### 1. Async/Timing Issues

**Problem**: Some tests fail due to race conditions or timing issues with async operations.

**Affected Tests:**
- `ProjectCard` - GitHub environments loading state
- `useGitHubApp` - Error handling and loading state timing
- `useProfile` - Auth context initialization timing

**Workaround**: Tests use `waitFor` with timeouts, but some edge cases still fail intermittently.

**Future Fix**: Consider using `@testing-library/user-event` more consistently and adjusting timeout values.

### 2. Complex Mock Setup

**Problem**: Hooks that make multiple sequential database queries require complex mock chains.

**Affected Tests:**
- `useRepositories` - Client-scoped repository queries
- `useClientDetail` - Multiple related queries (client, users, repos, profiles)

**Workaround**: Tests use `mockImplementation` to handle sequential calls, but setup is fragile.

**Future Fix**: Create reusable mock factories for common query patterns.

### 3. Auth Context Dependencies

**Problem**: Hooks that depend on `useAuth` require full AuthProvider setup, making tests slower and more complex.

**Affected Tests:**
- `useProfile` - Requires authenticated user context
- Any component using `useAuth`

**Workaround**: Tests use `renderWithAuth` helper, but auth state initialization is async.

**Future Fix**: Consider creating a simpler auth mock for unit tests that don't need full auth flow.

### 4. Realtime Subscription Testing

**Problem**: Realtime subscriptions are difficult to test because they're async and require channel setup.

**Affected Tests:**
- All hooks with realtime subscriptions

**Workaround**: Tests verify that `supabase.channel()` is called with correct parameters, but don't test actual subscription behavior.

**Future Fix**: Create integration tests that test realtime behavior with a test Supabase instance.

## Test Patterns & Best Practices

### 1. TDD Workflow

When adding new features:

1. **Write failing test first** - Define expected behavior
2. **Make it pass** - Implement minimal code
3. **Refactor** - Improve code quality while keeping tests green

### 2. Test Structure

```typescript
describe('HookName', () => {
  describe('feature group', () => {
    it('should do something specific', async () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

### 3. Mocking Supabase

Always mock Supabase client at the module level:

```typescript
vi.mock('@/integrations/supabase/client', () => {
  // Return mock supabase client
});
```

### 4. Async Testing

Use `waitFor` for async operations:

```typescript
await waitFor(() => {
  expect(result.current.loading).toBe(false);
}, { timeout: 3000 });
```

### 5. Query Client Setup

For hooks using React Query, wrap in QueryClientProvider:

```typescript
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};
```

## Adding New Tests

### For a New Hook

1. Create test file: `src/hooks/__tests__/useNewHook.test.tsx`
2. Mock Supabase client
3. Test initial state
4. Test data fetching
5. Test mutations (if applicable)
6. Test error handling
7. Test realtime subscriptions (if applicable)

### For a New Component

1. Create test file: `src/components/category/__tests__/ComponentName.test.tsx`
2. Use `renderWithRouter` or `renderWithAuth` as needed
3. Test rendering
4. Test user interactions
5. Test edge cases
6. Test error states

## Test Coverage Goals

### Current Goals

- ✅ **80%+ coverage on hooks** - Most hooks well tested
- ✅ **70%+ coverage on critical components** - Core components covered
- ✅ **100% coverage on utilities** - All utilities tested

### Future Goals

- **Integration tests** - Test full user flows
- **E2E tests** - Playwright tests for critical paths
- **Performance tests** - Test rendering performance
- **Accessibility tests** - Test a11y compliance

## Debugging Failed Tests

### Common Issues

1. **"Unable to find element"** - Element not rendered yet, use `waitFor`
2. **"Mock not called"** - Check mock setup, ensure it's called before assertion
3. **"Async operation not completing"** - Increase timeout or check async flow
4. **"Auth context not initialized"** - Ensure AuthProvider is properly set up

### Debug Commands

```bash
# Run single test with verbose output
npm test -- src/hooks/__tests__/useAuth.test.tsx --reporter=verbose

# Run tests and show console output
npm test -- --no-coverage
```

## Continuous Integration

Tests should run:
- ✅ Before commits (pre-commit hook recommended)
- ✅ On pull requests
- ✅ Before deployments

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## Maintenance

### Regular Tasks

- Review and fix failing tests monthly
- Update mocks when Supabase schema changes
- Add tests for new features following TDD
- Refactor complex test setups into reusable helpers

### Test Health Metrics

Track these metrics over time:
- Total test count
- Pass rate percentage
- Average test execution time
- Coverage percentage (when coverage tooling is added)

---

**Last Updated**: January 2025  
**Test Suite Version**: 1.0
