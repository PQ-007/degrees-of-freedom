// Serves dist/ under /degrees-of-freedom/ the way GitHub Pages does: a folder
// path serves its index.html, a folder without the slash redirects to it, and
// anything missing gets 404.html with status 404.
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const root = new URL("../../dist/", import.meta.url).pathname;
const base = "/degrees-of-freedom/";
const port = Number(process.env.PORT ?? 4329);
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".png": "image/png",
  ".json": "application/json",
  ".xml": "application/xml",
  ".wasm": "application/wasm",
};

async function file(path) {
  try {
    const s = await stat(path);
    return s.isFile() ? path : null;
  } catch {
    return null;
  }
}

createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", "http://localhost");
  const send = async (path, status = 200) => {
    res.writeHead(status, {
      "content-type": types[extname(path)] ?? "application/octet-stream",
    });
    res.end(await readFile(path));
  };
  if (!url.pathname.startsWith(base)) return send(join(root, "404.html"), 404);

  const rel = normalize(
    decodeURIComponent(url.pathname.slice(base.length)),
  ).replace(/^(\.\.[/\\])+/, "");
  const target = join(root, rel);
  const exact = await file(target);
  if (exact) return send(exact);
  const index = await file(join(target, "index.html"));
  if (index && !url.pathname.endsWith("/")) {
    res.writeHead(301, { location: `${url.pathname}/${url.search}` });
    return res.end();
  }
  if (index) return send(index);
  return send(join(root, "404.html"), 404);
}).listen(port, () =>
  console.log(`serving dist/ at http://localhost:${port}${base}`),
);
