# ServiClima Santiago — Sitio web

> 🛠️ **¿Vas a editar el proyecto? Lee primero [`HANDOFF.md`](HANDOFF.md)** — contiene las reglas
> que NO debes romper (sostienen el Lighthouse 100/100/100/100) y el estado completo.

Landing page estática de alto rendimiento para **ServiClima** (instalación, mantención y
reparación de aire acondicionado en la Región Metropolitana, Santiago de Chile).

Resultado **Lighthouse 100 / 100 / 100 / 100** (Rendimiento, Accesibilidad, Buenas Prácticas y
SEO), tanto en móvil como en escritorio.

---

## Estructura

```
site/                     ← ESTO es lo que se publica (la raíz del sitio)
  index.html              página única (CSS crítico inline + JSON-LD)
  assets/
    css/styles.css        estilos no críticos (carga diferida)
    js/main.js            JS mínimo: menú móvil, formulario→WhatsApp, video diferido
    img/                  imágenes optimizadas (AVIF + WebP + JPG, responsive)
    video/                videos comprimidos (mp4 + webm) + posters
  favicon.ico, favicon-*.png, apple-touch-icon.png, android-chrome-*.png
  site.webmanifest, robots.txt, sitemap.xml, og-image.jpg
  _headers                cache headers para Cloudflare Pages / Netlify

scripts/
  build-images.mjs        regenera todas las imágenes optimizadas desde Multimedia/
  serve-prod.mjs          servidor local con Brotli + cache (imita producción)

Multimedia/  Diseño/      material fuente del cliente (NO se publican)
```

## Ver el sitio localmente

```bash
node scripts/serve-prod.mjs 3000     # servidor tipo producción (Brotli + cache)
# abre http://localhost:3000
```

> `serve-prod.mjs` comprime el HTML/CSS/JS y aplica los mismos headers de cache que tendrá en
> producción, por eso el Lighthouse local coincide con el real.

## Regenerar imágenes (solo si cambian las fotos fuente)

```bash
npm install            # instala sharp (una vez)
npm run build:img      # regenera site/assets/img desde Multimedia/
```

Los videos se comprimieron con **ffmpeg** (ver historial); para rehacerlos, recomprimir a
H.264 + WebM y extraer un poster JPG en `site/assets/video/`.

---

## Publicar (deploy)

El sitio es 100% estático: se sube la carpeta `site/`. Opciones gratis recomendadas:

- **Cloudflare Pages**: nuevo proyecto → "Direct Upload" → arrastra la carpeta `site/`.
  (o conecta el repo y define el directorio de salida `site`). Respeta `_headers`.
- **Netlify**: arrastra la carpeta `site/` en https://app.netlify.com/drop. Respeta `_headers`.

Luego, en el panel del proveedor, apunta el dominio **serviclimasantiago.cl** al proyecto.

## Cambiar datos clave

- **Número de WhatsApp** (`+56 9 8383 2944`): está como `56983832944`.
  - En `site/index.html`: buscar y reemplazar `56983832944`.
  - En `site/assets/js/main.js`: variable `WA` (arriba del archivo).
- **Dominio** (`serviclimasantiago.cl`): buscar y reemplazar `serviclimasantiago.cl` en
  `site/index.html`, `site/robots.txt` y `site/sitemap.xml`.
- **Horario / cobertura / comunas**: editar directamente el texto en `site/index.html`.

---

## Tipografía

El título y los textos destacados usan **Bricolage Grotesque** self-hosteada en
`site/assets/fonts/bricolage-800.woff2` (~19 KB, instanciada al peso 800 y subset a
caracteres latinos/español, para no penalizar el rendimiento). Para regenerarla:

```bash
npm run build:fonts
```

## Google Ads — seguimiento de conversiones

La conversión clave es **el clic a WhatsApp**. El sitio ya emite un evento cada vez que
alguien pulsa un botón/enlace de WhatsApp o envía el formulario (en `assets/js/main.js`,
función `trackWhatsApp`). Solo falta conectar el Google tag:

1. Crear una conversión en Google Ads ("Contacto por WhatsApp") y copiar su
   **ID de conversión** (`AW-XXXXXXXXX`) y la **etiqueta**.
2. En `site/index.html`, dentro de `<head>`, pegar el Google tag:
   ```html
   <script async src="https://www.googletagmanager.com/gtag/js?id=AW-XXXXXXXXX"></script>
   <script>
     window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}
     gtag('js',new Date()); gtag('config','AW-XXXXXXXXX');
     window.SERVICLIMA_ADS_CONVERSION='AW-XXXXXXXXX/ETIQUETA';
   </script>
   ```
   Con eso, cada clic a WhatsApp dispara la conversión automáticamente.
3. (Opcional) El mismo Google tag sirve para Google Analytics 4 (`G-XXXXXXX`).

> Nota: agregar el Google tag introduce un script de terceros que puede bajar levemente el
> puntaje de rendimiento de Lighthouse. Es el comportamiento esperado y aceptable para medir
> campañas; el resto del sitio sigue optimizado.

La página de **Política de Privacidad** (`/privacidad.html`) ya está enlazada en el footer
(requisito de Google Ads) y menciona el uso de cookies de medición.

## Próximos pasos para Google (para el cliente)

1. **Google Search Console**: verificar la propiedad y enviar `sitemap.xml`.
2. **Perfil de Empresa en Google** (Google Business Profile): crear ficha "ServiClima",
   categoría *Servicio de reparación de aire acondicionado*, zona Región Metropolitana.
   Las reseñas reales que se acumulen ahí se pueden mostrar luego en el sitio.
3. **Google Ads**: la landing ya está optimizada para campañas (carga rápida, CTA a WhatsApp,
   datos estructurados). Apuntar los anuncios a `https://serviclimasantiago.cl/`.
4. Validar los datos estructurados en el
   [Rich Results Test](https://search.google.com/test/rich-results).

## Notas

- No se publican datos que el negocio aún no tiene (dirección física, RUT, email, reseñas),
  por honestidad y para no afectar la confianza ni las buenas prácticas.
- La sección de reseñas se omitió a propósito; cuando haya reseñas reales en Google se puede
  integrar el widget oficial.
