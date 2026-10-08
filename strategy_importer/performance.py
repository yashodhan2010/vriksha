"""Daily performance validation and composition. No portfolio mutations or publication approval."""
from __future__ import annotations

import csv
import json
import math
import statistics
from collections import defaultdict
from datetime import date
from pathlib import Path


def number(value):
    result = float(value)
    if not math.isfinite(result):
        raise ValueError("Performance values must be finite")
    return result


def day(value):
    if not isinstance(value, str) or date.fromisoformat(value).isoformat() != value:
        raise ValueError(f"Invalid performance date: {value}")
    if value > date.today().isoformat():
        raise ValueError(f"Future performance date: {value}")
    return value


def read_series(path, strategy_id=None, benchmark=None):
    with path.open(encoding="utf-8-sig", newline="") as handle:
        rows = list(csv.DictReader(handle))
    output = []
    for row in rows:
        if strategy_id and row.get("strategy_id") != strategy_id:
            raise ValueError(f"{path.name}: strategy identity mismatch")
        if benchmark and row.get("benchmark") != benchmark:
            raise ValueError(f"{path.name}: benchmark identity mismatch")
        item = {"date": day(row["date"]), "return": number(row["return"]),
                "equity_curve": number(row["equity_curve"])}
        if item["return"] <= -1 or item["equity_curve"] <= 0:
            raise ValueError(f"{path.name}: invalid return/equity")
        if "nav" in row and number(row["nav"]) <= 0:
            raise ValueError("Live NAV must be positive")
        if output:
            prev = output[-1]
            if item["date"] <= prev["date"]:
                raise ValueError(f"{path.name}: duplicate or unordered dates")
            if not math.isclose(item["equity_curve"], prev["equity_curve"] * (1 + item["return"]), rel_tol=1e-6, abs_tol=1e-8):
                raise ValueError(f"{path.name}: return/curve inconsistency at {item['date']}")
        output.append(item)
    return output


def paired(strategy, benchmark, segment):
    if [r["date"] for r in strategy] != [r["date"] for r in benchmark]:
        missing = sorted({r["date"] for r in strategy} - {r["date"] for r in benchmark})
        raise ValueError(f"{segment}: missing benchmark coverage or mismatched dates; {len(missing)} missing dates: {', '.join(missing[:10])}")
    return [{"date": s["date"], "strategyReturn": s["return"], "benchmarkReturn": b["return"],
             "strategy": s["equity_curve"], "benchmark": b["equity_curve"], "segment": segment}
            for s, b in zip(strategy, benchmark)]


def join(history, live, transition):
    anchor = next((r for r in history if r["date"] == transition), None)
    if not anchor or not live or live[0]["date"] != transition:
        raise ValueError("Missing historical/live coverage at live inception; full history import required")
    baseline = live[0]
    for key in ("strategy", "benchmark"):
        if not math.isclose(baseline[key], 1, abs_tol=1e-8) or baseline[key + "Return"] != 0:
            raise ValueError("Live inception must be a normalized baseline, with zero return")
    # Historical trading dates provide a calendar wherever the series overlap.
    known_dates = {r["date"] for r in history if transition < r["date"] <= live[-1]["date"]}
    if not known_dates.issubset({r["date"] for r in live}):
        raise ValueError("Gap in live history on a known historical trading date")
    return [r for r in history if r["date"] <= transition] + [
        {**r, "strategy": anchor["strategy"] * r["strategy"],
         "benchmark": anchor["benchmark"] * r["benchmark"]}
        for r in live[1:]]


def summarize(rows, transition=None, status="backtest"):
    if not rows:
        raise ValueError("No historical daily performance")
    monthly, yearly = defaultdict(lambda: [1., 1.]), defaultdict(lambda: [1., 1.])
    peak = rows[0]["strategy"] / (1 + rows[0]["strategyReturn"])
    initial = peak
    drawdowns = []
    for row in rows:
        for group, key in ((monthly, row["date"][:7]), (yearly, row["date"][:4])):
            group[key][0] *= 1 + row["strategyReturn"]
            group[key][1] *= 1 + row["benchmarkReturn"]
        peak = max(peak, row["strategy"])
        drawdowns.append({"period": row["date"], "drawdown": 100 * (row["strategy"] / peak - 1)})
    elapsed = (date.fromisoformat(rows[-1]["date"]) - date.fromisoformat(rows[0]["date"])).days
    returns = [r["strategyReturn"] for r in rows]
    # A zero inception observation is a baseline, not an earned return interval.
    if returns[0] == 0:
        returns = returns[1:]
    vol = statistics.stdev(returns) * math.sqrt(252) if len(returns) > 1 else None
    cagr = (rows[-1]["strategy"] / initial) ** (365.25 / elapsed) - 1 if elapsed >= 365 else None
    values = [("CAGR", cagr, "Annualized daily-series return (1Y+)"),
              ("Max drawdown", min(d["drawdown"] for d in drawdowns) / 100, "Daily peak-to-trough decline"),
              ("Volatility", vol, "Daily sample volatility, annualized at 252 sessions"),
              ("Sharpe", statistics.mean(returns) * 252 / vol if vol else None, "Zero risk-free rate; 252 sessions")]
    return {"dailyReturns": rows, "updatedThrough": rows[-1]["date"], "transitionDate": transition,
            "performanceStatus": status,
            "metrics": [{"label": label, "value": "NA" if value is None else (f"{value:.2f}" if label == "Sharpe" else f"{value * 100:.1f}%"), "hint": hint} for label, value, hint in values],
            "drawdowns": drawdowns,
            "monthlyReturns": [{"month": k, "strategy": (v[0]-1)*100, "benchmark": (v[1]-1)*100} for k, v in sorted(monthly.items())],
            "yearlyReturns": [{"year": k, "strategy": (v[0]-1)*100, "benchmark": (v[1]-1)*100} for k, v in sorted(yearly.items())]}


def benchmark_comparison(label, rows):
    monthly, yearly = defaultdict(lambda: 1.), defaultdict(lambda: 1.)
    for row in rows:
        monthly[row["date"][:7]] *= 1 + row["benchmarkReturn"]
        yearly[row["date"][:4]] *= 1 + row["benchmarkReturn"]
    return {
        "label": label,
        "dailyReturns": [
            {"date": row["date"], "return": row["benchmarkReturn"], "equityCurve": row["benchmark"]}
            for row in rows
        ],
        "monthlyReturns": [
            {"month": key, "benchmark": (value - 1) * 100}
            for key, value in sorted(monthly.items())
        ],
        "yearlyReturns": [
            {"year": key, "benchmark": (value - 1) * 100}
            for key, value in sorted(yearly.items())
        ],
    }


def rows_from_comparison(comparison):
    return [
        {"date": row["date"], "return": row["return"], "equity_curve": row["equityCurve"]}
        for row in comparison.get("dailyReturns", [])
    ]


def comparison_from_series(label, rows):
    monthly, yearly = defaultdict(lambda: 1.), defaultdict(lambda: 1.)
    for row in rows:
        monthly[row["date"][:7]] *= 1 + row["return"]
        yearly[row["date"][:4]] *= 1 + row["return"]
    return {
        "label": label,
        "dailyReturns": [
            {"date": row["date"], "return": row["return"], "equityCurve": row["equity_curve"]}
            for row in rows
        ],
        "monthlyReturns": [
            {"month": key, "benchmark": (value - 1) * 100}
            for key, value in sorted(monthly.items())
        ],
        "yearlyReturns": [
            {"year": key, "benchmark": (value - 1) * 100}
            for key, value in sorted(yearly.items())
        ],
    }


def add_unique_comparison(items, comparison):
    if comparison and not any(item.get("label") == comparison.get("label") for item in items):
        items.append(comparison)


def available_reference(reference, coverage_key, file_key):
    coverage = reference.get(coverage_key) or {}
    return coverage.get("status") == "available" and reference.get(file_key)


def load_historical_benchmark_comparisons(root, manifest, history, previous):
    comparisons = [benchmark_comparison(manifest.get("benchmark", ""), history)]
    history_dates = [row["date"] for row in history]

    for reference in manifest.get("benchmark_comparisons") or []:
        if not available_reference(reference, "historical_coverage", "historical_file"):
            continue
        label = reference.get("label")
        rows = read_series(root / reference["historical_file"], benchmark=label)
        if [row["date"] for row in rows] != history_dates:
            raise ValueError(f"{label}: benchmark comparison dates do not match strategy history")
        add_unique_comparison(comparisons, comparison_from_series(label, rows))

    for comparison in (previous or {}).get("benchmarkComparisons") or []:
        add_unique_comparison(comparisons, comparison)

    return comparisons


def join_benchmark_comparison(history_rows, live_rows, transition, label):
    anchor = next((row for row in history_rows if row["date"] == transition), None)
    if not anchor or not live_rows or live_rows[0]["date"] != transition:
        raise ValueError(f"{label}: missing historical/live benchmark coverage at live inception")
    baseline = live_rows[0]
    if not math.isclose(baseline["equity_curve"], 1, abs_tol=1e-8) or baseline["return"] != 0:
        raise ValueError(f"{label}: live benchmark comparison must start at 1 with zero return")
    known_dates = {row["date"] for row in history_rows if transition < row["date"] <= live_rows[-1]["date"]}
    if not known_dates.issubset({row["date"] for row in live_rows}):
        raise ValueError(f"{label}: gap in live benchmark comparison on a known historical trading date")
    return [row for row in history_rows if row["date"] <= transition] + [
        {**row, "equity_curve": anchor["equity_curve"] * row["equity_curve"]}
        for row in live_rows[1:]
    ]


def load_live_benchmark_comparisons(root, manifest, historical_comparisons, transition):
    by_label = {comparison.get("label"): comparison for comparison in historical_comparisons}
    comparisons = []

    for reference in manifest.get("benchmark_comparisons") or []:
        if not available_reference(reference, "live_coverage", "live_file"):
            continue
        label = reference.get("label")
        historical = by_label.get(label)
        if not historical:
            continue
        live_rows = read_series(root / reference["live_file"], benchmark=label)
        joined = join_benchmark_comparison(rows_from_comparison(historical), live_rows, transition, label)
        add_unique_comparison(comparisons, comparison_from_series(label, joined))

    return comparisons


def finite_json(value):
    if isinstance(value, float):
        number(value)
    elif isinstance(value, dict):
        for item in value.values():
            finite_json(item)
    elif isinstance(value, list):
        for item in value:
            finite_json(item)


def import_performance(root: Path, manifest, previous, full):
    identity = manifest.get("strategy_id")
    if not identity or not manifest.get("slug"):
        raise ValueError("Performance requires strategy_id and slug")
    if previous and previous.get("sourceStrategyId", identity) != identity:
        raise ValueError("Stored strategy identity mismatch")
    if previous and previous.get("benchmark") and manifest.get("benchmark", previous["benchmark"]) != previous["benchmark"]:
        raise ValueError("Stored benchmark identity mismatch")
    history = paired(read_series(root / "returns_daily.csv", identity),
                     read_series(root / "benchmark_returns.csv", identity, manifest.get("benchmark")), "Backtest") if full else (previous or {}).get("historicalDaily")
    public = {"sourceStrategyId": identity}
    if history:
        public.update(summarize(history))
        public["benchmarkComparisons"] = load_historical_benchmark_comparisons(root, manifest, history, previous)
        public["historicalDaily"] = history
    elif full:
        raise ValueError("Full import requires historical daily data")
    reference = manifest.get("live_performance")
    if reference is None:
        if any(root.glob("live_*.json")) or any(root.glob("live_*.csv")):
            raise ValueError("Live files exist without manifest.live_performance")
        return public, None
    if reference.get("manifest_file") != "live_manifest.json":
        raise ValueError("Unsupported live manifest reference")
    meta = json.loads((root / "live_manifest.json").read_text(encoding="utf-8-sig"))
    metrics = json.loads((root / "live_metrics.json").read_text(encoding="utf-8-sig"))
    finite_json(meta)
    finite_json(metrics)
    if meta.get("strategy_id") != identity or meta.get("slug") != manifest["slug"] or meta.get("benchmark") != manifest.get("benchmark", (previous or {}).get("benchmark")):
        raise ValueError("Live strategy/benchmark identity mismatch")
    for key in ("status", "live_inception_date", "latest_live_date"):
        if reference.get(key) != meta.get(key):
            raise ValueError(f"Live manifest mismatch: {key}")
    if meta.get("return_unit") != "decimal" or not isinstance(meta.get("internal_only"), bool) or not meta.get("calculation_method") or meta.get("report_source") != "live_rebalance":
        raise ValueError("Missing live units, provenance or approval metadata")
    quality, warnings = meta.get("data_quality"), meta.get("warnings")
    if not isinstance(quality, dict) or not isinstance(warnings, list) or not all(isinstance(w, str) for w in warnings):
        raise ValueError("Missing data-quality metadata or warnings")
    for key in ("missing_price_symbols", "stale_price_symbols"):
        if not isinstance(quality.get(key), list) or quality[key]:
            raise ValueError(f"Live price quality failed: {key}={quality.get(key)}")
    if meta.get("warning_count") != len(warnings):
        raise ValueError("Live warning_count mismatch")
    if quality.get("live_inception_date") != meta.get("live_inception_date"):
        raise ValueError("Data-quality inception mismatch")
    for key in ("live_inception_date", "latest_live_date"):
        if meta.get(key) is not None:
            day(meta[key])
    nav = read_series(root / "live_nav.csv")
    benchmark = read_series(root / "live_benchmark.csv")
    with (root / "live_drawdowns.csv").open(encoding="utf-8-sig", newline="") as handle:
        dd = list(csv.DictReader(handle))
    if [day(r["date"]) for r in dd] != [r["date"] for r in nav]:
        raise ValueError("Live drawdown coverage mismatch")
    peak = 1.
    for row, drawdown in zip(nav, dd):
        peak = max(peak, row["equity_curve"])
        if not math.isclose(number(drawdown["drawdown"]), row["equity_curve"] / peak - 1, abs_tol=1e-6):
            raise ValueError("Invalid live drawdowns")
    if meta.get("latest_live_date") != (nav[-1]["date"] if nav else None):
        raise ValueError("Latest live date does not match actual data")
    if meta.get("status") == "unavailable":
        if len(nav) > 1 or len(benchmark) > 1:
            raise ValueError("Unavailable status with live return intervals")
        for row in nav + benchmark:
            if row["date"] != meta.get("live_inception_date") or row["return"] != 0 or not math.isclose(row["equity_curve"], 1, abs_tol=1e-8):
                raise ValueError("Unavailable history must be empty or inception baseline only")
        public["performanceStatus"] = "unavailable"
        public["transitionDate"] = None
        return public, {"slug": manifest["slug"], "performanceStatus": "unavailable", "liveMetadata": meta}
    live = paired(nav, benchmark, "Live model")
    if meta.get("status") != "available" or len(live) < 2:
        raise ValueError("Available live performance requires return intervals")
    if day(quality.get("latest_price_date")) < live[-1]["date"]:
        raise ValueError("Latest live date exceeds price coverage")
    for key in ("live_rebalance_count", "tracked_symbols"):
        if not isinstance(quality.get(key), int) or quality[key] < 1:
            raise ValueError(f"Invalid data-quality {key}")
    if warnings:
        raise ValueError("Live quality warnings require resolution: " + "; ".join(warnings))
    if not history:
        raise ValueError("Import a full package to retain historical daily data before live updates")
    composite = summarize(join(history, live, day(meta["live_inception_date"])), meta["live_inception_date"], "internal_preview")
    composite["benchmarkComparisons"] = [benchmark_comparison(meta.get("benchmark", ""), composite["dailyReturns"])]
    for comparison in load_live_benchmark_comparisons(root, manifest, public.get("benchmarkComparisons", []), day(meta["live_inception_date"])):
        add_unique_comparison(composite["benchmarkComparisons"], comparison)
    public.update({**composite, "performanceStatus": "live"})
    return public, {**composite, "slug": manifest["slug"], "liveMetadata": meta}
