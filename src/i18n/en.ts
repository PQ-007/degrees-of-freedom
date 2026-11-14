// English interface strings. Every key here must exist in every other
// language (mn.ts is typed against this object, so the type checker enforces it).
export const en = {
  "site.name": "Degrees of Freedom",
  "site.description":
    "Everything a robot is made of, mapped from first principles to Mars rovers and humanoids. Choose your own path.",
  "site.skip": "Skip to content",
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
    "The atlas is being built. The tech tree, with every topic and what it needs, comes next.",
  "tiers.label": "The seven tiers, T0 at the bottom",
  "tier.0": "Foundations",
  "tier.1": "Components",
  "tier.2": "Low-level integration",
  "tier.3": "Motion & control",
  "tier.4": "Perception & estimation",
  "tier.5": "Intelligence",
  "tier.6": "Systems & the real world",
  "footer.license": "Code: MIT. Text: CC BY-SA 4.0.",
  "footer.source": "Source on GitHub",
} as const;

export type MessageKey = keyof typeof en;
