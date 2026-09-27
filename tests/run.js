import assert from "node:assert";
import { expireAt, isExpired } from "../store.js";
import { sweepAll } from "../sweeper.js";
import { render } from "../app.js";

let failed = 0;
function check(name, fn) {
  try { fn(); console.log("ok " + name); } catch (e) { failed += 1; console.log("FAIL " + name + " :: " + e.message); }
}

check("expireAt returns a number", () => {
  assert.strictEqual(typeof expireAt(1, 2), "number");
});

check("isExpired returns a flag", () => {
  assert.strictEqual(typeof isExpired(1, 2), "boolean");
});

check("sweepAll returns removed", () => {
  assert.ok(Array.isArray(sweepAll({ ttl: 1, budget: 1, ticks: [] }).removed));
});

check("render counts events", () => {
  assert.strictEqual(typeof render({ ttl: 1, budget: 1, ticks: [] }).count, "number");
});

check("render exposes alive flag", () => {
  assert.strictEqual(typeof render({ ttl: 1, budget: 1, ticks: [] }).alive_ok, "boolean");
});

console.log("5 cases, " + failed + " failed");
process.exit(failed === 0 ? 0 : 1);
