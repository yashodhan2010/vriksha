# Vriksha Strategy Importer

This folder is the boundary between research outputs and the subscriber website.

The research/backtest project can experiment freely. Once a strategy is approved, it should export
a strategy package containing every calculated output Vriksha needs. Vriksha imports that package,
stores the public research data, and displays the paywalled model portfolio and rebalance history.

The importer must never run strategy logic. It validates, parses, stores, and prepares data for
charts/tables only.

## Package Layout

Full finalized package:

```text
strategy-package/
  manifest.json
  backtest_metrics.json
  returns_daily.csv
  returns_monthly.csv
  returns_yearly.csv
  drawdowns.csv
  benchmark_returns.csv
  latest_model_portfolio.csv
  rebalance_history.csv
  holdings_history.csv
  sector_exposure.csv
  marketcap_exposure.csv
  methodology.md
  disclosures.md
  import_notes.md
```

Latest model portfolio update package:

```text
model-portfolio-update/
  manifest.json
  latest_model_portfolio.csv
  rebalance_history.csv
  holdings_history.csv
  sector_exposure.csv
  marketcap_exposure.csv
```

Validate packages with:

```powershell
python strategy_importer/package_contract.py path\to\strategy-package
python strategy_importer/package_contract.py path\to\model-portfolio-update --kind update
```

Import without changing the currently published model portfolio or rebalance dates:

```powershell
python strategy_importer/import_package.py path\to\strategy-package --preserve-published-dates
python strategy_importer/import_package.py path\to\model-portfolio-update --kind update --preserve-published-dates
```

Bulk import with the same date preservation:

```powershell
python strategy_importer/import_all_packages.py path\to\packages-root --preserve-published-dates
```

## Allowed Work In Vriksha

Vriksha may:

- validate required files and columns
- parse JSON and CSV files
- normalize decimals/dates for storage
- build chart-ready arrays
- sort and filter rows
- select the latest portfolio
- select the last five rebalances

Vriksha may not calculate signals, lookbacks, ranks, backtests, or model portfolios.
