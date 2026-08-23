import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";

const sourcePath = path.join(process.cwd(), "lib", "execution-exports.ts");
const source = fs.readFileSync(sourcePath, "utf8");
const transpiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022
  }
}).outputText;

const sandbox = {
  exports: {},
  require(id) {
    if (id === "./types") return {};
    throw new Error(`Unexpected require: ${id}`);
  }
};

vm.runInNewContext(transpiled, sandbox, { filename: sourcePath });

const {
  buildExecutionSubscriptions,
  buildLatestModelPortfolioCsv,
  buildRebalanceHistoryCsv,
  hasActiveSubscriptionForStrategy,
  latestModelPortfolioHeaders,
  rebalanceHistoryHeaders
} = sandbox.exports;

const now = new Date("2026-08-23T00:00:00.000Z").getTime();
const strategy = {
  slug: "low-drawdown-dual-momentum",
  name: "Low Drawdown Dual Momentum",
  holdings: [
    {
      symbol: "AAA",
      company: "AAA Ltd",
      sector: "Financials",
      marketcap: "Large",
      weight: 0.05,
      note: "Selected by model"
    }
  ],
  rebalances: [
    {
      date: "2026-08-14",
      summary: "Latest rebalance",
      changes: [
        { symbol: "AAA", action: "Added", oldWeight: 0, newWeight: 0.05 }
      ]
    }
  ]
};

const activeRows = [
  {
    strategy_slug: strategy.slug,
    status: "active",
    starts_at: "2026-08-01T00:00:00.000Z",
    ends_at: "2026-09-01T00:00:00.000Z"
  }
];

assert.equal(hasActiveSubscriptionForStrategy(activeRows, strategy.slug, now), true);
const normalize = (value) => JSON.parse(JSON.stringify(value));

assert.deepEqual(normalize(buildExecutionSubscriptions([strategy], activeRows, now)), [
  {
    strategy_id: strategy.slug,
    strategy_name: strategy.name,
    status: "active",
    latest_model_as_of: "2026-08-14",
    latest_rebalance_date: "2026-08-14"
  }
]);

const unsubscribedRows = [
  {
    strategy_slug: strategy.slug,
    status: "active",
    starts_at: "2026-07-01T00:00:00.000Z",
    ends_at: "2026-08-01T00:00:00.000Z"
  },
  {
    strategy_slug: "another-strategy",
    status: "active",
    starts_at: "2026-08-01T00:00:00.000Z",
    ends_at: null
  }
];

assert.equal(hasActiveSubscriptionForStrategy(unsubscribedRows, strategy.slug, now), false);
assert.deepEqual(normalize(buildExecutionSubscriptions([strategy], unsubscribedRows, now)), []);

assert.equal(latestModelPortfolioHeaders.join(","), "symbol,company,sector,marketcap,weight,note");
assert.equal(rebalanceHistoryHeaders.join(","), "date,symbol,action,old_weight,new_weight,summary");
assert.equal(buildLatestModelPortfolioCsv(strategy).split("\n")[0], "symbol,company,sector,marketcap,weight,note");
assert.equal(buildRebalanceHistoryCsv(strategy).split("\n")[0], "date,symbol,action,old_weight,new_weight,summary");

console.log("Execution export helper tests passed.");
