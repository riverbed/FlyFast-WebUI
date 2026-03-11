# Deployment Runbook (First Pass)

## Timestamp
2026-03-11T13:10:18Z

## Scope
This runbook defines an initial deployment process for FlyFast-WebUI, including staging deployment flow, rollback procedure, and production sign-off template.

## Preconditions
- Construction validation gates are green:
  - `npm run type-check`
  - `npm test`
  - `npm run build`
- Container image can be built from `Dockerfile`.
- Runtime environment variables are available:
  - `VITE_FLIGHT_SEARCH`
  - `VITE_OPENTELEMETRY_ENDPOINT`

## Staging Deployment Flow
1. Prepare release candidate
   - Pull latest approved commit from release branch.
   - Verify local clean build and tests.
2. Build artifact/image
   - Build production bundle (`dist/`) and container image.
   - Tag image with immutable version (for example: `flyfast-webui:<git-sha>`).
3. Deploy to staging
   - Apply staging environment configuration.
   - Deploy image using selected rollout strategy (default: rolling).
4. Execute post-deploy smoke test
   - Validate Home load.
   - Run Search flow.
   - Add result to Cart.
   - Complete Checkout confirmation flow.
5. Validate observability
   - Confirm frontend traces are emitted to configured endpoint.
   - Confirm route transitions and checkout-related spans are visible.
6. Staging sign-off
   - Record deployment timestamp, image tag, and verifier.
   - If all checks pass, approve production promotion.

## Rollback Procedure
### Rollback Triggers
- User-facing flow broken (Home/Search/Checkout).
- Elevated frontend error rate after deployment.
- Missing or malformed telemetry indicating potential regression.
- Browser compatibility regression in supported evergreen browsers.

### Rollback Steps
1. Freeze new promotions.
2. Identify last known-good image tag.
3. Redeploy last known-good image to target environment.
4. Verify smoke tests and telemetry recovery.
5. Announce rollback completion to stakeholders.
6. Open incident record and start root-cause analysis.

### Rollback Ownership
- Release owner: assigned per release window.
- On-call owner: assigned in operations-readiness-checklist.md.

## Production Promotion Flow
1. Confirm staging sign-off complete.
2. Confirm monitoring dashboard and alerting are active.
3. Schedule release window with on-call coverage.
4. Deploy production using approved strategy.
5. Run production smoke checks and telemetry validation.
6. Complete production sign-off template.

## Production Sign-off Template
Use this template for each release:

- Release ID:
- Commit SHA:
- Container Image Tag:
- Deployment Date/Time (UTC):
- Environment: Production
- Release Owner:
- On-Call Owner:

Validation Checklist:
- [ ] `npm run type-check` passed on release commit
- [ ] `npm test` passed on release commit
- [ ] `npm run build` passed on release commit
- [ ] Staging deployment completed
- [ ] Staging smoke tests passed (Home -> Search -> Cart -> Checkout)
- [ ] Production deployment completed
- [ ] Production smoke tests passed
- [ ] Route/checkout telemetry observed in target backend
- [ ] No critical alerts for 30 minutes post-release

Decision:
- Sign-off Status: Approved / Rejected
- Approver Name:
- Approver Role:
- Notes:

## Follow-up Actions (Future Hardening)
1. Automate smoke tests in CI/CD post-deploy stage.
2. Add automated rollback playbook integration.
3. Add release evidence artifact upload (logs, screenshots, trace IDs).
4. Define formal SLO-based release gates.
