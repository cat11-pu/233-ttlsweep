// sweeper.js：边写边惰性清扫。键按写入顺序升序检查，遇到未到期键立刻停手。
import { expireAt, isExpired } from "./store.js";

function isPositiveInteger(value) {
  return Number.isInteger(value) && value > 0;
}

function fail(code, message) {
  const error = new Error(message);
  error.code = code;
  throw error;
}

export function sweepAll(spec) {
  const ttl = spec && spec.ttl;
  const budget = spec && spec.budget;
  const ticks = Array.isArray(spec && spec.ticks) ? spec.ticks : [];

  if (!isPositiveInteger(ttl) || !isPositiveInteger(budget)) {
    fail("E_BAD_PARAM", "ttl and budget must be positive integers");
  }

  const removed = [];
  const count = ticks.length;
  // 键号即事件序号（从 1 起），到期时刻随写入时刻单调不减，只需一个队头指针。
  const expires = new Array(count);
  let head = 0;
  let sweeps = 0;
  let exhausted = 0;
  let prev = null;
  let now = 0;

  for (let i = 0; i < count; i += 1) {
    now = ticks[i];
    if (prev !== null && now < prev) {
      fail("E_TIME_BACK", "event time must not roll back");
    }
    prev = now;

    // 写入新键，再清扫一趟。
    expires[i] = expireAt(now, ttl);
    let remaining = budget;
    while (remaining > 0 && head <= i) {
      if (!isExpired(expires[head], now)) break;
      removed.push(head + 1);
      head += 1;
      remaining -= 1;
    }
    sweeps += 1;
    // 预算花完且还有没检查到的键，才算一趟预算用尽。
    if (remaining === 0 && head <= i) exhausted += 1;
  }

  const alive = [];
  const stale = [];
  for (let j = head; j < count; j += 1) {
    const key = j + 1;
    alive.push(key);
    if (isExpired(expires[j], now)) stale.push(key);
  }

  return {
    removed: removed,
    removed_count: removed.length,
    alive: alive,
    stale: stale,
    sweeps: sweeps,
    exhausted: exhausted
  };
}
