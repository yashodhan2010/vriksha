# Strategy Package Contract

Vriksha is the commercial publishing platform. Strategy experimentation and long-form backtesting
can happen elsewhere, but approved strategies must be exported in this package format so Vriksha can
publish research pages and run live model portfolio rebalances.

## Required Files

```text
manifest.json
strategy_config.json
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
live_strategy/strategy.py
```

## Runtime Boundary

The live strategy code may calculate the next model portfolio and rebalance changes. It must not:

- place trades
- connect to broker accounts
- manage subscriber accounts
- make payment decisions
- change published portfolios without admin approval

## CSV Rules

- Dates use `YYYY-MM-DD`.
- Weights and returns are decimals, such as `0.125` for 12.5%.
- Currency is INR unless the manifest says otherwise.
- Symbols should use the exchange convention selected in the strategy config.

## Portfolio Columns

```text
strategy_id,as_of_date,symbol,company_name,exchange,isin,sector,marketcap_bucket,target_weight,reference_price,entry_date,notes
```

## Rebalance Columns

```text
strategy_id,rebalance_date,symbol,company_name,action,old_weight,new_weight,old_reference_price,new_reference_price,rationale
```

Allowed actions: `ADDED`, `REMOVED`, `INCREASED`, `REDUCED`, `UNCHANGED`.
