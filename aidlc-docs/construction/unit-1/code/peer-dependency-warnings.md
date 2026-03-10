# Peer Dependency Warnings - Unit 1

## Strategy
- Install with `--legacy-peer-deps` during staged migration.
- Capture warnings during install and classify by risk.

## Warning Record Template
- Package:
- Required peer:
- Installed version:
- Runtime impact observed:
- Risk level (low/medium/high):
- Action:

## Escalation Rule
Escalate immediately if:
- Build fails.
- Runtime crash is tied to unresolved peer mismatch.
- Security vulnerability is introduced.

## Deferred Resolution
Major peer harmonization is scheduled for Unit 3 (Mantine v7 migration).
