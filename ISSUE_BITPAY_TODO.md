# Bitpay: Deployment & Stabilization TODO

This issue file contains the prioritized checklist to finish deploying and stabilizing the Bitpay stack on the current host. Use as a checklist and update with statuses.

## Urgent - Get site / API fully reachable
- [ ] channel-service: diagnose logs, fix dependency or DB auth, rebuild, verify
- [ ] risk-control-service: diagnose logs, fix dependency or DB auth, rebuild, verify
- [ ] settlement-service: diagnose logs, fix dependency or DB auth, rebuild, verify
- [x] merchant-service: DB auth fix applied and service verified
- [x] payment-service: DB auth fix applied and service verified
- [x] agent-service: DB auth fix applied and service verified

## Immediate ops
- [x] Backup Postgres: `/root/.openclaw/workspace/bitpay/postgres_backup.sql`
- [ ] Archive deploy logs to safe storage
- [ ] Ensure `.env` is not pushed and is listed in `.gitignore`

## Build/reproducibility
- [ ] Generate package-lock/pnpm-lock for each service or adopt pnpm workspaces
- [ ] Update Dockerfile build stages to use lockfile (npm ci) when present
- [ ] Add CI job to build all images and run smoke tests

## Nexus: Event Forecast MVP (separate project)
- [ ] Create event_forecasts schema and API endpoints
- [ ] Frontend: event detail comparison block (manual sources)
- [ ] Integrate Polymarket & 1 market API as automated sources (PoC)

## Notes / logs
- Deploy logs: `deploy_logs*.txt` in repo workspace
- Branch with fixes: `fix/deploy-20260219` (contains Dockerfile and package fixes)

---

If you want this converted into a GitHub Issue, review and then I will open it on the repository.