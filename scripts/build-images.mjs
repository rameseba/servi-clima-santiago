// Pipeline de optimización de imágenes para ServiClima.
// Genera AVIF + WebP + JPG responsive desde Multimedia/ hacia site/assets/img/,
// más favicons, iconos PWA y la imagen Open Graph.
// Uso: node scripts/build-images.mjs
import sharp from "sharp";
import { mkdir, copyFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = resolve(ROOT, "Multimedia");
const LOGO = resolve(SRC, "Logo");
const OUT = resolve(ROOT, "site/assets/img");
const ICONS = resolve(ROOT, "site");

await mkdir(OUT, { recursive: true });

const NAVY = { r: 12, g: 30, b: 70, alpha: 1 }; // #0c1e46

// Calidad por formato
const AVIF = { quality: 50, effort: 6 };
const WEBP = { quality: 72, effort: 6 };
const JPG = { quality: 78, mozjpeg: true, progressive: true };

sharp.cache(false);
sharp.concurrency(2);

/**
 * Genera versiones responsive (avif/webp/jpg) de una foto.
 * @param {string} src archivo fuente
 * @param {string} name nombre base de salida
 * @param {number[]} widths anchos a generar
 */
async function responsive(src, name, widths, opts = {}) {
  const avif = { ...AVIF, ...(opts.avif || {}) };
  const webp = { ...WEBP, ...(opts.webp || {}) };
  const meta = await sharp(resolve(SRC, src)).metadata();
  const maxW = meta.width;
  const sizes = [...new Set(widths.filter((w) => w <= maxW).concat(Math.min(maxW, Math.max(...widths))))].sort((a, b) => a - b);
  const results = [];
  for (const w of sizes) {
    const base = sharp(resolve(SRC, src)).resize({ width: w, withoutEnlargement: true });
    await base.clone().avif(avif).toFile(resolve(OUT, `${name}-${w}.avif`));
    await base.clone().webp(webp).toFile(resolve(OUT, `${name}-${w}.webp`));
    await base.clone().jpeg(JPG).toFile(resolve(OUT, `${name}-${w}.jpg`));
    results.push(w);
  }
  console.log(`✓ ${name}: ${results.join(", ")} (orig ${meta.width}x${meta.height})`);
  return { name, widths: results, aspect: meta.width / meta.height };
}

// --- Fotos del sitio ---
const photos = [
  // [archivo fuente, nombre, anchos, opts?]
  // El hero es la imagen LCP: se comprime más fuerte para optimizar el rendimiento móvil.
  ["image6_enhanced.png", "hero-split-ladrillo", [480, 768, 1024], { avif: { quality: 38 }, webp: { quality: 62 } }],
  ["electrodomesticos_hero.png", "hero-electrodomesticos", [480, 768, 1024], { avif: { quality: 38 }, webp: { quality: 62 } }],
  ["image8_enhanced.png", "split-ladrillo-cortina", [480, 768, 1024]],
  ["image3_enhanced.png", "tecnico-instalando", [480, 768, 1024]],
  ["instalacion-unidad-nueva.png", "instalacion-unidad-nueva-v2", [480, 768, 1024]],
  ["image0_enhanced.png", "unidades-exteriores-azotea", [480, 768, 1024]],
  ["condensadoras-inverter.png", "condensadoras-inverter-v2", [480, 768, 1024]],
  ["image7_enhanced.png", "split-oficina-ladrillo", [480, 768, 1024]],
  ["image9_enhanced.png", "split-living-ladrillo", [480, 768, 1024]],
  ["image4_enhanced.png", "split-instalado-muro", [480, 768, 1024]],
  ["unidad_funda_lavado.png", "mantencion-funda-lavado", [480, 768, 1024]],
  ["piezas_desarmadas_pasto.png", "mantencion-piezas-desarmadas", [480, 768, 1024]],
  ["evaporador-limpieza.jpeg", "mantencion-evaporador-sucio", [480, 640]],
  ["tecnico-thumbs-up.png", "tecnico-thumbs-up", [480, 768]],
  ["tecnico-reparando-lavadora.jpg", "tecnico-reparando-lavadora", [480, 768]],
  ["servicio-lavadora.png", "servicio-lavadora-v2", [480, 768]],
  ["servicio-refrigerador.png", "servicio-refrigerador-v2", [480, 768]],
  ["servicio-lavadora-secadora.png", "servicio-lavadora-secadora-v2", [480, 768]],
  ["servicio-secadora.png", "servicio-secadora-v2", [480, 768]],
  ["proceso-whatsapp.png", "proceso-whatsapp", [480, 768]],
  ["proceso-cotizacion.png", "proceso-cotizacion", [480, 768]],
  ["proceso-garantia.png", "proceso-garantia", [480, 768]],
];

const manifest = {};
for (const [src, name, widths, opts] of photos) {
  manifest[name] = await responsive(src, name, widths, opts);
}

// --- Logo (header: transparente; footer usa versión blanca) ---
for (const [src, name] of [
  ["logo-circulo-completo-transparente.png", "logo"],
  ["logo-circulo-monocromo-blanco.png", "logo-blanco"],
]) {
  for (const w of [120, 240, 480]) {
    const base = sharp(resolve(LOGO, src)).resize({ width: w, withoutEnlargement: true });
    await base.clone().webp({ quality: 90, effort: 6 }).toFile(resolve(OUT, `${name}-${w}.webp`));
    await base.clone().png({ compressionLevel: 9 }).toFile(resolve(OUT, `${name}-${w}.png`));
  }
  console.log(`✓ ${name}: 120, 240, 480`);
}
// --- Marcas (carrusel) ---
for (const [src, name] of [
  ["brand-lg.png", "brand-lg"],
  ["brand-samsung.png", "brand-samsung"],
  ["brand-midea.png", "brand-midea"],
  ["brand-daikin.png", "brand-daikin"],
  ["brand-mitsubishi.png", "brand-mitsubishi"],
]) {
  for (const w of [120, 240]) {
    const base = sharp(resolve(LOGO, src)).resize({ width: w, withoutEnlargement: true });
    await base.clone().webp({ quality: 90, effort: 6 }).toFile(resolve(OUT, `${name}-${w}.webp`));
    await base.clone().png({ compressionLevel: 9 }).toFile(resolve(OUT, `${name}-${w}.png`));
  }
  console.log(`✓ ${name}: 120, 240`);
}

// --- Favicons (copo transparente: limpio en pestañas claras y oscuras) ---
const flake = resolve(LOGO, "icono-copo-nieve-solo-transparente.png");
for (const s of [16, 32]) {
  await sharp(flake).resize(s, s, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png().toFile(resolve(ICONS, `favicon-${s}x${s}.png`));
}
// favicon.ico ya existe en Logo/: lo copiamos a la raíz del sitio
await copyFile(resolve(LOGO, "favicon.ico"), resolve(ICONS, "favicon.ico"));

// --- Iconos PWA / Apple (copo azul sobre blanco, con padding -> contraste en cualquier fondo) ---
async function maskableIcon(size, outName) {
  const pad = Math.round(size * 0.16);
  const flakeBuf = await sharp(flake).resize(size - pad * 2, size - pad * 2, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } } })
    .composite([{ input: flakeBuf, gravity: "center" }])
    .png().toFile(resolve(ICONS, outName));
}
await maskableIcon(180, "apple-touch-icon.png");
await maskableIcon(192, "android-chrome-192x192.png");
await maskableIcon(512, "android-chrome-512x512.png");
console.log("✓ favicons + iconos PWA");

// --- Open Graph 1200x630 (foto + degradado navy + logo + claim) ---
{
  const W = 1200, H = 630;
  const photo = await sharp(resolve(SRC, "image8_enhanced.png")).resize(W, H, { fit: "cover", position: "right top" }).toBuffer();
  const logoBuf = await sharp(resolve(LOGO, "logo-circulo-monocromo-blanco.png")).resize({ height: 150 }).png().toBuffer();
  const overlay = Buffer.from(
    `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#0c1e46" stop-opacity="0.97"/>
          <stop offset="0.55" stop-color="#0c1e46" stop-opacity="0.92"/>
          <stop offset="1" stop-color="#0c1e46" stop-opacity="0.18"/>
        </linearGradient>
      </defs>
      <rect width="${W}" height="${H}" fill="url(#g)"/>
      <text x="70" y="350" font-family="Arial, Helvetica, sans-serif" font-size="62" font-weight="800" fill="#ffffff">Aire acondicionado</text>
      <text x="70" y="425" font-family="Arial, Helvetica, sans-serif" font-size="62" font-weight="800" fill="#54a0ff">en Santiago</text>
      <text x="72" y="492" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="400" fill="#dbe6ff">Instalación · Mantención · Reparación — Región Metropolitana</text>
    </svg>`
  );
  await sharp(photo)
    .composite([
      { input: overlay, top: 0, left: 0 },
      { input: logoBuf, top: 60, left: 70 },
    ])
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(resolve(ICONS, "og-image.jpg"));
  console.log("✓ og-image.jpg 1200x630");
}

console.log("\nManifest de aspectos:");
for (const [k, v] of Object.entries(manifest)) {
  console.log(`  ${k}  aspect=${v.aspect.toFixed(3)}  widths=[${v.widths.join(",")}]`);
}
