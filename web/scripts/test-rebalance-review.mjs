import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";

const sourcePath = path.join(process.cwd(), "lib", "rebalance-review.ts");
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
  buildRebalanceReviewModel,
  classifyWeightChange,
  getReviewProgress
} = sandbox.exports;

assert.equal(classifyWeightChange(0, 0.04), "ADDED");
assert.equal(classifyWeightChange(0.04, 0), "EXITED");
assert.equal(classifyWeightChange(0.03, 0.05), "INCREASED");
assert.equal(classifyWeightChange(0.05, 0.03), "REDUCED");
assert.equal(classifyWeightChange(0.050000001, 0.050000002), "UNCHANGED");

const baseStrategy = {
  slug: "bamboo-test",
  holdings: [
    { symbol: "AAA", company: "AAA Ltd", sector: "Financials", marketcap: "Large", weight: 0.04, note: "Published note" },
    { symbol: "BBB", company: "BBB Ltd", sector: "Technology", marketcap: "Large", weight: 0.03, note: "" }
  ],
  rebalances: [
    {
      date: "2026-08-14",
      summary: "Test rebalance",
      changes: [
        { symbol: "AAA", oldWeight: 0, newWeight: 0.04, action: "Added" },
        { symbol: "OLD", oldWeight: 0.02, newWeight: 0, action: "Removed" }
      ]
    }
  ]
};

const model = buildRebalanceReviewModel(baseStrategy, baseStrategy.rebalances[0]);
assert.equal(model.counts.ADDED, 1);
assert.equal(model.counts.EXITED, 1);
assert.equal(model.counts.UNCHANGED, 1);
assert.equal(model.changedItems.length, 2);

const progress = getReviewProgress([model.changedItems[0].id], model.changedItems);
assert.equal(progress.reviewedCount, 1);
assert.equal(progress.totalCount, 2);
assert.equal(progress.complete, false);

const complete = getReviewProgress(model.changedItems.map((item) => item.id), model.changedItems);
assert.equal(complete.complete, true);

const initialStrategy = {
  ...baseStrategy,
  rebalances: [{ date: "2026-08-14", summary: "Initial", changes: [] }]
};
assert.equal(buildRebalanceReviewModel(initialStrategy, initialStrategy.rebalances[0]).isInitialPublication, true);

const noChangeStrategy = {
  ...baseStrategy,
  rebalances: [
    { date: "2026-08-14", summary: "No changes", changes: [] },
    { date: "2026-07-31", summary: "Prior", changes: [] }
  ]
};
const noChange = buildRebalanceReviewModel(noChangeStrategy, noChangeStrategy.rebalances[0]);
assert.equal(noChange.changedItems.length, 0);
assert.equal(noChange.counts.UNCHANGED, 2);

console.log("Rebalance review helper tests passed.");
