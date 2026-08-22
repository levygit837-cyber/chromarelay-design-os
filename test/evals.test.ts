import assert from "node:assert/strict";
import test from "node:test";
import { aggregateVotes, createBlindPair, revealWinner } from "../src/evals.js";

test("blind pair removes original candidate labels", () => {
  const pair = createBlindPair({ id: "baseline", payload: { screenshot: "old.png" } }, { id: "candidate", payload: { screenshot: "new.png" } }, true);
  assert.equal(pair.left.id, "A");
  assert.equal(pair.right.id, "B");
  assert.equal(revealWinner(pair, { winner: "left", confidence: "high", reasons: [] }), "candidate");
});

test("vote aggregation requires a strict lead", () => {
  assert.deepEqual(aggregateVotes(["candidate", "candidate", "baseline", "tie"]), { counts: { candidate: 2, baseline: 1 }, ties: 1, winner: "candidate" });
  assert.equal(aggregateVotes(["candidate", "baseline"]).winner, undefined);
});
