# Strategy Package Contract

Vriksha is the commercial publishing platform. Strategy experimentation and long-form backtesting
can happen elsewhere, but approved strategies must be exported in this package format so Vriksha can
publish research pages and subscriber-only model portfolio views.

## Required Files

Full finalized package:

```text
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
manifest.json
latest_model_portfolio.csv
rebalance_history.csv
holdings_history.csv
sector_exposure.csv
marketcap_exposure.csv
```

## Runtime Boundary

Vriksha consumes finalized strategy outputs. It must not:

- calculate signals
- calculate ranks
- run lookbacks
- generate backtests
- generate live model portfolios
- place trades
- connect to broker accounts
- manage subscriber accounts
- make payment decisions
- change published portfolios without admin approval

The only allowed calculations in Vriksha are presentation and validation transforms, such as parsing
CSV files, creating chart series, formatting percentages, sorting by date, taking the latest
portfolio, selecting the last five rebalances, and checking required columns.

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

Allowed actions: `ADDED`, `REMOVED`, `WEIGHT_CHANGED`, `INCREASED`, `REDUCED`, `UNCHANGED`.

## Return And Exposure Columns

```text
returns_daily.csv: strategy_id,date,return,equity_curve
returns_monthly.csv: strategy_id,year,month,return
returns_yearly.csv: strategy_id,year,return
drawdowns.csv: strategy_id,date,drawdown
benchmark_returns.csv: strategy_id,date,benchmark,return,equity_curve
holdings_history.csv: strategy_id,date,symbol,company_name,exchange,isin,sector,marketcap_bucket,weight,reference_price
sector_exposure.csv: strategy_id,as_of_date,sector,weight
marketcap_exposure.csv: strategy_id,as_of_date,marketcap_bucket,weight
```
