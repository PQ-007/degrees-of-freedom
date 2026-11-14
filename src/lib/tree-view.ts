// Browser behaviour of the tech-tree page: the Graph/List switch, and the
// focus panel. Selecting a topic marks it and its direct needs and unlocks in
// the bands, and the panel shows Needs → topic → Unlocks plus everything the
// topic builds on. No lines: they crossed rows and hid behind other topics.
import { allNeeds, compareIds } from "./tree";

const VIEW_KEY = "dof-tree-view";

export function initViewSwitch(
  container: HTMLElement,
  buttons: NodeListOf<HTMLButtonElement>,
): void {
  let stored: string | null = null;
  try {
    stored = localStorage.getItem(VIEW_KEY);
  } catch {
    // Storage blocked: fall back to the width-based default.
  }
  const initial =
    stored === "graph" || stored === "list"
      ? stored
      : matchMedia("(max-width: 640px)").matches
        ? "list"
        : "graph";

  const show = (view: string, remember: boolean) => {
    container.dataset["view"] = view;
    for (const b of buttons)
      b.setAttribute("aria-pressed", String(b.dataset["view"] === view));
    if (remember) {
      try {
        localStorage.setItem(VIEW_KEY, view);
      } catch {
        // The choice then lasts for this page only.
      }
    }
  };
  show(initial, false);
  for (const b of buttons)
    b.addEventListener("click", () => show(b.dataset["view"] ?? "graph", true));
}

type Format = (
  template: string,
  values: Record<string, string | number>,
) => string;

export interface PanelNode {
  id: string;
  tier: number;
  title: string;
  summary: string;
  url: string;
  needs: string[];
  usedBy: string[];
}

interface PanelStrings {
  needs: string;
  unlocks: string;
  start: string;
  leaf: string;
  path: string;
  pathCount: string;
  open: string;
  close: string;
  selected: string;
}

const PARAM = "topic";

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  ...children: (Node | string)[]
): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (className) e.className = className;
  e.append(...children);
  return e;
}

function square(tier: number): HTMLElement {
  const sq = el("span", `sq t${tier}`);
  sq.setAttribute("aria-hidden", "true");
  return sq;
}

export function initTreePanel(
  tree: HTMLElement,
  panel: HTMLElement,
  announce: HTMLElement,
  data: { nodes: PanelNode[]; tiers: string[] },
  format: Format,
): void {
  const strings = JSON.parse(panel.dataset["strings"] ?? "{}") as PanelStrings;
  const body = panel.querySelector<HTMLElement>("[data-panel-body]");
  if (!body) return;
  const byId = new Map(data.nodes.map((n) => [n.id, n]));
  const chips = new Map<string, HTMLAnchorElement>();
  for (const a of tree.querySelectorAll<HTMLAnchorElement>("a.node[data-id]")) {
    chips.set(a.dataset["id"] ?? "", a);
  }
  panel.hidden = false;

  const pick = (id: string) => {
    const n = byId.get(id);
    const b = el(
      "button",
      "pick",
      square(n?.tier ?? 0),
      el("span", "nid", id),
      " ",
      n?.title ?? "",
    );
    b.type = "button";
    b.addEventListener("click", () => select(id, true));
    return el("li", undefined, b);
  };

  const flow = (label: string, ids: string[], empty: string, cls: string) => {
    const part = el("div", `flow ${cls}`, el("span", "flow-label", label));
    part.append(
      ids.length
        ? el("ul", undefined, ...ids.map(pick))
        : el("p", "muted", empty),
    );
    return part;
  };

  const clear = () => {
    for (const a of chips.values()) a.classList.remove("on", "need", "unlock");
    body.replaceChildren();
    panel.setAttribute("data-empty", "");
    setParam(null);
  };

  const select = (id: string, fromPanel = false) => {
    const n = byId.get(id);
    if (!n) return clear();
    for (const a of chips.values()) a.classList.remove("on", "need", "unlock");
    chips.get(id)?.classList.add("on");
    for (const x of n.needs) chips.get(x)?.classList.add("need");
    for (const x of n.usedBy) chips.get(x)?.classList.add("unlock");

    const close = el("button", "close", strings.close);
    close.type = "button";
    close.addEventListener("click", () => {
      clear();
      chips.get(id)?.focus();
    });
    const head = el(
      "div",
      "panel-head",
      el("span", "id", square(n.tier), `T${n.tier} · ${n.id}`),
      close,
    );
    const title = el("h2", undefined, n.title);
    title.id = "panel-title";
    title.tabIndex = -1;

    // Everything it builds on, grouped by tier, lowest first.
    const path = [...allNeeds(data.nodes, id)].sort(compareIds);
    const details = el(
      "details",
      undefined,
      el(
        "summary",
        undefined,
        `${strings.path} (${format(strings.pathCount, { n: path.length })})`,
      ),
    );
    for (let tier = 0; tier < data.tiers.length; tier++) {
      const ids = path.filter((x) => byId.get(x)?.tier === tier);
      if (ids.length === 0) continue;
      const line = el(
        "p",
        "path-tier",
        el("span", "id", square(tier), `T${tier}`),
      );
      ids.forEach((x, i) => {
        if (i > 0) line.append(", ");
        const b = el("button", undefined, `${x} ${byId.get(x)?.title ?? ""}`);
        b.type = "button";
        b.addEventListener("click", () => select(x, true));
        line.append(b);
      });
      details.append(line);
    }

    const open = el("a", "btn primary small open", strings.open);
    open.href = n.url;

    body.replaceChildren(
      head,
      title,
      el("p", "panel-summary", n.summary),
      flow(strings.needs, n.needs, strings.start, "needs"),
      el("span", "arrow", "↓"),
      el("div", "this", square(n.tier), el("span", "nid", n.id), " ", n.title),
      el("span", "arrow", "↓"),
      flow(strings.unlocks, n.usedBy, strings.leaf, "unlocks"),
      ...(path.length ? [details] : []),
      open,
    );
    panel.removeAttribute("data-empty");
    panel.scrollTop = 0;
    setParam(id);
    announce.textContent = format(strings.selected, {
      node: `${n.id} ${n.title}`,
    });
    // From inside the panel, keep keyboard focus there (the button just clicked is gone).
    if (fromPanel) title.focus();
  };

  const setParam = (id: string | null) => {
    const url = new URL(location.href);
    if (id) url.searchParams.set(PARAM, id);
    else url.searchParams.delete(PARAM);
    history.replaceState(null, "", url);
  };

  // A plain click selects; a modified click (new tab, etc.) still follows the link.
  for (const [id, a] of chips) {
    a.addEventListener("click", (event) => {
      if (
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        event.button !== 0
      )
        return;
      event.preventDefault();
      if (a.classList.contains("on")) clear();
      else select(id);
    });
  }
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !panel.hasAttribute("data-empty")) {
      const current = [...chips.entries()].find(([, a]) =>
        a.classList.contains("on"),
      );
      clear();
      current?.[1].focus();
    }
  });

  const initial = new URL(location.href).searchParams.get(PARAM);
  if (initial && byId.has(initial)) select(initial);
}
