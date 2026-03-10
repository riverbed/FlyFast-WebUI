# Requirements Verification Questions (Vite Migration Cycle)

Please answer all questions by filling each [Answer]: line with one letter option (or X with your text).

## Question 1
For React and routing upgrades, what compatibility target should be used?

A) Prefer latest stable majors and update app code for breaking changes
B) Keep React on current major, only latest minor/patch
C) Keep routing on current major, only latest minor/patch
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 2
React Router DOM package naming has shifted to the React Router package. How should migration proceed?

A) Migrate imports and package usage to react-router where applicable
B) Keep react-router-dom package for now and only update version
C) Use whichever package name is required by latest official docs, even if mixed imports are needed
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 3
For Vite adoption, what scope should be included now?

A) Full migration: dev server, production build, tests, and config updates
B) Build/dev migration only now; tests later
C) Test migration only now; keep current build temporarily
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 4
How should testing be handled after moving from react-scripts to Vitest?

A) Replace Jest scripts fully with Vitest and React Testing Library setup
B) Keep both temporarily (Jest + Vitest) for one cycle
C) Minimal smoke test only under Vitest
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 5
The project currently has legacy peer dependency handling enabled. What is the required outcome?

A) Remove legacy peer dependency settings and require clean npm install
B) Remove from package.json only, keep .npmrc temporary fallback
C) Keep legacy peer handling if needed to unblock delivery
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 6
What validation threshold should be considered done for this migration?

A) npm install clean, type-check pass, vitest pass, vite build pass
B) type-check and build only
C) app boots in dev mode only
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 7
Should security extension rules be enforced for this project?

A) Yes - enforce all SECURITY rules as blocking constraints (recommended for production-grade applications)
B) No - skip all SECURITY rules (suitable for PoCs, prototypes, and experimental projects)
X) Other (please describe after [Answer]: tag below)

[Answer]: B

## Additional Context
Add any specific version pinning constraints, Node/npm constraints, CI pipeline constraints, or rollout constraints:

[Answer]: We want to target React 19.2, Mantine 8.3, React Router 7, and OpenTelemetry 2.6, if possible.
