import fs from "node:fs";
import { expireAt, isExpired } from "./store.js";
import { sweepAll } from "./sweeper.js";
import { render } from "./app.js";

// 验收断言：上面每条值收进 emit，最后与期望值逐项比对，不符就非零退出。
const __lines = [];
function emit(label, value) { __lines.push([String(label).replace(/ =$/, ""), value]); }


const spec = JSON.parse(fs.readFileSync(process.argv[2] || "sample/ticks.json", "utf8"));
const view = render(spec);

emit("删除键序列 =", JSON.stringify(view.removed));
emit("删除总数 =", view.removed_count);
emit("收尾存活键列表 =", JSON.stringify(view.alive));
emit("收尾陈旧键列表 =", JSON.stringify(view.stale));
emit("清扫次数 =", view.sweeps);
emit("预算用尽次数 =", view.exhausted);
emit("事件数 =", view.count);
emit("存活复核 =", view.alive_ok);
emit("到期判定样例 =", view.tail);


// ---- 异常路径探针：真调用实现，看它报出什么码（不是从样例里抄）----
try {
  sweepAll({ ttl: 1, budget: 1, ticks: [2, 1] });
  emit("时间倒流写错的错误码", "没有报错");
} catch (error) {
  emit("时间倒流写错的错误码", error && error.code ? error.code : String(error.message));
}
try {
  sweepAll({ ttl: 0, budget: 1, ticks: [] });
  emit("参数写错的错误码", "没有报错");
} catch (error) {
  emit("参数写错的错误码", error && error.code ? error.code : String(error.message));
}


// ---- 期望值（参考模型算出，与题面给的验收数值一致）----
const EXPECTED = {
  "删除键序列": [
    1,
    2
  ],
  "删除总数": 2,
  "收尾存活键列表": [
    3,
    4,
    5
  ],
  "收尾陈旧键列表": [
    3
  ],
  "清扫次数": 5,
  "预算用尽次数": 2,
  "事件数": 5,
  "存活复核": true,
  "到期判定样例": 1,
  "时间倒流写错的错误码": "E_TIME_BACK",
  "参数写错的错误码": "E_BAD_PARAM"
};
// 有的值在收进来之前已经 stringify 过，比较前先试着解析回来，避免类型错配把正确实现判成不过。
function __same(got, want) {
  if (typeof got === "string") {
    try { const parsed = JSON.parse(got); if (JSON.stringify(parsed) === JSON.stringify(want)) return true; } catch (error) { /* 不是 JSON 就按原文比 */ }
  }
  return JSON.stringify(got) === JSON.stringify(want);
}
let __bad = 0;
for (const [label, want] of Object.entries(EXPECTED)) {
  const found = __lines.find((pair) => pair[0] === label);
  if (!found) { __bad += 1; console.log("缺失验收项 " + label); continue; }
  const got = found[1];
  if (__same(got, want)) { console.log("一致 " + label + " = " + JSON.stringify(got)); }
  else { __bad += 1; console.log("不一致 " + label + " 期望 " + JSON.stringify(want) + " 实际 " + JSON.stringify(got)); }
}
console.log("验收项 " + (Object.keys(EXPECTED).length - __bad) + "/" + Object.keys(EXPECTED).length + " 通过");
process.exit(__bad === 0 ? 0 : 1);
