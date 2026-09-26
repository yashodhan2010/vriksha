from __future__ import annotations

import json
import tempfile
from pathlib import Path

from import_package import DEFAULT_OUTPUT, atomic_write, import_package, load_existing


def discover_packages(packages_root: str | Path) -> list[tuple[Path, str]]:
    root = Path(packages_root)
    if not root.exists() or not root.is_dir():
        raise ValueError(f"Packages root not found: {root}")

    discovered: list[tuple[Path, str]] = []
    for strategy_dir in sorted(item for item in root.iterdir() if item.is_dir()):
        full_package = strategy_dir / "strategy-package"
        update_package = strategy_dir / "model-portfolio-update"
        if full_package.exists():
            discovered.append((full_package, "full"))
        if update_package.exists():
            discovered.append((update_package, "update"))
    return discovered


def import_all_packages(
    packages_root: str | Path,
    output_path: str | Path = DEFAULT_OUTPUT,
    reset: bool = False,
    preserve_dates: bool = False,
) -> list[tuple[Path, str]]:
    output = Path(output_path)
    date_baseline = load_existing(output)
    # Stage the entire batch: even --reset must preserve the last valid version on failure.
    output.parent.mkdir(parents=True, exist_ok=True)
    imported: list[tuple[Path, str]] = []
    with tempfile.TemporaryDirectory(dir=output.parent) as staging:
        staged = Path(staging) / output.name
        staged.write_text(json.dumps([] if reset else date_baseline), encoding="utf-8")
        preview = output.with_suffix(".preview.json")
        staged_preview = staged.with_suffix(".preview.json")
        staged_preview.write_text(json.dumps([] if reset else load_existing(preview)), encoding="utf-8")
        for package_dir, package_kind in discover_packages(packages_root):
            try:
                import_package(package_dir, package_kind, staged, preserve_dates=preserve_dates,
                               date_baseline=date_baseline)
            except (ValueError, OSError, KeyError, TypeError) as exc:
                raise ValueError(f"Batch unchanged; invalid {package_kind} package {package_dir}: {exc}") from exc
            imported.append((package_dir, package_kind))
        if imported:
            atomic_write(preview, staged_preview.read_text(encoding="utf-8"))
            atomic_write(output, staged.read_text(encoding="utf-8"))
    for package_dir, package_kind in imported:
        print(f"Imported {package_kind}: {package_dir}")
    return imported


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Import every Vriksha strategy package in a packages root.")
    parser.add_argument("packages_root", help="Path to data/output/packages from the strategy manager.")
    parser.add_argument("--output", default=str(DEFAULT_OUTPUT))
    parser.add_argument(
        "--reset",
        action="store_true",
        help="Clear the current imported strategies JSON before importing discovered packages.",
    )
    parser.add_argument(
        "--preserve-published-dates",
        action="store_true",
        help="Keep existing rebalance/model portfolio dates for matching published strategy slugs.",
    )
    args = parser.parse_args()

    imported_items = import_all_packages(
        args.packages_root,
        args.output,
        args.reset,
        preserve_dates=args.preserve_published_dates,
    )
    print(f"Imported {len(imported_items)} package(s).")
