from __future__ import annotations

import csv
import json
from collections import defaultdict
from pathlib import Path
from typing import Any

from package_contract import validate_strategy_package


DEFAULT_OUTPUT = Path("web/lib/imported-strategies.json")

PUBLISHED_SLUG_ALIASES = {
    "multi-asset-etf-dual-momentum": "conservative-dual-momentum",
}

PUBLISHED_NAME_ALIASES = {
    "conservative-dual-momentum": "Bamboo Trunk",
}


def read_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def read_csv(path: Path) -> list[dict[str, str]]:
    if not path.exists():
        return []
    with path.open("r", encoding="utf-8", newline="") as handle:
        return list(csv.DictReader(handle))


def read_markdown_points(path: Path) -> list[str]:
    if not path.exists():
        return []
    points: list[str] = []
    for line in path.read_text(encoding="utf-8").splitlines():
        clean = line.strip().lstrip("- ").strip()
        if not clean or clean.startswith("#"):
            continue
        points.append(clean)
    return points[:8]


def read_markdown_sections(path: Path) -> list[dict[str, str]]:
    if not path.exists():
        return []
    sections: list[dict[str, str]] = []
    current_title = ""
    current_lines: list[str] = []
    for line in path.read_text(encoding="utf-8").splitlines():
        stripped = line.strip()
        if stripped.startswith("# "):
            continue
        if stripped.startswith("## "):
            if current_title and current_lines:
                sections.append({"title": current_title, "body": " ".join(current_lines).strip()})
            current_title = stripped.lstrip("#").strip()
            current_lines = []
            continue
        if stripped:
            current_lines.append(stripped)
    if current_title and current_lines:
        sections.append({"title": current_title, "body": " ".join(current_lines).strip()})
    return sections


def published_slug(manifest: dict[str, Any]) -> str:
    source_slug = manifest["slug"]
    return (
        manifest.get("published_slug")
        or manifest.get("website_slug")
        or PUBLISHED_SLUG_ALIASES.get(source_slug)
        or source_slug
    )


def display_names(manifest: dict[str, Any], slug: str) -> tuple[str, str]:
    public_name = (
        manifest.get("public_name")
        or PUBLISHED_NAME_ALIASES.get(slug)
        or manifest["name"]
    )
    internal_name = manifest.get("internal_name") or manifest["name"]
    return public_name, internal_name


def decimal_percent(value: Any) -> float:
    try:
        return round(float(value) * 100, 4)
    except (TypeError, ValueError):
        return 0.0


def format_percent(value: Any) -> str:
    return f"{decimal_percent(value):.1f}%"


def format_currency(value: Any, currency: str) -> str:
    try:
        number = float(value)
    except (TypeError, ValueError):
        number = 0
    if number <= 0:
        return "Not specified"
    return f"{currency} {number:,.0f}"


def title_action(action: str) -> str:
    mapping = {
        "ADDED": "Added",
        "REMOVED": "Removed",
        "INCREASED": "Increased",
        "REDUCED": "Reduced",
        "WEIGHT_CHANGED": "Weight changed",
        "UNCHANGED": "Unchanged",
    }
    return mapping.get(action.upper(), action.replace("_", " ").title())


def monthly_benchmark(rows: list[dict[str, str]]) -> dict[tuple[str, str], float]:
    grouped: dict[tuple[str, str], list[float]] = defaultdict(list)
    for row in rows:
        date = row.get("date", "")
        if len(date) < 7:
            continue
        grouped[(date[:4], str(int(date[5:7])) if date[5:7].isdigit() else date[5:7])].append(
            float(row.get("return") or 0)
        )
    return {key: decimal_percent(_compound(values)) for key, values in grouped.items()}


def yearly_benchmark(rows: list[dict[str, str]]) -> dict[str, float]:
    grouped: dict[str, list[float]] = defaultdict(list)
    for row in rows:
        date = row.get("date", "")
        if len(date) >= 4:
            grouped[date[:4]].append(float(row.get("return") or 0))
    return {key: decimal_percent(_compound(values)) for key, values in grouped.items()}


def _compound(values: list[float]) -> float:
    total = 1.0
    for value in values:
        total *= 1.0 + value
    return total - 1.0


def build_strategy_from_full_package(package_dir: Path) -> dict[str, Any]:
    manifest = read_json(package_dir / "manifest.json")
    metrics = read_json(package_dir / "backtest_metrics.json")
    benchmark_rows = read_csv(package_dir / "benchmark_returns.csv")
    benchmark_by_month = monthly_benchmark(benchmark_rows)
    benchmark_by_year = yearly_benchmark(benchmark_rows)

    monthly_returns = [
        {
            "month": f"{row.get('year')}-{str(row.get('month')).zfill(2)}",
            "strategy": decimal_percent(row.get("return")),
            "benchmark": benchmark_by_month.get((row.get("year", ""), str(int(row.get("month") or 0))), 0.0),
        }
        for row in read_csv(package_dir / "returns_monthly.csv")
    ]
    yearly_returns = [
        {
            "year": row.get("year", ""),
            "strategy": decimal_percent(row.get("return")),
            "benchmark": benchmark_by_year.get(row.get("year", ""), 0.0),
        }
        for row in read_csv(package_dir / "returns_yearly.csv")
    ]
    drawdowns = [
        {"period": row.get("date", ""), "drawdown": decimal_percent(row.get("drawdown"))}
        for row in read_csv(package_dir / "drawdowns.csv")
    ]
    methodology_path = package_dir / "methodology.md"
    slug = published_slug(manifest)
    public_name, internal_name = display_names(manifest, slug)
    exports = export_links(slug)
    return {
        "slug": slug,
        "name": public_name,
        "public_name": public_name,
        "internal_name": internal_name,
        "subtitle": manifest.get("short_description") or f"{public_name} model portfolio.",
        "status": "Open",
        "labels": manifest.get("category_labels") or ["Model Portfolio"],
        "benchmark": manifest.get("benchmark", ""),
        "universe": manifest.get("universe", ""),
        "rebalanceFrequency": str(manifest.get("rebalance_frequency", "")).replace("_", " ").title(),
        "targetHoldings": int(manifest.get("target_holdings") or 0),
        "minCapital": format_currency(
            manifest.get("min_capital_guidance"),
            manifest.get("base_currency", "INR"),
        ),
        "price": "Subscription required",
        "raName": manifest.get("ra_entity", ""),
        "sebiRegistration": manifest.get("sebi_registration_number", ""),
        "methodology": read_markdown_points(methodology_path),
        "methodologySections": read_markdown_sections(methodology_path),
        "metrics": metric_cards(metrics),
        "monthlyReturns": monthly_returns,
        "yearlyReturns": yearly_returns,
        "drawdowns": drawdowns,
        "holdings": holdings(package_dir),
        "rebalances": rebalances(package_dir),
        "exports": exports,
    }


def metric_cards(metrics: dict[str, Any]) -> list[dict[str, str]]:
    return [
        {"label": "CAGR", "value": format_percent(metrics.get("cagr")), "hint": "Backtested annualized return"},
        {
            "label": "Max drawdown",
            "value": format_percent(metrics.get("max_drawdown")),
            "hint": "Largest peak-to-trough decline",
        },
        {"label": "Volatility", "value": format_percent(metrics.get("volatility")), "hint": "Annualized volatility"},
        {"label": "Sharpe", "value": f"{float(metrics.get('sharpe') or 0):.2f}", "hint": "Risk-adjusted return"},
        {"label": "Turnover", "value": format_percent(metrics.get("turnover")), "hint": "Average turnover"},
        {
            "label": "Hold period",
            "value": f"{int(metrics.get('average_holding_period_days') or 0)}d",
            "hint": "Average holding period",
        },
    ]


def holdings(package_dir: Path) -> list[dict[str, Any]]:
    return [
        {
            "symbol": row.get("symbol", ""),
            "company": row.get("company_name", ""),
            "sector": row.get("sector", "") or "Unclassified",
            "marketcap": row.get("marketcap_bucket", "") or "Unclassified",
            "weight": float(row.get("target_weight") or 0),
            "note": row.get("notes", ""),
        }
        for row in read_csv(package_dir / "latest_model_portfolio.csv")
    ]


def export_links(slug: str) -> dict[str, str]:
    return {
        "latestModelPortfolioCsv": f"/api/strategies/{slug}/exports/latest-model-portfolio",
        "rebalanceHistoryCsv": f"/api/strategies/{slug}/exports/rebalance-history",
    }


def rebalances(package_dir: Path) -> list[dict[str, Any]]:
    grouped: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for row in read_csv(package_dir / "rebalance_history.csv"):
        grouped[row.get("rebalance_date", "")].append(
            {
                "symbol": row.get("symbol", ""),
                "action": title_action(row.get("action", "")),
                "oldWeight": float(row.get("old_weight") or 0),
                "newWeight": float(row.get("new_weight") or 0),
            }
        )
    output = []
    for date, changes in sorted(grouped.items(), reverse=True):
        output.append(
            {
                "date": date,
                "summary": f"{len(changes)} portfolio change{'s' if len(changes) != 1 else ''}.",
                "changes": changes,
            }
        )
    return output[:5]


def apply_update_package(package_dir: Path, existing: list[dict[str, Any]]) -> list[dict[str, Any]]:
    manifest = read_json(package_dir / "manifest.json")
    slug = published_slug(manifest)
    public_name, internal_name = display_names(manifest, slug)
    for strategy in existing:
        if strategy.get("slug") == slug:
            strategy["name"] = public_name
            strategy["public_name"] = public_name
            strategy["internal_name"] = internal_name
            strategy["holdings"] = holdings(package_dir)
            strategy["rebalances"] = rebalances(package_dir)
            strategy["exports"] = {
                **strategy.get("exports", {}),
                **export_links(slug),
            }
            return existing
    existing.append(
        {
            "slug": slug,
            "name": public_name,
            "public_name": public_name,
            "internal_name": internal_name,
            "subtitle": "Latest imported model portfolio update.",
            "status": "Open",
            "labels": ["Model Portfolio"],
            "benchmark": "",
            "universe": "",
            "rebalanceFrequency": "",
            "targetHoldings": len(holdings(package_dir)),
            "minCapital": "Not specified",
            "price": "Subscription required",
            "raName": "",
            "sebiRegistration": "",
            "methodology": [],
            "metrics": [],
            "monthlyReturns": [],
            "yearlyReturns": [],
            "drawdowns": [],
            "holdings": holdings(package_dir),
            "rebalances": rebalances(package_dir),
            "exports": export_links(slug),
        }
    )
    return existing


def load_existing(output_path: Path) -> list[dict[str, Any]]:
    if not output_path.exists():
        return []
    data = json.loads(output_path.read_text(encoding="utf-8-sig"))
    return data if isinstance(data, list) else []


def import_package(package_dir: str | Path, package_kind: str, output_path: str | Path) -> Path:
    root = Path(package_dir)
    output = Path(output_path)
    result = validate_strategy_package(root, package_kind)
    if not result.ok:
        raise ValueError("\n".join(result.errors))
    if package_kind == "full":
        strategy = build_strategy_from_full_package(root)
        source_slug = read_json(root / "manifest.json")["slug"]
        existing = [
            item
            for item in load_existing(output)
            if item.get("slug") not in {strategy["slug"], source_slug}
        ]
        existing.append(strategy)
    else:
        source_slug = read_json(root / "manifest.json")["slug"]
        existing = apply_update_package(root, load_existing(output))
        if source_slug != published_slug(read_json(root / "manifest.json")):
            existing = [item for item in existing if item.get("slug") != source_slug]
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(existing, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    return output


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Import a Vriksha strategy package for local display.")
    parser.add_argument("package_dir")
    parser.add_argument("--kind", choices=["full", "update"], default="full")
    parser.add_argument("--output", default=str(DEFAULT_OUTPUT))
    args = parser.parse_args()

    written = import_package(args.package_dir, args.kind, args.output)
    print(f"Imported package into {written}")
