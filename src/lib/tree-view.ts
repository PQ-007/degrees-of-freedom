// Browser behaviour of the tech-tree page: one tier at a time.
//
// The URL hash says what to show: "#T3" a tier, "#M5" a topic (its tier opens
// and its card is scrolled to and marked). Rail steps, the previous/next
// buttons and the Needs/Unlocks chips on cards are all plain #anchors, so the
// page also works without JS (every tier shows); here they switch tiers.

const TIER = /^T\d$/;
const TOPIC = /^[FCLMPIS]\d+$/;

export function initTierSteps(tree: HTMLElement): void {
  const sections = new Map<string, HTMLElement>();
  for (const s of tree.querySelectorAll<HTMLElement>("section[data-tier]")) {
    sections.set(s.dataset["tier"] ?? "", s);
  }
  const steps = [
    ...tree.querySelectorAll<HTMLAnchorElement>(".rail a[data-step]"),
  ];
  const first = steps[0]?.dataset["step"] ?? "T0";

  const tierOf = (id: string): string | null => {
    if (TIER.test(id) && sections.has(id)) return id;
    if (TOPIC.test(id)) {
      const card = document.getElementById(id);
      return (
        card?.closest<HTMLElement>("section[data-tier]")?.dataset["tier"] ??
        null
      );
    }
    return null;
  };

  const showTier = (tier: string) => {
    for (const [id, s] of sections) s.classList.toggle("current", id === tier);
    for (const a of steps) {
      if (a.dataset["step"] === tier) a.setAttribute("aria-current", "step");
      else a.removeAttribute("aria-current");
    }
  };

  let flashed: HTMLElement | null = null;

  /** Show what `target` names; `moveFocus` after a click, not on page load. */
  const go = (target: string, moveFocus: boolean) => {
    const tier = tierOf(target) ?? first;
    showTier(tier);
    flashed?.classList.remove("flash");
    flashed = null;
    const section = sections.get(tier);
    if (TOPIC.test(target)) {
      const card = document.getElementById(target);
      if (card) {
        card.classList.add("flash");
        flashed = card;
        card.scrollIntoView({ block: "start" });
        if (moveFocus)
          card
            .querySelector<HTMLElement>("h3 a")
            ?.focus({ preventScroll: true });
      }
    } else if (section) {
      const top = tree.getBoundingClientRect().top + window.scrollY - 80;
      if (window.scrollY > top) window.scrollTo({ top });
      if (moveFocus)
        section
          .querySelector<HTMLElement>("h2")
          ?.focus({ preventScroll: true });
    }
  };

  tree.addEventListener("click", (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
      return;
    const a = (event.target as Element).closest<HTMLAnchorElement>(
      "a[data-step], a[data-jump]",
    );
    if (!a) return;
    const target = a.dataset["step"] ?? a.dataset["jump"] ?? "";
    event.preventDefault();
    history.pushState(null, "", `#${target}`);
    go(target, true);
  });
  window.addEventListener("popstate", () => go(location.hash.slice(1), false));

  go(location.hash.slice(1), false);
}
