import { describe, expect, it } from "vitest";
import { en } from "../../src/i18n/en";
import { mn } from "../../src/i18n/mn";
import { format, localePath, otherLang, switchLang } from "../../src/lib/i18n";

const base = "/degrees-of-freedom/";

describe("interface strings", () => {
  it("Mongolian has exactly the English keys", () => {
    expect(Object.keys(mn).sort()).toEqual(Object.keys(en).sort());
  });

  it("no string is empty", () => {
    for (const [lang, messages] of Object.entries({ en, mn })) {
      for (const [key, value] of Object.entries(messages)) {
        expect(value.trim(), `${lang}: "${key}" is empty`).not.toBe("");
      }
    }
  });

  // Names and codes stay in Latin letters; everything else should be translated.
  const sameInBoth = new Set(["site.name", "nav.tree", "tree.title"]);
  it("Mongolian strings are translated", () => {
    for (const key of Object.keys(en) as (keyof typeof en)[]) {
      if (sameInBoth.has(key)) continue;
      expect(mn[key], `mn: "${key}" is still the English text`).not.toBe(
        en[key],
      );
    }
  });
});

describe("locale paths", () => {
  it("builds a path under the base", () => {
    expect(localePath(base, "en")).toBe("/degrees-of-freedom/en/");
    expect(localePath(base, "mn", "tree/")).toBe(
      "/degrees-of-freedom/mn/tree/",
    );
    expect(localePath("/", "en", "/node/pid-control/")).toBe(
      "/en/node/pid-control/",
    );
  });

  it("swaps only the language prefix", () => {
    expect(switchLang(base, "/degrees-of-freedom/en/", "mn")).toBe(
      "/degrees-of-freedom/mn/",
    );
    expect(
      switchLang(base, "/degrees-of-freedom/mn/node/pid-control/", "en"),
    ).toBe("/degrees-of-freedom/en/node/pid-control/");
  });

  it("sends pages outside a language (the 404) to the language home", () => {
    expect(switchLang(base, "/degrees-of-freedom/404/", "mn")).toBe(
      "/degrees-of-freedom/mn/",
    );
    expect(switchLang(base, "/elsewhere/", "mn")).toBe(
      "/degrees-of-freedom/mn/",
    );
  });

  it("the other language of each is the other one", () => {
    expect(otherLang("en")).toBe("mn");
    expect(otherLang("mn")).toBe("en");
  });
});

describe("format", () => {
  it("fills placeholders and leaves unknown ones", () => {
    expect(format("{n} results for {q}", { n: 3, q: "PID" })).toBe(
      "3 results for PID",
    );
    expect(format("{n} of {total}", { n: 1 })).toBe("1 of {total}");
  });

  it("both languages use the same placeholders", () => {
    const names = (s: string) =>
      [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
    for (const key of Object.keys(en) as (keyof typeof en)[]) {
      expect(names(mn[key]), `mn: "${key}"`).toEqual(names(en[key]));
    }
  });
});
