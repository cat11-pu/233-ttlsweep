// app.js：渲染结果
import { expireAt, isExpired } from "./store.js";
import { sweepAll } from "./sweeper.js";

export function render(spec) {
  const ticks = spec.ticks || [];
  const view = sweepAll(spec);
  const removed = view.removed || [];
  const alive = view.alive || [];
  return { removed: removed, removed_count: view.removed_count || 0, alive: alive,
           stale: view.stale || [], sweeps: view.sweeps || 0, exhausted: view.exhausted || 0,
           count: ticks.length, alive_ok: removed.length + alive.length === ticks.length,
           tail: isExpired(0, 0) ? 1 : 0 };
}
