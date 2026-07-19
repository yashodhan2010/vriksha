from __future__ import annotations

import csv
import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any


REQUIRED_FILES = {
    "manifest.json",
    "strategy_config.json",
    "backtest_metrics.json",
    "returns_monthly.csv",
    "returns_yearly.csv",
    "drawdowns.csv",
    "latest_model_portfolio.csv",
    "rebalance_history.csv",
    "methodology.md",
    "disclosures.md",
    "import_notes.md",
}

PORTFOLIO_COLUMNS = {
    "strategy_id",
    "as_of_date",
    "symbol",
    "company_name",
    "exchange",
    "isin",
    "sector",
    "marketcap_bucket",
    "target_weight",
    "reference_price",
    "entry_date",
    "notes",
}

REBALANCE_COLUMNS = {
    "strategy_id",
    "rebalance_date",
    "symbol",
    "company_name",
    "action",
    "old_weight",
    "new_weight",
    "old_reference_price",
    "new_reference_price",
    "rationale",
}


@dataclass(frozen=True)
class ValidationResult:
    ok: bool
    errors: list[str]
    manifest: dict[str, Any] | None


def _read_json(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as handle:
        data = json.load(handle)
    if not isinstance(data, dict):
        raise ValueError(f"{path.name} must contain a JSON object")
    return data


def _read_csv_header(path: Path) -> set[str]:
    with path.open("r", encoding="utf-8", newline="") as handle:
        reader = csv.DictReader(handle)
        return set(reader.fieldnames or [])


def validate_strategy_package(package_dir: str | Path) -> ValidationResult:
    root = Path(package_dir)
    errors: list[str] = []

    if not root.exists() or not root.is_dir():
        return ValidationResult(False, [f"Package directory not found: {root}"], None)

    for required in sorted(REQUIRED_FILES):
        if not (root / required).exists():
            errors.append(f"Missing required file: {required}")

    manifest: dict[str, Any] | None = None
    if (root / "manifest.json").exists():
        try:
            manifest = _read_json(root / "manifest.json")
        except (json.JSONDecodeError, ValueError) as exc:
            errors.append(str(exc))

    for json_name in ("strategy_config.json", "backtest_metrics.json"):
        if (root / json_name).exists():
            try:
                _read_json(root / json_name)
            except (json.JSONDecodeError, ValueError) as exc:
                errors.append(str(exc))

    if (root / "latest_model_portfolio.csv").exists():
        missing = PORTFOLIO_COLUMNS - _read_csv_header(root / "latest_model_portfolio.csv")
        if missing:
            errors.append(f"latest_model_portfolio.csv missing columns: {sorted(missing)}")

    if (root / "rebalance_history.csv").exists():
        missing = REBALANCE_COLUMNS - _read_csv_header(root / "rebalance_history.csv")
        if missing:
            errors.append(f"rebalance_history.csv missing columns: {sorted(missing)}")

    return ValidationResult(ok=not errors, errors=errors, manifest=manifest)


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Validate a Vriksha strategy package.")
    parser.add_argument("package_dir", help="Path to the exported strategy package.")
    args = parser.parse_args()

    result = validate_strategy_package(args.package_dir)
    if result.ok:
        print("Strategy package is valid.")
    else:
        print("Strategy package is invalid:")
        for error in result.errors:
            print(f"- {error}")
        raise SystemExit(1)
