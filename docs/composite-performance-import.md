# Composite performance imports

The importer retains `returns_daily.csv` and `benchmark_returns.csv` as `historicalDaily` for each source strategy ID. Rebalance packages replace the live preview, never the saved historical segment. Older packages without `live_performance` remain supported, subject to daily-series validation. Existing website records need one valid full import before a live update can be joined.

## Commands (PowerShell, repository root)

Refresh performance for an **existing** strategy, preserving holdings, rebalance dates, names and other portfolio publication fields:

```powershell
python strategy_importer/import_package.py "C:\path\to\strategy-package" --kind full --performance-only
python strategy_importer/import_package.py "C:\path\to\model-portfolio-update" --kind update --performance-only
```

For a new strategy, or an intentional portfolio publication, omit `--performance-only`. This retains the existing full/update portfolio import workflow. `--preserve-published-dates` still preserves dates; it does not preserve holdings. Do not use it as a substitute for `--performance-only`.

```powershell
python strategy_importer/import_package.py "C:\path\to\strategy-package" --kind full
python strategy_importer/import_all_packages.py "C:\path\to\data\output\packages"
```

Batch imports stage all packages before writing; an invalid package aborts the batch, including with `--reset`. `--reset` deliberately clears prior history on a successful batch, so include full packages before updates. Individual invalid imports leave both published and preview files unchanged and report the failing check.

Default public output: `web/lib/imported-strategies.json`. Private preview output: `web/lib/imported-strategies.preview.json` (gitignored). With `--output`, the preview file uses the same path with `.preview.json` in place of `.json`. Public output contains only the historical Backtest performance. Live manifests, quality metadata and the composite remain in the private preview file.

To view the composite using the existing strategy cards, disclosure flow, performance graphs, metric cards and monthly matrix:

```powershell
Set-Location web
$env:VRIKSHA_PERFORMANCE_PREVIEW = "1"
npm run dev -- --hostname 127.0.0.1
```

Restart the development server after importing to refresh cached pages. Preview files are read server-side only, and only when `NODE_ENV=development` and the flag is `1`. Production builds ignore the flag and do not read private data. No public approval switch is provided. The preview overlay allowlists performance fields and cannot alter portfolio exports, checkout or rebalance publication.

## Calculation and validation

- Dates must be ordered, unique ISO dates, not in the future. Returns, curves, NAV, drawdowns and JSON numerical values must be finite. Curves must be positive and consistent with their daily returns (tolerance for export rounding).
- Historical rows must match the source strategy ID and benchmark identity. Both series must cover the same dates. Live strategy ID, source slug, benchmark, units, provenance, inception and latest date must match the manifests. Missing files, quality fields, missing/stale prices and warnings on available live data reject the import.
- Historical strategy and benchmark must each contain the exact inception date. The live curves must begin there at 1 with zero return. Historical rows through that date are retained; only strictly later live rows are appended, each curve scaled independently at its own historical anchor. Overlapping historical dates cannot replace live observations. Known historical trading dates missing from the live segment reject the join.
- Daily data drives monthly/yearly compounding, CAGR (365.25 calendar-day basis, shown only for at least one year), sample volatility (252 sessions), zero-risk-free-rate Sharpe, and daily peak-to-trough drawdown. Turnover and holding period are not inferred from returns. Live metrics are validated/read but never reused as composite metrics.
- Period windows end at the actual last daily observation. A requested period uses the last observed baseline on or before its calendar cutoff; insufficient history shows NA. Its drawdown peak resets at that baseline. Max includes the first observed return, using its implied pre-return value as an explicitly labeled start point. No intervening returns are fabricated.
- Views show actual data dates, a live inception marker, segment labels in tooltips and B/L matrix labels. The current UTC calendar month is labeled MTD. A transition month compounds both segments once. Unavailable live exports remove the old preview curve and explicitly show Backtest only.

## Remaining blockers

1. The upstream tracker is `internal_only` and applies the latest rebalance target weights to daily returns. It does not model drifting holdings/fixed quantities between rebalances or broker fills. This method needs correction, validation and explicit publication approval before any public composite release. `available` is not approval, even if the export flag changes later.
2. The current contract has no authoritative trading-session calendar or per-session price completeness attestation. The importer checks exact inception anchors, benchmark alignment, known historical dates, curve continuity and exported quality warnings; it cannot certify an omitted session beyond historical coverage when both live CSVs omit it silently. This remains an upstream publication blocker. No weekday filling or backtest proxy is used.
3. A read-only dry run on the existing local strategy-manager packages on 2026-09-24 found no live files yet. Historical benchmark coverage was missing 14 strategy dates for `dual-momentum` and `low-drawdown-dual-momentum`, and 4 dates for `diversified-asset-income` and `multi-asset-etf-dual-momentum`. Examples include 2026-01-15, 2026-05-01 and 2026-05-28. Correct/validate the source trading dates and benchmark coverage and regenerate the packages; do not fill missing returns with zero. No website data was replaced by that dry run.

## Verification

```powershell
python -m unittest discover -s strategy_importer -p 'test_*.py' -v
Set-Location web
npm test
npm run typecheck
npm run build
```

Tests cover joins, independent benchmark scaling, overlapping and duplicate dates, transition-month compounding, unavailable/missing history, missing benchmarks, finite/date/identity/quality rejection, repeated imports, history and portfolio preservation, batch rollback, daily period calculations and production preview isolation. No deployment or Supabase service is required.

Verification completed locally: importer tests, website tests, typecheck and production build passed. One repeat build encountered OneDrive `EINVAL: readlink` in the existing `.next/server/chunks`; the final build passed using the existing config override `$env:NEXT_DIST_DIR = '.next.performance-check'` before `npm run build`.
