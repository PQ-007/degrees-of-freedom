import { en, type MessageKey } from "../i18n/en";
import { mn } from "../i18n/mn";

export const languages = ["en", "mn"] as const;
export type Lang = (typeof languages)[number];
export const defaultLang: Lang = "en";

const messages: Record<Lang, Record<MessageKey, string>> = { en, mn };

export function isLang(value: unknown): value is Lang {
  return (
    typeof value === "string" &&
    (languages as readonly string[]).includes(value)
  );
}

export function t(lang: Lang, key: MessageKey): string {
  return messages[lang][key];
}

/** The other complete language, for the header's language link. */
export function otherLang(lang: Lang): Lang {
  return lang === "en" ? "mn" : "en";
}

/**
 * A site URL for `path` (relative to the language root, no leading slash) in
 * `lang`, under the deploy base. Slugs are English in every language, so only
 * the prefix changes.
 */
export function localePath(base: string, lang: Lang, path = ""): string {
  const root = base.endsWith("/") ? base : `${base}/`;
  const rest = path.replace(/^\/+/, "");
  return `${root}${lang}/${rest}`;
}

/**
 * Swap the language prefix of a pathname under `base`, keeping the rest. A page
 * outside any language (the 404) links to the other language's home.
 */
export function switchLang(base: string, pathname: string, to: Lang): string {
  const root = base.endsWith("/") ? base : `${base}/`;
  const inside = pathname.startsWith(root) ? pathname.slice(root.length) : "";
  const [first, ...rest] = inside.split("/");
  const path = isLang(first) ? rest.join("/") : "";
  return localePath(base, to, path);
}
