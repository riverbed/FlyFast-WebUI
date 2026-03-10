# Execution Plan  Vite Migration Cycle

## Detailed Analysis Summary

### Transformation Scope
- **Transformation Type**: Toolchain + multi-framework major-version migration (brownfield)
- **Primary Changes**: Build tool replacement (react-scripts  Vite/Vitest), dependency major-version upgrades
- **Related Components**: All source files, package.json, tsconfig.json, Dockerfile, public/index.html, setupProxy files

### Change Impact Assessment
- **User-facing changes**: No (UI preserved, routing behavior preserved)
- **Structural changes**: Yes  build entry point, env-var prefix, proxy configuration
- **Data model changes**: No
- **API changes**: Yes  React Router 7 import paths, Mantine 8.x component API, React 19 patterns, OTel 2.6 API
- **NFR impact**: Yes  build speed improved, testability improved with Vitest

### Risk Assessment
- **Risk Level**: Medium-High
- **Rationale**: Three simultaneous major-version library upgrades plus full toolchain swap. Each is proven independently but the combination requires careful ordering and validation.
- **Rollback Complexity**: Moderate (git revert, npm install)
- **Testing Complexity**: Moderate (type-check + vitest + build as gate)

---

## Stage Execution Decisions

| Stage | Decision | Reason |
|-------|----------|--------|
| Workspace Detection | COMPLETED | Existing project confirmed |
| Reverse Engineering | SKIPPED | Artifacts exist from prior cycle |
| Requirements Analysis | COMPLETED | This cycle |
| User Stories | SKIPPED | Pure technical migration, no user-facing changes |
| Workflow Planning | IN PROGRESS | This document |
| Application Design | SKIPPED | No new components or architecture |
| Units Generation | EXECUTE | 3 units with distinct concerns need definition |
| Functional Design (all units) | SKIPPED | No new business logic |
| NFR Requirements (all units) | SKIPPED | NFRs fully captured in requirements document |
| NFR Design (all units) | SKIPPED | No new patterns to design |
| Infrastructure Design (all units) | SKIPPED | No infrastructure changes |
| Code Generation (per unit) | EXECUTE | Core delivery stage |
| Build and Test | EXECUTE | Validation gate required |

---

## Proposed Unit Breakdown

### Unit 1  Toolchain & Dependencies
**Scope**: Replace build/test toolchain and update all dependency versions

Deliverables:
- package.json: all dependency version pins (React 19.2, Mantine 8.3 family, React Router 7, OTel 2.6, etc.), react-scripts removed, Vite/Vitest added
- .npmrc: legacy-peer-deps removed
- package.json: installConfig.legacyPeerDeps removed, scripts updated to Vite/Vitest commands
- vite.config.ts: dev server, proxy (replacing setupProxy.js), build config
- vitest.config.ts (or inline in vite.config.ts): Vitest setup
- index.html: updated to Vite entry point expectations (root-level, script type=module)
- tsconfig.json: updated for Vite/Vitest compatibility
- setupProxy.js/ts: removed (proxy moved to Vite config)

### Unit 2  Application Code Migration
**Scope**: Update source code for React 19, React Router 7, and OpenTelemetry 2.6 breaking changes

Deliverables:
- All routing files: react-router-dom imports migrated to react-router
- React 19 API updates across components (ref patterns, act() etc.)
- OpenTelemetry 2.6 API updates in Tracing.ts and CustomTracing.ts
- Test setup files updated for Vitest (setupTests.ts, App.test.tsx)
- Any env-var references: REACT_APP_*  VITE_*

### Unit 3  Mantine 8.x Migration
**Scope**: Update all Mantine component usage from 7.x API to 8.x API

Deliverables:
- All components using Mantine updated to 8.x API
- Theme/provider changes
- Deprecated props/components replaced
- Dockerfile build stage verified and updated if needed
- README.md updated with new commands

---

## Workflow Visualization

### Mermaid Diagram

```mermaid
flowchart TD
    Start(["User Request"])

    subgraph INCEPTION["INCEPTION PHASE"]
        WD["Workspace Detection - COMPLETED"]
        RE["Reverse Engineering - SKIPPED"]
        RA["Requirements Analysis - COMPLETED"]
        US["User Stories - SKIPPED"]
        WP["Workflow Planning - COMPLETED"]
        AD["Application Design - SKIPPED"]
        UG["Units Generation - EXECUTE"]
    end

    subgraph CONSTRUCTION["CONSTRUCTION PHASE"]
        CG1["Unit 1 Code Generation<br/>Toolchain and Dependencies"]
        CG2["Unit 2 Code Generation<br/>React 19 / Router 7 / OTel 2.6"]
        CG3["Unit 3 Code Generation<br/>Mantine 8.x Migration"]
        BT["Build and Test - EXECUTE"]
    end

    subgraph OPERATIONS["OPERATIONS PHASE"]
        OPS["Operations - PLACEHOLDER"]
    end

    Start --> WD
    WD -.-> RE
    WD --> RA
    RE --> RA
    RA -.-> US
    RA --> WP
    US --> WP
    WP -.-> AD
    WP --> UG
    AD -.-> UG
    UG --> CG1
    CG1 --> CG2
    CG2 --> CG3
    CG3 --> BT
    BT -.-> OPS
    BT --> End(["Complete"])

    style WD fill:#4CAF50,stroke:#1B5E20,stroke-width:3px,color:#fff
    style RA fill:#4CAF50,stroke:#1B5E20,stroke-width:3px,color:#fff
    style WP fill:#4CAF50,stroke:#1B5E20,stroke-width:3px,color:#fff
    style CG1 fill:#4CAF50,stroke:#1B5E20,stroke-width:3px,color:#fff
    style CG2 fill:#4CAF50,stroke:#1B5E20,stroke-width:3px,color:#fff
    style CG3 fill:#4CAF50,stroke:#1B5E20,stroke-width:3px,color:#fff
    style BT fill:#4CAF50,stroke:#1B5E20,stroke-width:3px,color:#fff
    style RE fill:#BDBDBD,stroke:#424242,stroke-width:2px,stroke-dasharray: 5 5,color:#000
    style US fill:#BDBDBD,stroke:#424242,stroke-width:2px,stroke-dasharray: 5 5,color:#000
    style AD fill:#BDBDBD,stroke:#424242,stroke-width:2px,stroke-dasharray: 5 5,color:#000
    style UG fill:#FFA726,stroke:#E65100,stroke-width:3px,stroke-dasharray: 5 5,color:#000
    style Start fill:#CE93D8,stroke:#6A1B9A,stroke-width:3px,color:#000
    style End fill:#CE93D8,stroke:#6A1B9A,stroke-width:3px,color:#000
    style INCEPTION fill:#BBDEFB,stroke:#1565C0,stroke-width:3px,color:#000
    style CONSTRUCTION fill:#C8E6C9,stroke:#2E7D32,stroke-width:3px,color:#000
    style OPERATIONS fill:#FFF59D,stroke:#F57F17,stroke-width:3px,color:#000

    linkStyle default stroke:#333,stroke-width:2px
```

### Text Alternative

```
INCEPTION PHASE
  - Workspace Detection: COMPLETED
  - Reverse Engineering: SKIPPED (artifacts present)
  - Requirements Analysis: COMPLETED
  - User Stories: SKIPPED (no user-facing changes)
  - Workflow Planning: COMPLETED
  - Application Design: SKIPPED (no new components)
  - Units Generation: EXECUTE

CONSTRUCTION PHASE
  - Unit 1 Code Generation: Toolchain and Dependencies  [EXECUTE]
  - Unit 2 Code Generation: React 19 / Router 7 / OTel 2.6  [EXECUTE]
  - Unit 3 Code Generation: Mantine 8.x Migration  [EXECUTE]
  - Build and Test  [EXECUTE]

OPERATIONS PHASE
  - Operations: PLACEHOLDER
```

---

## Execution Notes

- **Sequential**: Units execute in strict order (1  2  3) due to dependency chain
- **Validation gate**: After all units, Build and Test must pass: npm install (clean) + type-check + vitest + vite build
- **Breaking change priority**: React Router 7 and Mantine 8 carry the most code-change volume
- **Compatibility pinning**: Versions will be verified for mutual compatibility before Unit 1 generation

---

## Extension Compliance (Workflow Planning Stage)

- security-baseline: N/A (disabled for this cycle)
