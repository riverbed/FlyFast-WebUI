# Build Instructions

## Environment
- Node.js: >=22.14.0
- npm: >=11.7.0
- Build tool: Vite 6
- Type-check command: npm run type-check
- Build command: npm run build

## Steps
1. Install dependencies
```bash
npm install
```

2. Validate TypeScript
```bash
npm run type-check
```
Expected: exit code 0 and no TypeScript errors.

3. Create production build
```bash
npm run build
```
Expected output includes Vite bundle summary and generated dist assets.

## Latest Verified Result (2026-03-11)
- Type-check: PASS
- Build: PASS
- Build output:
  - dist/assets/index-EK6zXTRq.js (468.63 kB, gzip 146.24 kB)
  - dist/assets/index-CzzMg1Ls.css (223.40 kB, gzip 32.24 kB)

## Troubleshooting
- If TypeScript fails: run npm run type-check and fix reported files first.
- If Vite build fails: clear node_modules and reinstall.
```bash
Remove-Item -Recurse -Force node_modules; Remove-Item -Force package-lock.json; npm install
```
