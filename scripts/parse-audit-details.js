import { readFileSync } from "node:fs";

try {
  const html = readFileSync("c:\\Users\\RAMESEBA\\Documents\\servi-clima-santiago-cl\\localhost_2026-06-23_20-46-52.report.html", "utf-8");
  
  // Buscar dónde está "color-contrast"
  let pos = -1;
  while ((pos = html.indexOf('"color-contrast"', pos + 1)) !== -1) {
    console.log(`Encontrado "color-contrast" en posición ${pos}`);
    // Imprimir 1000 caracteres desde esta posición
    const snippet = html.substring(pos, pos + 2500);
    console.log("--- Fragmento ---");
    console.log(snippet);
    console.log("-----------------");
  }
} catch (e) {
  console.error(e);
}
