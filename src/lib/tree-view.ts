// Browser behaviour of the tech-tree page: the Graph/List switch, and focusing
// a node in the graph (it, what it needs and what it unlocks stay solid; the
// rest fades; lines join them).

const VIEW_KEY = "dof-tree-view";
const SVG_NS = "http://www.w3.org/2000/svg";

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

export function initTreeFocus(
  tree: HTMLElement,
  status: HTMLElement,
  format: Format,
): void {
  const svg = tree.querySelector<SVGSVGElement>("svg.edges");
  const nodes = new Map<string, HTMLElement>();
  for (const el of tree.querySelectorAll<HTMLElement>("a.node[data-id]")) {
    nodes.set(el.dataset["id"] ?? "", el);
  }
  const ids = (el: HTMLElement, key: string) =>
    (el.dataset[key] ?? "").split(" ").filter(Boolean);
  const name = (id: string) => `${id} ${nodes.get(id)?.dataset["title"] ?? ""}`;
  const nothing = tree.dataset["nothing"] ?? "";
  const template = tree.dataset["focusTemplate"] ?? "";

  let current: HTMLElement | null = null;

  const clear = () => {
    current = null;
    tree.classList.remove("focused");
    for (const el of nodes.values()) el.classList.remove("on", "rel");
    svg?.replaceChildren();
    status.textContent = "";
  };

  const focus = (el: HTMLElement) => {
    if (current === el) return;
    clear();
    current = el;
    const needs = ids(el, "needs");
    const unlocks = ids(el, "usedBy");
    tree.classList.add("focused");
    el.classList.add("on");
    for (const id of [...needs, ...unlocks])
      nodes.get(id)?.classList.add("rel");
    draw(el, needs, unlocks);
    status.textContent = format(template, {
      node: name(el.dataset["id"] ?? ""),
      needs: needs.length ? needs.map(name).join(", ") : nothing,
      unlocks: unlocks.length ? unlocks.map(name).join(", ") : nothing,
    });
  };

  // A line from each need into the node, and from the node to what it unlocks
  // (dashed). Needs usually sit in a lower band, so lines leave a need's top
  // edge and enter the node's bottom edge; within one band they arc above.
  const draw = (el: HTMLElement, needs: string[], unlocks: string[]) => {
    if (!svg) return;
    const box = tree.getBoundingClientRect();
    const rect = (e: HTMLElement) => {
      const r = e.getBoundingClientRect();
      return {
        x: r.left - box.left,
        y: r.top - box.top,
        w: r.width,
        h: r.height,
      };
    };
    const path = (from: HTMLElement, to: HTMLElement, cls: string) => {
      const a = rect(from);
      const b = rect(to);
      let d: string;
      if (Math.abs(a.y - b.y) < 4) {
        const ax = a.x + a.w / 2;
        const bx = b.x + b.w / 2;
        const lift = Math.min(40, 14 + Math.abs(ax - bx) / 8);
        d = `M${ax},${a.y} C${ax},${a.y - lift} ${bx},${b.y - lift} ${bx},${b.y}`;
      } else {
        const below = a.y > b.y; // from is lower on the page
        const ax = a.x + a.w / 2;
        const ay = below ? a.y : a.y + a.h;
        const bx = b.x + b.w / 2;
        const by = below ? b.y + b.h : b.y;
        const mid = (ay + by) / 2;
        d = `M${ax},${ay} C${ax},${mid} ${bx},${mid} ${bx},${by}`;
      }
      const p = document.createElementNS(SVG_NS, "path");
      p.setAttribute("d", d);
      p.setAttribute("class", cls);
      svg.append(p);
    };
    for (const id of needs) {
      const from = nodes.get(id);
      if (from) path(from, el, "needs");
    }
    for (const id of unlocks) {
      const to = nodes.get(id);
      if (to) path(el, to, "unlocks");
    }
  };

  for (const el of nodes.values()) {
    el.addEventListener("mouseenter", () => focus(el));
    el.addEventListener("focus", () => focus(el));
  }
  tree.addEventListener("mouseleave", () => {
    if (!tree.contains(document.activeElement)) clear();
  });
  tree.addEventListener("focusout", (event) => {
    if (!tree.contains(event.relatedTarget as Node | null)) clear();
  });
  window.addEventListener("resize", () => {
    if (current) {
      const el = current;
      current = null;
      focus(el);
    }
  });
}
