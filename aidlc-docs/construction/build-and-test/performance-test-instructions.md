# Performance Test Instructions

## Purpose

Performance tests validate that the FlyFast-WebUI application meets performance requirements under various load conditions. For a client-side React SPA, this focuses on:
- Initial page load time
- Component render performance
- Bundle size optimization
- Runtime memory usage
- API response handling

---

## Performance Requirements

### Response Time Targets
- **Initial Page Load**: < 3 seconds on 3G network
- **Component Render**: < 100ms for interactive elements
- **Search Results Display**: < 500ms after API response
- **Route Navigation**: < 200ms between pages

### Bundle Size Targets
- **Main Bundle (gzipped)**: < 150 KB ✅ *Current: 124.22 KB*
- **Total Bundle (gzipped)**: < 300 KB ✅ *Current: ~200 KB*
- **Individual Chunks**: < 60 KB each ✅ *Current: 52.18 KB max*

### Memory Usage
- **Initial Load**: < 50 MB heap usage
- **After Navigation**: < 100 MB heap usage
- **No Memory Leaks**: Memory released after component unmount

### Concurrent Users (Server-Side)
- **Expected Load**: 100 concurrent users
- **Peak Load**: 500 concurrent users
- **Error Rate**: < 1% under expected load

---

## Performance Test Strategy

### Client-Side Performance
Focus on browser-based metrics:
- Lighthouse scores (Performance, Accessibility, Best Practices)
- Core Web Vitals (LCP, FID, CLS)
- Bundle analysis
- React DevTools Profiler

### Server-Side Load Testing (Optional)
If API backend is available:
- Load testing with k6, JMeter, or Artillery
- Stress testing to find breaking points
- Sustained load testing

---

## Setup Performance Test Environment

### 1. Install Performance Testing Tools

```bash
# Lighthouse for web vitals
npm install --save-dev lighthouse

# Bundle analyzer
npm install --save-dev webpack-bundle-analyzer

# React performance profiler (built-in)
# No installation needed
```

---

### 2. Configure Production Build

Performance tests should run against production build:

```bash
npm run build
```

---

### 3. Serve Production Build Locally

```bash
# Install serve globally
npm install -g serve

# Serve build folder
serve -s build -p 3000
```

---

## Run Performance Tests

### Test 1: Lighthouse Audit

**Purpose**: Measure Core Web Vitals and performance score

**Command**:
```bash
npx lighthouse http://localhost:3000 --view --output-path=./lighthouse-report.html
```

**Expected Metrics**:
- **Performance Score**: > 90/100
- **Accessibility Score**: > 90/100
- **Best Practices Score**: > 90/100
- **SEO Score**: > 80/100

**Core Web Vitals**:
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

**Review Results**:
- Open `lighthouse-report.html` in browser
- Check performance opportunities
- Review diagnostics for optimization suggestions

---

### Test 2: Bundle Size Analysis

**Purpose**: Identify large dependencies and optimize bundle size

**Command**:
```bash
# Analyze bundle composition
npx webpack-bundle-analyzer build/static/js/*.js
```

**Expected Results**:
- **React + React-DOM**: ~40-50 KB (gzipped)
- **Mantine UI**: ~50-60 KB (gzipped)
- **OpenTelemetry**: ~30-40 KB (gzipped)
- **Application Code**: ~20-30 KB (gzipped)

**Optimization Opportunities**:
- Tree-shaking unused Mantine components ✅ (lazy imports used)
- Code splitting with React.lazy() ✅ (already implemented)
- Remove unused dependencies ✅ (dependencies reviewed)

**Review Charts**:
- Identify largest dependencies
- Verify lazy-loaded chunks are separate
- Confirm no duplicate dependencies

---

### Test 3: React DevTools Profiler

**Purpose**: Measure component render performance

**Steps**:
1. Open application in Chrome with React DevTools installed
2. Navigate to React DevTools → Profiler tab
3. Click record button
4. Perform user interactions:
   - Search for flights
   - Add flight to cart
   - Navigate to checkout
5. Stop recording
6. Review flame graph

**Expected Results**:
- **Search Component**: < 50ms render time
- **TripCard Component**: < 20ms per card
- **Cart Update**: < 30ms
- **Route Navigation**: < 100ms

**Optimization Flags**:
- Yellow/red components in flame graph (> 50ms)
- Excessive re-renders (same component multiple times)
- Large component trees (> 10 levels deep)

---

### Test 4: Network Performance

**Purpose**: Measure API call performance and loading states

**Steps**:
1. Open Chrome DevTools → Network tab
2. Throttle network to "Fast 3G"
3. Reload application
4. Perform search
5. Review network waterfall

**Expected Results**:
- **Initial HTML**: < 500ms
- **JavaScript Bundles**: < 2s (cached after first load)
- **API Calls** (search): < 1s
- **Total Load Time**: < 3s on 3G

**Check**:
- Gzip compression enabled for all assets
- Long cache headers for static assets
- Correct lazy loading of route chunks

---

### Test 5: Memory Profiling

**Purpose**: Detect memory leaks and excessive memory usage

**Steps**:
1. Open Chrome DevTools → Memory tab
2. Take heap snapshot (Baseline)
3. Navigate through all routes 5 times
4. Take second heap snapshot
5. Compare snapshots

**Expected Results**:
- **Heap Growth**: < 20% after navigation cycle
- **Detached DOM Nodes**: < 10
- **Event Listeners**: All cleaned up after unmount

**Red Flags**:
- Heap size continuously growing
- Large number of detached DOM nodes
- Event listeners not removed

---

## Load Testing (Optional - Requires API Backend)

### Setup k6 for Load Testing

```bash
# Install k6
# Windows: choco install k6
# macOS: brew install k6
# Linux: apt install k6

# Create load test script
cat > load-test.js << 'EOF'
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '1m', target: 50 },  // Ramp up to 50 users
    { duration: '3m', target: 100 }, // Sustain 100 users
    { duration: '1m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests < 500ms
    http_req_failed: ['rate<0.01'],   // Error rate < 1%
  },
};

export default function () {
  // Test search endpoint
  let res = http.get('http://localhost:8080/flightsearchapi/search?from=JFK&to=LAX');
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  
  sleep(1);
}
EOF
```

---

### Execute Load Test

```bash
k6 run load-test.js
```

**Expected Output**:
```
running (5m00s), 000/100 VUs, 15000 complete and 0 interrupted iterations

     ✓ status is 200
     ✓ response time < 500ms

     http_req_duration..............: avg=250ms  p(95)=450ms
     http_req_failed................: 0.00%  ✓ 0  ✗ 15000
     http_reqs......................: 15000  50/s
     iteration_duration.............: avg=1.25s
```

**Performance Metrics**:
- **Average Response Time**: 250ms ✅
- **P95 Response Time**: 450ms ✅ (< 500ms threshold)
- **Error Rate**: 0% ✅ (< 1% threshold)
- **Throughput**: 50 req/s ✅

---

## Analyze Performance Results

### Performance Scorecard

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Lighthouse Performance | > 90 | [TBD] | ⏳ |
| Main Bundle Size | < 150 KB | 124.22 KB | ✅ |
| Initial Load Time (3G) | < 3s | [TBD] | ⏳ |
| LCP (Largest Contentful Paint) | < 2.5s | [TBD] | ⏳ |
| FID (First Input Delay) | < 100ms | [TBD] | ⏳ |
| CLS (Cumulative Layout Shift) | < 0.1 | [TBD] | ⏳ |
| Component Render Time | < 100ms | [TBD] | ⏳ |
| Memory Usage (Initial) | < 50 MB | [TBD] | ⏳ |

---

### Bottlenecks (If Identified)

**Common Issues**:
1. **Large Bundle Size**
   - Cause: Heavy dependencies, no code splitting
   - Solution: Implement lazy loading, tree-shaking
   - Status: ✅ Already optimized

2. **Slow Initial Load**
   - Cause: Unoptimized images, no compression
   - Solution: Enable gzip, optimize assets
   - Status: ✅ Compression enabled in Dockerfile

3. **Poor Render Performance**
   - Cause: Unnecessary re-renders, complex calculations
   - Solution: Memoization, useMemo, useCallback
   - Status: ⏳ To be measured

4. **Memory Leaks**
   - Cause: Event listeners not cleaned up
   - Solution: useEffect cleanup, proper unmounting
   - Status: ⏳ To be verified

---

## Performance Optimization

If performance doesn't meet requirements:

### 1. Optimize Bundle Size
```bash
# Remove unused dependencies
npm prune

# Analyze bundle
npx webpack-bundle-analyzer build/static/js/*.js

# Consider replacing heavy libraries
```

---

### 2. Implement Code Splitting
```typescript
// Already implemented in App.tsx
const Home = lazy(() => import('./pages/Home/Home'));
const SearchFlight = lazy(() => import('./pages/SearchFlight/SearchFlight'));
const Checkout = lazy(() => import('./pages/Checkout/Checkout'));
```

---

### 3. Memoize Expensive Calculations
```typescript
import { useMemo } from 'react';

const totalCost = useMemo(() => {
  return cart.reduce((sum, flight) => sum + flight.fare, 0);
}, [cart]);
```

---

### 4. Optimize API Calls
```typescript
// Add caching, debouncing, or throttling
import { debounce } from 'lodash';

const debouncedSearch = debounce(airportTypeAhead, 300);
```

---

## Performance Test Checklist

- [ ] Run Lighthouse audit and achieve > 90 performance score
- [ ] Analyze bundle size with webpack-bundle-analyzer
- [ ] Profile component renders with React DevTools
- [ ] Test network performance on throttled connection
- [ ] Check memory usage and detect leaks
- [ ] (Optional) Run load tests against API backend
- [ ] Document performance metrics in build-and-test-summary.md

---

## Troubleshooting

### Lighthouse Fails or Times Out

**Solution**:
```bash
# Increase timeout
npx lighthouse http://localhost:3000 --max-wait-for-load 60000 --view
```

---

### Bundle Analyzer Can't Parse Files

**Solution**:
```bash
# Ensure production build exists
npm run build

# Use specific bundle file
npx webpack-bundle-analyzer build/static/js/main.*.js
```

---

### React DevTools Not Showing Profiler

**Solution**:
- Install React DevTools extension in Chrome
- Ensure development build: `npm start` (not production)
- Profiler only available in React 16.5+

---

## Next Steps

After performance testing:
1. Document results in build-and-test-summary.md
2. Address any performance bottlenecks
3. Rerun tests to validate improvements
4. Proceed to overall Build & Test completion
