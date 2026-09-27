// sweeper.js：边写边清扫
import { expireAt, isExpired } from "./store.js";

function fail(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

export function sweepAll(spec) {
  const { ttl, budget, ticks } = spec || {};
  if (!Number.isInteger(ttl) || ttl <= 0 || !Number.isInteger(budget) || budget <= 0) {
    throw fail("E_BAD_PARAM", "ttl and budget must be positive integers");
  }
  const list = ticks || [];
  const removed = [];
  const keys = [];
  const expires = [];
  let head = 0;
  let prev = -Infinity;
  let last = 0;
  let sweeps = 0;
  let exhausted = 0;
  for (let i = 0; i < list.length; i += 1) {
    const now = list[i];
    if (now < prev) throw fail("E_TIME_BACK", "ticks must be non-decreasing");
    prev = now;
    last = now;
    keys.push(i + 1);
    expires.push(expireAt(now, ttl));
    sweeps += 1;
    let left = budget;
    while (head < keys.length && left > 0 && isExpired(expires[head], now)) {
      removed.push(keys[head]);
      head += 1;
      left -= 1;
    }
    if (left === 0 && head < keys.length) exhausted += 1;
  }
  const alive = keys.slice(head);
  const stale = [];
  for (let j = head; j < keys.length; j += 1) {
    if (isExpired(expires[j], last)) stale.push(keys[j]);
  }
  return { removed, removed_count: removed.length, alive, stale, sweeps, exhausted };
}
