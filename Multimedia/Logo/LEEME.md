# Servi Clima — logo oficial y favicon

Este set fue generado a partir del logo oficial que ya tenía el cliente
("Servi Clima — Soluciones que te dan confort"). El logo circular original
incluye texto, lo cual no funciona bien reducido a 16x16px (un favicon con
texto se ve como una mancha sin forma). Por eso, para el favicon se aisló
solo el símbolo del copo de nieve, dejando el círculo completo con texto
para los demás usos (redes sociales, papelería, sello, etc).

## Carpetas

### set_favicon_A_transparente (recomendado)
El copo de nieve solo, sin fondo, fondo transparente. Se ve limpio en
pestañas de navegador claras y oscuras por igual.

### set_favicon_B_fondo_navy
El copo de nieve sobre un círculo de fondo azul marino (tomado del logo).
Da más presencia/contraste en pestañas con fondo blanco, pero en 16x16
pierde algo de nitidez por el menor contraste entre el azul del copo y el
azul marino del fondo.

Prueba ambas directamente en el navegador (a veces se ve distinto en la
práctica que en una imagen ampliada) y quédate con la que prefieras.

Cada carpeta incluye:
- favicon.ico (multi-tamaño 16/32/48/64px)
- favicon-16x16.png, favicon-32x32.png, favicon-48x48.png
- apple-touch-icon-180x180.png (iOS)
- android-chrome-192x192.png, android-chrome-512x512.png
- site.webmanifest

## Archivos generales (fuera de las carpetas de favicon)

- logo-circulo-completo-transparente.png — el logo oficial completo
  (círculo, copo, texto "Servi Clima" y slogan), fondo transparente,
  alta resolución. Para redes sociales, papelería, presentaciones.
- icono-copo-nieve-solo-transparente.png — el copo de nieve aislado,
  en alta resolución, por si se necesita usar el símbolo solo en algún
  material (ej. como watermark o ícono pequeño en un documento).
- logo-circulo-monocromo-negro.png — todo el logo en negro sólido
  (para grabados, sellos, impresión a una tinta).
- logo-circulo-monocromo-blanco.png — todo el logo en blanco sólido
  (para fondos oscuros o de color).

## Cómo implementar el favicon

Elige una carpeta (A o B), coloca todos sus archivos en la raíz del
sitio, y agrega esto en el `<head>`:

```html
<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon-180x180.png">
<link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="#0c1e46">
```

## Nota sobre el logo anterior

El logo del remolino morado/naranja ("Serviclima Santiago") que se generó
en una conversación previa queda descartado — el cliente ya tenía su
propio logo oficial ("Servi Clima"), que es el que se usa de aquí en
adelante.
