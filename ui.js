// ui.js：操作面板与视图（原生 DOM，无弹窗）
import { render } from "./app.js";

export function mount(spec, parts) {
  parts.log.textContent = "存活期 " + (spec.ttl || 0) + "，每次清扫预算 " + (spec.budget || 0)
    + "，事件 " + (spec.ticks || []).length + " 个。";

  function draw() {
    let view = null;
    try {
      view = render(spec);
    } catch (error) {
      parts.out.textContent = String(error && error.code ? error.code : error);
      parts.log.textContent = "跑不动：" + String(error && error.message ? error.message : error);
      return;
    }
    parts.out.textContent = JSON.stringify(view, null, 1);
    parts.stage.textContent = "";
    (spec.ticks || []).forEach(function (now, spot) {
      const key = spot + 1;
      const row = document.createElement("div");
      row.className = "row";
      const head = document.createElement("span");
      head.textContent = "键 " + key + " 写在时刻 " + now;
      row.appendChild(head);
      const mark = document.createElement("span");
      const gone = (view.removed || []).indexOf(key) !== -1;
      const stale = (view.stale || []).indexOf(key) !== -1;
      mark.className = "chip" + (gone ? " bad" : (stale ? " warn" : " ok"));
      mark.textContent = gone ? "已清扫" : (stale ? "陈旧未清" : "还在存活");
      row.appendChild(mark);
      parts.stage.appendChild(row);
    });
    parts.legend.textContent = "清扫 " + view.sweeps + " 次，删掉 " + view.removed_count
      + " 个键，预算用尽 " + view.exhausted + " 次";
    parts.log.textContent = view.count + " 个事件，收尾存活 " + JSON.stringify(view.alive);
  }

  const tickInput = document.createElement("input");
  tickInput.type = "number";
  tickInput.value = "4";
  parts.controls.appendChild(tickInput);

  const runButton = document.createElement("button");
  runButton.className = "primary";
  runButton.textContent = "跑一遍清扫";
  runButton.addEventListener("click", draw);
  parts.controls.appendChild(runButton);

  const addButton = document.createElement("button");
  addButton.textContent = "追加一个时刻";
  addButton.addEventListener("click", function () {
    const next = Number(tickInput.value);
    spec.ticks = (spec.ticks || []).concat([Number.isFinite(next) ? Math.max(0, Math.round(next)) : 0]);
    draw();
  });
  parts.controls.appendChild(addButton);

  const dropButton = document.createElement("button");
  dropButton.textContent = "删最后一个时刻";
  dropButton.addEventListener("click", function () {
    spec.ticks = (spec.ticks || []).slice(0, Math.max(0, (spec.ticks || []).length - 1));
    draw();
  });
  parts.controls.appendChild(dropButton);

  const ttlButton = document.createElement("button");
  ttlButton.textContent = "存活期加一";
  ttlButton.addEventListener("click", function () {
    spec.ttl = (spec.ttl || 1) + 1;
    draw();
  });
  parts.controls.appendChild(ttlButton);

  draw();
}
