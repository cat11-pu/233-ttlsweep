// sweeper.js：边写边清扫（基线：一律给空表）
import { expireAt, isExpired } from "./store.js";

export function sweepAll(spec) {
  return { removed: [], removed_count: 0, alive: [], stale: [], sweeps: 0, exhausted: 0 };
}
