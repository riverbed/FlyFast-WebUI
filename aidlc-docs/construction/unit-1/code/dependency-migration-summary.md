# Dependency Migration Summary - Unit 1

## Scope
- Updated stable versions within compatible majors for Unit 1.
- Added TypeScript developer scripts and engine/install config.

## Direct Changes
- Updated Mantine 6 patch level (`6.0.22`).
- Updated selected OpenTelemetry patch/minor versions while preserving API compatibility.
- Updated router, icons, proxy middleware, and web-vitals.
- Added `@types/node`, `@types/react`, `@types/react-dom`.

## Risk Controls
- Kept React at 18.x.
- Kept Mantine at 6.x.
- Deferred major migrations to Unit 3.

## Peer Dependency Strategy
- Use `legacy-peer-deps` in `.npmrc` and `installConfig`.
- Reassess once Mantine v7 migration completes.

## Rollback
- Restore `package.json` and `package-lock.json` from Git.
- Reinstall with `npm ci`.
