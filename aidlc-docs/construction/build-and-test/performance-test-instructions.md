# Performance Test Instructions

## Current Build Metrics (2026-03-11)
- Main JS bundle: 468.63 kB (gzip 146.24 kB)
- Main CSS bundle: 223.40 kB (gzip 32.24 kB)
- Build time: ~6.5s

## Commands
1. Build for production
```bash
npm run build
```

2. Preview production bundle
```bash
npm run preview
```

3. Optional coverage and runtime checks
```bash
npm run test:coverage
```

## Manual Checks
- Verify route transitions remain responsive.
- Verify search and checkout flows remain interactive under normal load.
- Verify no console errors during tracing instrumentation paths.
- Verify web-vitals attributes are attached to route spans when tracing is enabled.
