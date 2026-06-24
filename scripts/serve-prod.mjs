// Servidor estático que imita el comportamiento de producción (Cloudflare Pages / Netlify):
// compresión Brotli/Gzip para texto y Cache-Control con immutable para assets versionados.
// Uso: node scripts/serve-prod.mjs [puerto]
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";
import { brotliCompressSync, gzipSync } from "node:zlib";

const ROOT = resolve(process.cwd(), "site");
const PORT = Number(process.argv[2]) || 3000;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".avif": "image/avif", ".webp": "image/webp", ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg", ".png": "image/png", ".ico": "image/x-icon",
  ".mp4": "video/mp4", ".webm": "video/webm",
};
const COMPRESSIBLE = new Set([".html", ".css", ".js", ".json", ".webmanifest", ".xml", ".txt", ".svg"]);

createServer(async (req, res) => {
  try {
    let urlPath = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (urlPath.endsWith("/")) urlPath += "index.html";
    const filePath = join(ROOT, normalize(urlPath));
    if (!filePath.startsWith(ROOT)) { res.writeHead(403).end(); return; }

    let body, ext = extname(filePath);
    try {
      body = await readFile(filePath);
    } catch {
      // SPA-ish fallback no aplica; devolvemos 404 simple
      res.writeHead(404, { "Content-Type": "text/plain" }).end("404");
      return;
    }

    const type = TYPES[ext] || "application/octet-stream";
    const headers = { "Content-Type": type, "X-Content-Type-Options": "nosniff" };

    // Cache: HTML revalida; el resto de assets se cachea fuerte (immutable)
    if (ext === ".html" || urlPath.endsWith("webmanifest")) {
      headers["Cache-Control"] = "public, max-age=0, must-revalidate";
    } else {
      headers["Cache-Control"] = "public, max-age=31536000, immutable";
    }

    const accept = req.headers["accept-encoding"] || "";
    if (COMPRESSIBLE.has(ext)) {
      headers["Vary"] = "Accept-Encoding";
      if (/\bbr\b/.test(accept)) { headers["Content-Encoding"] = "br"; body = brotliCompressSync(body); }
      else if (/\bgzip\b/.test(accept)) { headers["Content-Encoding"] = "gzip"; body = gzipSync(body); }
    }

    res.writeHead(200, headers);
    res.end(req.method === "HEAD" ? undefined : body);
  } catch (e) {
    res.writeHead(500).end("500");
  }
}).listen(PORT, () => console.log(`prod-like server en http://localhost:${PORT} (root: ${ROOT})`));
