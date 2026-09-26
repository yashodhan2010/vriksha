import csv
import json
import shutil
import tempfile
import unittest
from pathlib import Path

from import_package import import_package
from import_all_packages import import_all_packages


class PerformanceImportTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.package = self.root / "package"
        shutil.copytree(Path(__file__).parent / "sample_package", self.package)
        self.output = self.root / "strategies.json"
        self.preview = self.output.with_suffix(".preview.json")
        self.manifest = json.loads((self.package / "manifest.json").read_text())
        self.identity = self.manifest["strategy_id"]
        self.history = [("2024-01-01", 0, 1), ("2024-01-02", .1, 1.1), ("2024-01-03", .1, 1.21), ("2024-01-04", .1, 1.331)]
        self.csv("returns_daily.csv", ["strategy_id", "date", "return", "equity_curve"], [[self.identity, *r] for r in self.history])
        self.csv("benchmark_returns.csv", ["strategy_id", "date", "benchmark", "return", "equity_curve"], [[self.identity, r[0], self.manifest["benchmark"], r[1], r[2]] for r in self.history])

    def csv(self, name, headers, rows):
        with (self.package / name).open("w", newline="") as handle:
            writer = csv.writer(handle)
            writer.writerow(headers)
            writer.writerows(rows)

    def json(self, name, value):
        (self.package / name).write_text(json.dumps(value))

    def live(self, available=True):
        rows = [("2024-01-02", 0, 1), ("2024-01-03", -.1, .9), ("2024-01-04", .2, 1.08)] if available else []
        self.meta = {
            "strategy_id": self.identity, "slug": self.manifest["slug"], "benchmark": self.manifest["benchmark"],
            "status": "available" if available else "unavailable", "live_inception_date": "2024-01-02" if available else None,
            "latest_live_date": "2024-01-04" if available else None, "return_unit": "decimal", "internal_only": True,
            "report_source": "live_rebalance", "calculation_method": "daily_returns_weighted_by_latest_rebalance_target_weights",
            "warnings": [], "warning_count": 0,
            "data_quality": {"missing_price_symbols": [], "stale_price_symbols": [], "latest_price_date": "2024-01-04",
                             "live_inception_date": "2024-01-02" if available else None, "live_rebalance_count": 1, "tracked_symbols": 1},
        }
        self.manifest["live_performance"] = {"manifest_file": "live_manifest.json", **{key: self.meta[key] for key in ("status", "live_inception_date", "latest_live_date")}}
        self.json("manifest.json", self.manifest)
        self.json("live_manifest.json", self.meta)
        self.json("live_metrics.json", {"annualized_return": 999})  # Must never be used as composite metrics.
        self.csv("live_nav.csv", ["date", "return", "equity_curve", "nav"], [[*r, r[2]*100000] for r in rows])
        self.csv("live_benchmark.csv", ["date", "return", "equity_curve"], rows)
        self.csv("live_drawdowns.csv", ["date", "drawdown"], [("2024-01-02", 0), ("2024-01-03", -.1), ("2024-01-04", 0)] if available else [])

    def run_import(self, kind="full", **kwargs):
        return import_package(self.package, kind, self.output, **kwargs)

    def public(self):
        return json.loads(self.output.read_text())[0]

    def private(self):
        return json.loads(self.preview.read_text())[0]

    def test_join_overlap_transition_month_and_derived_metrics(self):
        self.live()
        self.run_import()
        p = self.private()
        self.assertEqual([r["date"] for r in p["dailyReturns"]], [r[0] for r in self.history])
        self.assertAlmostEqual(p["dailyReturns"][-1]["strategy"], 1.188)
        self.assertAlmostEqual(p["monthlyReturns"][0]["strategy"], 18.8)
        self.assertAlmostEqual(p["yearlyReturns"][0]["benchmark"], 18.8)
        self.assertAlmostEqual(p["drawdowns"][2]["drawdown"], -10)
        self.assertEqual(p["metrics"][0]["value"], "NA")
        self.assertEqual(p["updatedThrough"], "2024-01-04")
        self.assertEqual(p["performanceStatus"], "internal_preview")
        self.assertEqual(self.public()["performanceStatus"], "backtest")
        self.assertNotIn("liveMetadata", self.public())

    def test_repeated_imports_are_idempotent(self):
        self.live()
        self.run_import()
        before = (self.output.read_bytes(), self.preview.read_bytes())
        self.run_import()
        self.assertEqual(before, (self.output.read_bytes(), self.preview.read_bytes()))

    def test_update_preserves_history_and_performance_only_preserves_portfolio(self):
        self.run_import()
        before = self.public()
        self.live()
        self.csv("returns_daily.csv", ["strategy_id", "date", "return", "equity_curve"], [])
        self.csv("latest_model_portfolio.csv", (self.package / "latest_model_portfolio.csv").read_text().splitlines()[0].split(","), [])
        self.run_import("update", performance_only=True)
        after = self.public()
        for field in ("historicalDaily", "holdings", "rebalances"):
            self.assertEqual(before[field], after[field])
        self.assertAlmostEqual(self.private()["dailyReturns"][-1]["strategy"], 1.188)
        self.run_import("update")
        self.assertEqual(self.public()["holdings"], [])  # Normal portfolio publication still works.

    def test_unavailable_replaces_old_preview_without_backtest_proxy(self):
        self.live()
        self.run_import()
        self.live(False)
        self.run_import("update")
        self.assertEqual(self.private()["performanceStatus"], "unavailable")
        self.assertNotIn("dailyReturns", self.private())

    def test_old_package_without_live_files(self):
        self.run_import()
        self.assertEqual(json.loads(self.preview.read_text()), [])
        self.assertEqual(len(self.public()["historicalDaily"]), 4)

    def test_unavailable_baseline_without_benchmark_is_not_a_composite(self):
        self.live(False)
        self.meta.update(live_inception_date="2024-01-02", latest_live_date="2024-01-02")
        self.meta["data_quality"]["live_inception_date"] = "2024-01-02"
        self.manifest["live_performance"].update(live_inception_date="2024-01-02", latest_live_date="2024-01-02")
        self.json("manifest.json", self.manifest)
        self.json("live_manifest.json", self.meta)
        self.csv("live_nav.csv", ["date", "return", "equity_curve", "nav"], [["2024-01-02", 0, 1, 100]])
        self.csv("live_drawdowns.csv", ["date", "drawdown"], [["2024-01-02", 0]])
        self.run_import()
        self.assertNotIn("dailyReturns", self.private())

    def test_update_replaces_live_instead_of_appending(self):
        self.live()
        self.run_import()
        self.csv("live_nav.csv", ["date", "return", "equity_curve", "nav"], [["2024-01-02", 0, 1, 100], ["2024-01-03", 0, 1, 100], ["2024-01-04", .05, 1.05, 105]])
        self.csv("live_drawdowns.csv", ["date", "drawdown"], [["2024-01-02", 0], ["2024-01-03", 0], ["2024-01-04", 0]])
        self.run_import("update")
        self.assertEqual(len(self.private()["dailyReturns"]), 4)
        self.assertAlmostEqual(self.private()["dailyReturns"][-1]["strategy"], 1.155)

    def test_preserve_published_dates_still_works(self):
        self.run_import()
        dates = [r["date"] for r in self.public()["rebalances"]]
        path = self.package / "rebalance_history.csv"
        text = path.read_text()
        for old in dates:
            text = text.replace(old, "2024-02-01")
        path.write_text(text)
        self.run_import("update", preserve_dates=True)
        self.assertEqual([r["date"] for r in self.public()["rebalances"]], dates)

    def test_missing_history_rejects_update(self):
        self.live()
        with self.assertRaisesRegex(ValueError, "full package"):
            self.run_import("update")
        self.assertFalse(self.output.exists())

    def test_invalid_input_preserves_both_last_valid_files(self):
        mutations = {
            "missing benchmark": lambda: self.csv("live_benchmark.csv", ["date", "return", "equity_curve"], []),
            "nonfinite": lambda: self.csv("live_nav.csv", ["date", "return", "equity_curve", "nav"], [["2024-01-02", "NaN", 1, 100]]),
            "identity": lambda: self.meta.update(strategy_id="other"),
            "stale prices": lambda: self.meta["data_quality"].update(stale_price_symbols=["ABC"]),
            "warnings": lambda: self.meta.update(warnings=["Skipped missing prices"], warning_count=1),
            "missing quality": lambda: self.meta.pop("data_quality"),
            "date mismatch": lambda: self.meta.update(latest_live_date="2024-01-05"),
            "missing file": lambda: (self.package / "live_metrics.json").unlink(),
            "bad date": lambda: self.csv("live_nav.csv", ["date", "return", "equity_curve", "nav"], [["2024-02-30", 0, 1, 100]]),
            "duplicate": lambda: self.csv("live_nav.csv", ["date", "return", "equity_curve", "nav"], [["2024-01-02", 0, 1, 100]]*2),
        }
        self.live()
        self.run_import()
        before = (self.output.read_bytes(), self.preview.read_bytes())
        for name, mutate in mutations.items():
            with self.subTest(name=name):
                self.live()
                mutate()
                self.json("live_manifest.json", self.meta)
                with self.assertRaises((ValueError, FileNotFoundError)):
                    self.run_import()
                self.assertEqual(before, (self.output.read_bytes(), self.preview.read_bytes()))

    def test_missing_transition_and_gap(self):
        from performance import join
        self.live()
        self.run_import()
        history = self.public()["historicalDaily"]
        live = [{**r, "strategy": 1, "benchmark": 1, "strategyReturn": 0, "benchmarkReturn": 0} for r in history[1:]]
        with self.assertRaisesRegex(ValueError, "coverage"):
            join(history[2:], live, "2024-01-02")
        with self.assertRaisesRegex(ValueError, "Gap"):
            join(history, [live[0], live[-1]], "2024-01-02")

    def test_benchmark_scales_independently(self):
        from performance import join
        self.run_import()
        history = self.public()["historicalDaily"]
        history[1]["benchmark"] = 2
        live = [{**history[1], "strategy": 1, "benchmark": 1, "strategyReturn": 0, "benchmarkReturn": 0},
                {**history[2], "strategy": 1.1, "benchmark": .8}]
        result = join(history, live, "2024-01-02")
        self.assertAlmostEqual(result[-1]["strategy"], 1.21)
        self.assertAlmostEqual(result[-1]["benchmark"], 1.6)

    def test_batch_reset_failure_preserves_last_valid(self):
        self.run_import()
        before = self.output.read_bytes()
        package_root = self.root / "batch"
        shutil.copytree(self.package, package_root / "sample" / "strategy-package")
        (package_root / "sample" / "strategy-package" / "returns_daily.csv").unlink()
        with self.assertRaisesRegex(ValueError, "Batch unchanged"):
            import_all_packages(package_root, self.output, reset=True)
        self.assertEqual(before, self.output.read_bytes())


if __name__ == "__main__":
    unittest.main()
