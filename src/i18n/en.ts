// English interface strings. Every key here must exist in every other
// language (mn.ts is typed against this object, so the type checker enforces it).
// {name} marks a value filled in by format() in src/lib/i18n.ts.
export const en = {
  "site.name": "Degrees of Freedom",
  "site.description":
    "Everything a robot is made of, mapped from first principles to Mars rovers and humanoids. Choose your own path.",
  "site.skip": "Skip to content",
  "nav.label": "Site",
  "nav.menu": "Menu",
  "nav.tree": "Tech tree",
  "nav.search": "Search",
  "theme.toDark": "Dark",
  "theme.toLight": "Light",
  "theme.toDarkLabel": "Switch to the dark theme",
  "theme.toLightLabel": "Switch to the light theme",
  "lang.other": "Монгол",
  "lang.otherLabel": "Read this page in Mongolian",
  "home.eyebrow": "Under construction",
  "home.lead":
    "Everything a robot is made of, mapped from first principles to Mars rovers and humanoids. Choose your own path.",
  "home.status":
    "The tech tree is up: every topic, what it needs and what it unlocks. The pages fill in from here.",
  "home.cta": "Open the tech tree",
  "tiers.label": "The seven tiers, T0 at the bottom",
  "tier.0": "Foundations",
  "tier.1": "Components",
  "tier.2": "Low-level integration",
  "tier.3": "Motion & control",
  "tier.4": "Perception & estimation",
  "tier.5": "Intelligence",
  "tier.6": "Systems & the real world",
  "tree.title": "Tech tree",
  "tree.lead":
    "Every topic in robotics, as seven tiers. Start with T0 Foundations and work up; each topic shows what it needs and what it unlocks.",
  "tree.count": "{n} topics in 7 tiers",
  "tree.tiers": "Tiers",
  "tree.tierCount": "{n} topics",
  "tree.unlocks": "Unlocks",
  "node.needs": "Needs",
  "node.usedBy": "Used by",
  "node.start": "Nothing: a starting point",
  "node.leaf": "Nothing yet",
  "node.stub": "This page is a stub. Its full text comes in a later step.",
  "search.title": "Search",
  "search.lead": "Search every topic in the atlas.",
  "search.label": "Search for",
  "search.one": "1 result",
  "search.many": "{n} results",
  "search.none": "Nothing found for “{q}”.",
  "search.unavailable":
    "Search isn't available here: its index is built with the site (npm run build).",
  "search.noscript":
    "Search needs JavaScript. You can browse the tech tree instead.",
  "footer.license": "Code: MIT. Text: CC BY-SA 4.0.",
  "footer.source": "Source on GitHub",
} as const;

export type MessageKey = keyof typeof en;
