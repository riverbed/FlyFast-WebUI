# TypeScript Validation Guide - Unit 1

## Validate Compiler Integration

```bash
npm run type-check
```

Expected result:
- Command exits successfully.
- `src/services/Functions.ts` is recognized and type-checked.

## Validate Build Integration

```bash
npm run build
```

Expected result:
- CRA build succeeds.
- TypeScript file compiles in mixed JS/TS project.

## Validate IDE Experience
- Open `src/services/Functions.ts`.
- Confirm parameter and return type hints appear.
- Introduce a temporary type mismatch and verify diagnostics appear.

## Troubleshooting
- If TypeScript is missing, run `npm install --legacy-peer-deps`.
- If type-check script is not found, verify scripts in `package.json`.
