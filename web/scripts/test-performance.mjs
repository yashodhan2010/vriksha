import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

function load(name, require = () => { throw new Error("Unexpected dependency"); }, extra = {}) {
  const source = fs.readFileSync(`lib/${name}.ts`, "utf8");
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const sandbox = { exports: {}, require, ...extra };
  vm.runInNewContext(compiled, sandbox);
  return sandbox.exports;
}
const { getPeriodReturns, getPeriodPerformanceSeries } = load("performance-periods");
const { applyBenchmarkComparison, findBenchmarkComparison } = load("benchmark-selection");
const dailyReturns = [
  { date: "2024-01-01", strategy: 1, benchmark: 1, strategyReturn: 0, benchmarkReturn: 0, segment: "Backtest" },
  { date: "2024-01-02", strategy: 1.1, benchmark: 1.2, strategyReturn: .1, benchmarkReturn: .2, segment: "Backtest" },
  { date: "2024-01-03", strategy: .99, benchmark: 1.08, strategyReturn: -.1, benchmarkReturn: -.1, segment: "Live model" },
  { date: "2024-01-04", strategy: 1.188, benchmark: 1.296, strategyReturn: .2, benchmarkReturn: .2, segment: "Live model" },
];
const strategy = { slug: "test", dailyReturns, monthlyReturns: [{ month: "2024-01", strategy: 999, benchmark: 999 }], drawdowns: [{ period: "2024-01-01", drawdown: -99 }] };
const max = getPeriodReturns(strategy).find((p) => p.key === "max");
assert.ok(Math.abs(max.strategy - 18.8) < 1e-8);
assert.ok(Math.abs(max.benchmark - 29.6) < 1e-8);
assert.ok(Math.abs(max.maxDrawdown + 10) < 1e-8);
assert.equal(max.cagr, null);
assert.equal(getPeriodReturns(strategy)[0].strategy, null, "insufficient 1M history cannot fabricate returns");
const series = getPeriodPerformanceSeries(strategy, "max");
assert.equal(series[0].strategy, 100);
assert.ok(Math.abs(series.at(-1).strategy - 118.8) < 1e-8);
assert.equal(series.at(-1).segment, "Live model");

const selectableStrategy = {
  ...strategy,
  benchmark: "NIFTY 500 TRI",
  yearlyReturns: [{ year: "2024", strategy: 18.8, benchmark: 29.6 }],
  benchmarkComparisons: [{
    label: "Gold",
    dailyReturns: dailyReturns.map((point, index) => ({ date: point.date, return: index === 0 ? 0 : .05, equityCurve: 1 + index * .05 })),
    monthlyReturns: [{ month: "2024-01", benchmark: 7 }],
    yearlyReturns: [{ year: "2024", benchmark: 7 }]
  }]
};
const gold = applyBenchmarkComparison(selectableStrategy, "Gold");
assert.equal(findBenchmarkComparison(selectableStrategy, "Gold").label, "Gold");
assert.equal(gold.benchmark, "Gold");
assert.equal(gold.dailyReturns.at(-1).benchmark, 1.15);
assert.equal(gold.monthlyReturns[0].benchmark, 7);
assert.equal(gold.yearlyReturns[0].benchmark, 7);
assert.equal(applyBenchmarkComparison(selectableStrategy, "NIFTY 50"), selectableStrategy);

const windowed = { ...strategy, dailyReturns: [
  { ...dailyReturns[0], date: "2023-12-01", strategy: 3 },
  { ...dailyReturns[0], date: "2024-01-01", strategy: 1 },
  { ...dailyReturns[0], date: "2024-01-02", strategy: 1.1 },
  { ...dailyReturns[0], date: "2024-01-31", strategy: .99 },
  { ...dailyReturns[0], date: "2024-02-01", strategy: 1.2 },
] };
const month = getPeriodReturns(windowed)[0];
assert.ok(Math.abs(month.strategy - 20) < 1e-8);
assert.ok(Math.abs(month.maxDrawdown + 10) < 1e-8, "period drawdown resets peak at period start");

const portfolio = { ...strategy, holdings: [{ symbol: "AAA" }], rebalances: [{ date: "2024-01-01" }] };
const preview = { ...strategy, performanceStatus: "internal_preview", holdings: [], rebalances: [] };
for (const [mode, enabled, expectedReads] of [["production", "1", 0], ["development", undefined, 0], ["development", "1", 1]]) {
  let reads = 0;
  const { withPerformancePreview } = load("performance-preview", (id) => {
    if (id === "server-only") return {};
    if (id === "node:path") return { join: (...parts) => parts.join("/") };
    if (id === "node:fs") return { readFileSync: () => { reads++; return JSON.stringify([preview]); } };
    throw new Error(id);
  }, { process: { cwd: () => "/web", env: { NODE_ENV: mode, VRIKSHA_PERFORMANCE_PREVIEW: enabled } } });
  const result = withPerformancePreview(portfolio);
  assert.equal(reads, expectedReads, "production must not even read private artifacts");
  assert.equal(result.holdings, portfolio.holdings);
  assert.equal(result.rebalances, portfolio.rebalances);
  assert.equal(result.performanceStatus, expectedReads ? "internal_preview" : undefined);
}
console.log("Daily performance and preview isolation tests passed.");
