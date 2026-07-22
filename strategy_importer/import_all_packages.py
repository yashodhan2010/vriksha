from __future__ import annotations

import json
from pathlib import Path

from import_package import DEFAULT_OUTPUT, import_package
from package_contract import validate_strategy_package


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
) -> list[tuple[Path, str]]:
    output = Path(output_path)
    if reset:
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text(json.dumps([], indent=2) + "\n", encoding="utf-8")

    imported: list[tuple[Path, str]] = []
    for package_dir, package_kind in discover_packages(packages_root):
        result = validate_strategy_package(package_dir, package_kind)
        if not result.ok:
            print(f"Skipped invalid {package_kind} package: {package_dir}")
            for error in result.errors:
                print(f"  - {error}")
            continue
        import_package(package_dir, package_kind, output)
        imported.append((package_dir, package_kind))
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
    args = parser.parse_args()

    imported_items = import_all_packages(args.packages_root, args.output, args.reset)
    print(f"Imported {len(imported_items)} package(s).")
