# HANDOFF — ServiClima Santiago (léeme antes de editar)

> Documento de traspaso para el siguiente agente/desarrollador. Resume el estado del
> proyecto, **qué NO romper** y cómo construir, verificar y desplegar. Si vas a hacer
> cambios, lee primero la sección "Reglas que NO debes romper".

## Qué es

Landing page **estática** (HTML/CSS/JS, sin framework ni backend) para **ServiClima**,
empresa de aire acondicionado en la Región Metropolitana de Santiago, Chile.
Objetivo del cliente: publicarla en Google + invertir en Google Ads.

- **Carpeta que se publica:** `site/` (es la raíz del sitio).
- **Fuentes (NO se publican):** `Multimedia/` (fotos/videos/logo reales del cliente),
  `Diseño/` (referencias de diseño), `scripts/` (build), `key.txt` / `.env.local` (secretos).
- **En vivo:** https://serviclimasantiago.cl y https://www.serviclimasantiago.cl
  (Cloudflare Pages, proyecto `serviclima`, también en https://serviclima.pages.dev).

## Estado actual (todo funcionando)

- ✅ **Lighthouse 100 / 100 / 100 / 100** (Rendimiento, Accesibilidad, Buenas Prácticas, SEO)
  en móvil y escritorio, medido en local con el servidor tipo-producción.
- ✅ Desplegado en Cloudflare Pages; dominio apex + www activos con SSL.
- ✅ Rediseño visual aplicado (concepto "Del calor al confort").
- ✅ Página de Política de Privacidad (`/privacidad`) enlazada en el footer.
- ⏳ **Pendiente (requiere datos del cliente):** ver "Tareas pendientes".

---

## Reglas que NO debes romper (sostienen el 100 de Lighthouse)

1. **Tipografía display = UN solo archivo, sin preload.**
   `site/assets/fonts/bricolage-800.woff2` (~19 KB, Bricolage Grotesque instanciada a peso 800
   + subset). El `@font-face` declara `font-weight:700 800` apuntando a ese único archivo, con
   `font-display:swap` y un `@font-face "Bricolage Fallback"` con `size-adjust` (mantiene CLS ≈ 0).
   - ❌ NO la precargues (`<link rel=preload as=font>`): compite con la imagen LCP y baja el
     Performance móvil a 95–98.
   - ❌ NO uses la fuente variable completa (75 KB) ni agregues más pesos.
   - Para regenerarla: `npm run build:fonts`.

2. **Imagen LCP (hero) debe seguir liviana.** `hero-split-ladrillo` se genera con AVIF calidad 38
   (ya configurado en `scripts/build-images.mjs`). En móvil se sirve la variante de 480px gracias
   al atributo `sizes="(max-width:900px) 56vw, 46vw"`. No subas la calidad ni el tamaño servido.

3. **CSS dividido a propósito:** crítico inline en `site/index.html` (`<style>`) + el resto en
   `site/assets/css/styles.css`, cargado diferido con `media="print" onload="this.media='all'"`.
   No vuelvas a meter todo el CSS inline (sube el peso del HTML y empeora el FCP móvil).

4. **Imágenes responsive obligatorias.** Toda `<img>` usa `<picture>` con AVIF + WebP + JPG y
   atributos `width`/`height` (evita CLS) y `loading="lazy"` salvo el hero. **Imágenes nuevas
   deben pasar por** `scripts/build-images.mjs` (agrega la entrada y corre `npm run build:img`).
   Las fuentes están en `Multimedia/`.

5. **Contraste AA (Accesibilidad 100).** El verde de WhatsApp es `--wa:#0a7d3a` (oscurecido a
   propósito para pasar AA; NO el verde de marca #25D366). El acento ámbar `--ember:#FF6A3D`
   **nunca** se usa como texto sobre blanco (solo decorativo / barra gradiente). Azul de acción:
   `--azure:#1564D6`. Si cambias colores de texto, verifica contraste ≥ 4.5:1.

6. **Cero errores de consola (Buenas Prácticas 100).** No agregues scripts que lancen errores.
   Enlaces externos siempre con `rel="noopener noreferrer"`.

7. **Verifica con el servidor tipo-producción, NO con `serve` plano:**
   `node scripts/serve-prod.mjs 3000` (aplica Brotli + cache, igual que Cloudflare). Con un
   servidor sin compresión, Lighthouse da falsos negativos de rendimiento.

8. **Contacto = SOLO WhatsApp, sin backend.** Número `+56 9 4893 0381` = `56948930381`.
   Aparece en `site/index.html` (enlaces `wa.me/...`) y en `site/assets/js/main.js` (constante
   `WA`). El formulario NO envía a un servidor: arma un mensaje de WhatsApp (función del form en
   `main.js`). Todos los botones de WhatsApp llevan `data-wa` (dispara el evento de conversión).

9. **No publiques datos que el negocio no tiene:** dirección física, RUT, email, ni reseñas
   inventadas (decisión del cliente, por honestidad y buenas prácticas). La sección de reseñas se
   omitió a propósito; usar el bloque de confianza/marcas en su lugar.

10. **Ícono de WhatsApp = sprite.** Está definido una vez como `<symbol id="ico-wa">` al inicio
    del `<body>` y se reusa con `<svg><use href="#ico-wa"></use></svg>`. No vuelvas a pegar paths
    sueltos.

---

## Estructura

```
site/                          # raíz publicable
  index.html                   # página principal: CSS crítico inline, JSON-LD, sprite WA
  privacidad.html              # política de privacidad (URL pública: /privacidad)
  assets/css/styles.css        # CSS no crítico (diferido)
  assets/js/main.js            # nav móvil, form→WhatsApp, lightbox, video, conversión
  assets/fonts/bricolage-800.woff2
  assets/img/                  # AVIF+WebP+JPG responsive (generado)
  assets/video/                # demo-1/demo-2 mp4+webm+poster (solo demo-1 se usa)
  favicon*, apple-touch-icon, android-chrome-*, og-image.jpg
  site.webmanifest, robots.txt, sitemap.xml
  _headers                     # cache-control para Cloudflare Pages/Netlify
scripts/
  build-images.mjs             # genera assets/img desde Multimedia/  (npm run build:img)
  build-fonts.mjs              # genera la fuente subset           (npm run build:fonts)
  serve-prod.mjs               # servidor local Brotli+cache       (npm run serve)
.env.local                     # CLOUDFLARE_API_TOKEN, ACCOUNT_ID, CONVEX_TOKEN (NO subir)
README.md                      # guía de despliegue + Google Ads + GSC
```

## Comandos

```bash
npm install                      # sharp + subset-font (una vez)
node scripts/serve-prod.mjs 3000 # ver en http://localhost:3000 (igual que producción)
npm run build:img                # regenerar imágenes (tras cambiar fotos en Multimedia/)
npm run build:fonts              # regenerar la fuente display
```

### Desplegar a Cloudflare Pages

Credenciales en `.env.local`. Token con permisos Pages + DNS edit ya configurado.
```bash
# (carga el .env.local primero; export CLOUDFLARE_API_TOKEN y CLOUDFLARE_ACCOUNT_ID)
npx wrangler pages deploy site --project-name=serviclima --branch=main --commit-dirty=true
```

### Verificar Lighthouse (objetivo 100x4)
```bash
npx lighthouse http://localhost:3000/ --chrome-flags="--headless=new" \
  --only-categories=performance,accessibility,best-practices,seo --view          # móvil
# agrega --preset=desktop para escritorio
```
Nota: el LCP queda en ~0.98 (borde). Es normal y redondea a 100. Medido sobre el dominio en vivo
desde una conexión residencial puede dar 98–99 por la latencia de red del tester; PageSpeed
Insights (infra de Google) debería dar 100.

---

## Infraestructura / dominio

- **Cloudflare Pages**, proyecto `serviclima`. Cuenta y token en `.env.local`.
- **DNS** (zona `serviclimasantiago.cl` en Cloudflare): dos CNAME *proxied* → `serviclima.pages.dev`
  - apex `serviclimasantiago.cl` (CNAME-flattening) y `www`. Ambos activos con SSL.
- **Nameservers** en NIC Chile ya apuntan a Cloudflare (`desi.ns.cloudflare.com`, `sam.ns.cloudflare.com`).
- Cloudflare Pages sirve URLs **sin** `.html` (redirige `/privacidad.html` → `/privacidad`).
  Por eso los enlaces internos y el sitemap usan `/privacidad`.

---

## Tareas pendientes (necesitan datos del cliente)

1. **Google Search Console (verificación):** el cliente debe crear la propiedad tipo *Dominio*
   en Search Console y entregar el registro **TXT** `google-site-verification=...`. Luego se crea
   ese TXT en el DNS de Cloudflare (el token tiene permiso DNS edit) vía API o panel.

2. **Google Ads — Google tag:** el tracking de conversión por clic a WhatsApp YA está cableado
   en `main.js` (función `trackWhatsApp`, eventos en `dataLayer`). Falta pegar el Google tag real
   en el `<head>` de `index.html` con el ID de conversión `AW-XXXXXXXXX/ETIQUETA`. Snippet exacto
   en `README.md` → sección "Google Ads". (Agregar el tag baja un poco el Performance: es un
   script de terceros esperado; el cliente lo asume para medir campañas.)

3. **(Opcional, SEO) Redirección www → apex.** Hoy apex y www sirven lo mismo (la canónica
   declarada es el apex `serviclimasantiago.cl`). Para unificar, crear `site/_redirects` con:
   ```
   https://www.serviclimasantiago.cl/*  https://serviclimasantiago.cl/:splat  301
   ```
   y redesplegar. No se hizo aún (pendiente de confirmación del cliente).

## Si vas a hacer cambios de diseño

El sistema de diseño (tokens de color, tipografía, espaciados) está en el `<style>` crítico de
`site/index.html` (`:root { --navy, --azure, --ember, --wa, ... }`). Concepto: navy/azul "frío"
con acento ámbar "cálido" usado con disciplina; barra gradiente cálido→frío bajo cada eyebrow es
el motivo de firma. Mantén la coherencia y respeta las "Reglas que NO debes romper".
