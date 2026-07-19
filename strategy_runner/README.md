# Vriksha Strategy Runner

This folder is the boundary between research and the subscriber website.

The research/backtest project can experiment freely. Once a strategy is approved, it should export
a strategy package and, where needed, a finalized runnable strategy module. Vriksha imports that
package, stores the public research data, and uses the runner to generate live model portfolios on
rebalance dates.

The runner must never place broker orders. Its only job is to generate model portfolio outputs and
rebalance records.

## Package Layout

```text
strategy-package/
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
  live_strategy/
    strategy.py
    README.md
```

`live_strategy/strategy.py` should expose:

```python
def generate_model_portfolio(config: dict, market_data: dict, as_of_date: str) -> dict:
    ...
```

The returned dictionary should include `holdings` and `rebalance_summary` fields matching the CSV
contract documented in `docs/strategy-package-contract.md`.
