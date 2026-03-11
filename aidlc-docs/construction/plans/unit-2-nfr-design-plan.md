# Unit 2 NFR Design Plan - Route-Level Instrumentation

## Unit Context
**Unit 2**: Route-Level Span Instrumentation & Business Operations Tracing
**Stage**: NFR Design
**Date**: 2026-03-11
**Input**: Approved NFR Requirements (nfr-requirements.md, tech-stack-decisions.md)

---

## NFR Design Checklist

- [x] **Step 1**: Analyze NFR requirements and tech stack decisions
- [x] **Step 2**: Identify design patterns needed (no questions required - NFR is specific)
- [x] **Step 3**: Define logical components and responsibilities
- [x] **Step 4**: Generate nfr-design-patterns.md
- [x] **Step 5**: Generate logical-components.md
- [x] **Step 6**: Present for approval

---

## Design Patterns Identified

From NFR requirements analysis, 7 design patterns are needed:

1. **Module-Scope Span Registry** - Exported mutable ref for currentRouteSpan cross-component access
2. **Hook-Based Lifecycle Management** - useEffect with cleanup for span start/end tied to React lifecycle
3. **History API Delegation** - Monkey-patch pushState with cleanup to capture non-Router navigations
4. **Late-Attribute Injection** - Vitals arrive post-render; inject onto stale span ref via module scope
5. **Context Propagation Bridge** - Wrap service calls in context.with(parentCtx) to establish parent-child
6. **Blacklist Filter Chain** - Extend Unit 1 sanitization with key blacklist + value regex applied to errors
7. **Graceful No-Op Degradation** - All instrumentation degrades silently if bootstrap tracer is no-op

---

## Logical Components Identified

6 logical components, mapping to concrete files:

1. **Route Span Controller** - src/services/RouteTracing.ts (new)
2. **History Instrumentation Layer** - useHistoryTracing hook in RouteTracing.ts
3. **Web Vitals Bridge** - src/reportWebVitals.ts (modified)
4. **Service Operation Wrappers** - src/services/Flight.ts + src/services/Context.tsx (modified)
5. **PII Filter Extension** - src/services/CustomTracing.ts (modified)
6. **Route-Aware App Shell** - src/components/ApplicationContainer/ApplicationContainer.tsx (modified)

---

**Document Version**: 1.0
**Created**: 2026-03-11
