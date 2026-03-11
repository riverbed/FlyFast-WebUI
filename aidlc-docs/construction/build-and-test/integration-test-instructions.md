# Integration Test Instructions

## Scope
Integration coverage validates cross-component behavior for search, cart, checkout, and routing.

## Existing Integration Test
- File: src/integration/SearchResultsCheckout.integration.test.tsx
- Latest result (2026-03-11): PASS (2 tests)

## Run Integration Tests
```bash
npm test -- src/integration/SearchResultsCheckout.integration.test.tsx
```

## Recommended Additional Integration Scenarios
1. Route tracing lifecycle on navigation (open/close route spans).
2. Service operation spans linked to route span context.
3. Web vitals attributes attached to active route span.
4. Checkout flow with cart persistence across route transitions.
