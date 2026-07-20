# Strategy Imports

Use this folder as the local handoff point from the strategy manager repo.

```text
imports/
  incoming/   Copy exported strategy packages here for review.
  accepted/   Move packages here after validation/import.
  rejected/   Move packages here if validation fails.
```

V1 local flow:

```powershell
python strategy_importer/import_package.py imports/incoming/dual-momentum/strategy-package
python strategy_importer/import_package.py imports/incoming/dual-momentum/model-portfolio-update --kind update
```

The importer writes website-ready JSON to `web/lib/imported-strategies.json`.
