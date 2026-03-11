# Unit Test Instructions

## Test Runner
- Framework: Vitest
- All tests: npm test
- Coverage: npm run test:coverage
- Single file pattern:
```bash
npm test -- src/services/__tests__/RouteTracing.test.ts
```

## Latest Full Suite Result (2026-03-11)
- Command: npm test
- Result: PASS
- Summary: 29 passed files, 0 failed files; 130 passed tests, 0 failed tests.

## Regression Status
- No failing test files in the latest full-suite run.
- Previously failing suites fixed:
  1. src/services/__tests__/CustomTracing.test.ts
  2. src/services/__tests__/Flight.test.ts

## Fix Notes (Applied)
- CustomTracing tests now use valid span mock shapes and await rejection paths correctly.
- Flight tests now mock fetch responses with `ok`, `status`, and `statusText` for instrumented error handling.

## Focused Validation for Unit 2
```bash
npm test -- src/services/__tests__/RouteTracing.test.ts src/components/ApplicationContainer/ApplicationContainer.test.tsx
```
Expected: both files pass.
