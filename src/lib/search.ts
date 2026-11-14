// The search page in the browser: Pagefind's JS API with our own results list.
import { format } from "./i18n";

interface PagefindResult {
  data: () => Promise<{
    url: string;
    excerpt: string;
    meta: Record<string, string>;
  }>;
}
interface Pagefind {
  init: () => Promise<void>;
  debouncedSearch: (
    query: string,
  ) => Promise<{ results: PagefindResult[] } | null>;
}

const MAX_RESULTS = 20;

export async function initSearch(
  form: HTMLFormElement,
  status: HTMLElement,
  list: HTMLOListElement,
): Promise<void> {
  const input = form.querySelector<HTMLInputElement>("input");
  if (!input) return;
  const d = form.dataset;
  form.addEventListener("submit", (event) => event.preventDefault());

  let pagefind: Pagefind;
  try {
    pagefind = (await import(
      /* @vite-ignore */ `${d["base"]}pagefind/pagefind.js`
    )) as Pagefind;
    await pagefind.init();
  } catch {
    status.textContent = d["unavailable"] ?? "";
    input.disabled = true;
    return;
  }

  const run = async () => {
    const query = input.value.trim();
    const url = new URL(location.href);
    if (query) url.searchParams.set("q", query);
    else url.searchParams.delete("q");
    history.replaceState(null, "", url);

    if (!query) {
      status.textContent = "";
      list.replaceChildren();
      return;
    }
    const search = await pagefind.debouncedSearch(query);
    if (!search) return; // superseded by a newer keystroke
    const data = await Promise.all(
      search.results.slice(0, MAX_RESULTS).map((r) => r.data()),
    );
    const n = search.results.length;
    status.textContent =
      n === 0
        ? format(d["none"] ?? "", { q: query })
        : n === 1
          ? (d["one"] ?? "")
          : format(d["many"] ?? "", { n });
    list.replaceChildren(
      ...data.map((r) => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = r.url;
        if (r.meta["id"]) {
          const id = document.createElement("span");
          id.className = "nid";
          id.textContent = r.meta["id"];
          a.append(id, " ");
        }
        a.append(r.meta["title"] ?? r.url);
        const p = document.createElement("p");
        p.innerHTML = r.excerpt; // Pagefind escapes the text and adds only <mark>
        li.append(a, p);
        return li;
      }),
    );
  };

  input.addEventListener("input", () => void run());
  const initial = new URL(location.href).searchParams.get("q");
  if (initial) {
    input.value = initial;
    void run();
  }
}
