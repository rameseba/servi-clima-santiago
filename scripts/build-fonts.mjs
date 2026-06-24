// Genera la tipografía display self-hosted y optimizada (Bricolage Grotesque).
// Descarga la fuente variable de Google Fonts, la instancia al peso 800 y la
// reduce (subset) a los glifos latinos + español. Resultado: ~19 KB.
// Uso: node scripts/build-fonts.mjs
import subsetFont from "subset-font";
import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = resolve(dirname(fileURLToPath(import.meta.url)), "../site/assets/fonts");
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

// 1) Obtener la URL del woff2 desde la CSS de Google Fonts (Nunito 800)
const cssRes = await fetch(
  "https://fonts.googleapis.com/css2?family=Nunito:wght@800&display=swap",
  { headers: { "User-Agent": UA } }
);
const css = await cssRes.text();
const url = (css.match(/url\((https[^)]+\.woff2)\)/) || [])[1];
if (!url) throw new Error("No se encontró la URL de la fuente en la CSS de Google Fonts");

// 2) Descargar la fuente
const fontBuf = Buffer.from(await (await fetch(url, { headers: { "User-Agent": UA } })).arrayBuffer());

// 3) Glifos a conservar: ASCII imprimible + Latin-1 (acentos español) + signos
let chars = "";
for (let i = 0x20; i <= 0x7e; i++) chars += String.fromCharCode(i);
for (let i = 0xa0; i <= 0xff; i++) chars += String.fromCharCode(i);
chars += "–—‘’“”…·";

// 4) Subset de la fuente, salida woff2
const out = await subsetFont(fontBuf, chars, { targetFormat: "woff2" });
writeFileSync(resolve(OUT, "bricolage-800.woff2"), out);
console.log(`✓ Nunito (guardada como bricolage-800.woff2) — ${Math.round(out.length / 1024)} KB`);
