/**
 * Genera las páginas por servicio a partir de site/index.html.
 *
 * Por qué así: el sitio es una sola página con CSS crítico inline, sprite de íconos, header,
 * footer y botones flotantes. Copiar todo eso a mano en cada página nueva se desincroniza al
 * primer cambio. Este script reutiliza el "marco" real de index.html y solo inyecta el
 * contenido propio de cada servicio, así el diseño no puede quedar desalineado.
 *
 * Uso:  node scripts/build-landing-pages.mjs
 * Salida: site/<slug>/index.html  (URL limpia /<slug> en Cloudflare Pages)
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SITE = join(ROOT, "site");
const ORIGIN = "https://serviclimasantiago.cl";
const WA = "56983832944";
const wa = (msg) => `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`;

const src = readFileSync(join(SITE, "index.html"), "utf8");

/* ---- Marco reutilizado de la home ---- */
const head = src.slice(0, src.indexOf("</head>"));
const chromeTop = src.slice(src.indexOf("<body>"), src.indexOf("</header>") + "</header>".length);
const chromeBottom = src.slice(src.indexOf('<footer class="site-footer">'));

/* El JSON-LD de FAQPage y el de negocio son de la home: se quitan y cada página pone el suyo. */
const stripLd = (html, type) =>
  html.replace(
    new RegExp(`<script type="application/ld\\+json">\\s*\\{[^]*?"@type"\\s*:\\s*"${type}"[^]*?</script>`, "g"),
    ""
  );

/* En una subpágina, los anclas del menú (#servicios) tienen que apuntar a la home. */
const fixAnchors = (html) => html.replace(/href="#(?!\s)/g, 'href="/#');

const PAGES = [
  {
    slug: "instalacion-aire-acondicionado",
    h1: "Instalación de aire acondicionado en Santiago",
    title: "Instalación de Aire Acondicionado en Santiago | ServiClima",
    desc: "Instalación de aire acondicionado split y multisplit en Santiago y toda la RM. Cálculo de capacidad, 1 año de garantía y precio cerrado antes de empezar.",
    eyebrow: "Instalación",
    intro:
      "Instalamos equipos split y multisplit en toda la Región Metropolitana, con cálculo previo de la capacidad que necesita tu espacio, cañería prolija y puesta en marcha probada. Si compraste el equipo en una tienda, también te lo instalamos.",
    waMsg: "Hola ServiClima, necesito cotizar la instalación de un aire acondicionado.",
    bullets: [
      ["Cálculo de capacidad", "Medimos el espacio, la orientación y los ventanales para definir los BTU que corresponden. Un equipo chico trabaja ahogado y uno grande de más se paga en la boleta de la luz."],
      ["Instalación completa", "Montaje de unidad interior y exterior, cañería de cobre, drenaje, conexión eléctrica del equipo, vacío del sistema y puesta en marcha con prueba de frío y calor."],
      ["1 año de garantía", "Garantía escrita en la mano de obra de toda instalación. Si algo del trabajo falla, volvemos."],
      ["Precio cerrado antes de empezar", "Si el recorrido de cañería es largo, hay que picar muros o la unidad exterior va en altura, lo conversamos y se cotiza antes. Nunca aparecen cobros sorpresa al final."],
    ],
    faq: [
      ["¿Cuánto demora la instalación?", "Una instalación estándar de equipo split toma entre 3 y 5 horas y normalmente queda lista el mismo día."],
      ["¿Instalan equipos comprados en otro lado?", "Sí. Si compraste tu equipo en Sodimac, Easy, Falabella, Mercado Libre o cualquier distribuidor, nosotros te lo instalamos. Y si todavía no compras, te decimos qué capacidad te conviene antes de que gastes."],
      ["¿Qué capacidad necesito según los metros cuadrados?", "Como referencia: 9.000 BTU hasta unos 15 m², 12.000 BTU hasta 25 m², 18.000 BTU hasta 35 m² y 24.000 BTU hasta 50 m². La medición exacta la hacemos en la visita."],
      ["¿Cuánto cuesta la visita de evaluación?", "La visita de evaluación y diagnóstico tiene un costo fijo de $15.000 en toda la Región Metropolitana, y se descuenta del valor final si haces el trabajo con nosotros."],
    ],
  },
  {
    slug: "mantencion-aire-acondicionado",
    h1: "Mantención y limpieza de aire acondicionado en Santiago",
    title: "Mantención de Aire Acondicionado en Santiago | ServiClima",
    desc: "Mantención y limpieza profunda de aire acondicionado a domicilio en Santiago y la RM. Limpieza de evaporador, lavado de unidad exterior y control de gas.",
    eyebrow: "Mantención",
    intro:
      "Un equipo sin mantención enfría menos, huele mal y consume más electricidad. Hacemos la limpieza profunda a domicilio en toda la Región Metropolitana, sin que tengas que desmontar ni trasladar nada.",
    waMsg: "Hola ServiClima, quiero cotizar la mantención de mi aire acondicionado.",
    bullets: [
      ["Limpieza profunda del evaporador", "Desarmamos la unidad interior y lavamos el intercambiador y la turbina, que es donde se acumulan el polvo y los hongos que producen el mal olor."],
      ["Lavado de la unidad exterior", "La condensadora tapada obliga al equipo a trabajar forzado y sube el consumo eléctrico."],
      ["Drenaje y control de gas", "Destapamos el drenaje (la causa más común del goteo hacia el muro) y revisamos la presión del refrigerante para detectar fugas a tiempo."],
      ["3 meses de garantía", "Garantía escrita en el servicio de mantención."],
    ],
    faq: [
      ["¿Cada cuánto se hace la mantención?", "En uso residencial, una vez al año, idealmente antes del verano. En oficinas, locales o equipos que funcionan todo el día, cada 6 meses."],
      ["¿Por qué mi aire acondicionado gotea?", "Casi siempre es el drenaje tapado: la unidad genera agua de condensación y, si el tubo se obstruye con polvo, esa agua se devuelve al muro. Se resuelve en la mantención."],
      ["¿Por qué huele mal cuando lo enciendo?", "Es humedad acumulada con polvo en el evaporador y los filtros. Se corrige con la limpieza profunda; los filtros los puedes enjuagar tú cada mes."],
      ["¿Atienden edificios y oficinas?", "Sí, hacemos mantención preventiva de equipos residenciales y comerciales en toda la RM."],
    ],
  },
  {
    slug: "reparacion-aire-acondicionado",
    h1: "Reparación de aire acondicionado en Santiago",
    title: "Reparación de Aire Acondicionado en Santiago | ServiClima",
    desc: "Reparación de aire acondicionado a domicilio en Santiago y la RM. Diagnóstico de $15.000 descontable, repuestos originales y 3 meses de garantía.",
    eyebrow: "Reparación",
    intro:
      "Si tu equipo dejó de enfriar, gotea, hace ruidos raros o se apaga solo, vamos a tu domicilio, diagnosticamos la falla real y te decimos qué cuesta arreglarla antes de tocar nada.",
    waMsg: "Hola ServiClima, mi aire acondicionado tiene una falla y necesito una reparación.",
    bullets: [
      ["Diagnóstico a domicilio: $15.000", "Costo fijo en toda la Región Metropolitana y se descuenta del total si haces la reparación con nosotros. Si aceptas el presupuesto, el diagnóstico te sale $0."],
      ["Fallas frecuentes que resolvemos", "No enfría, gotea al muro, se congela la cañería, hace ruido, tira olor, se apaga solo o marca error en el control."],
      ["Repuestos originales", "Trabajamos con repuestos originales y equipos de todas las marcas."],
      ["3 meses de garantía", "Garantía escrita sobre la reparación realizada."],
    ],
    faq: [
      ["¿Por qué mi equipo dejó de enfriar?", "Lo más común es filtros sucios, evaporador saturado o falta de gas refrigerante por una fuga. Conviene revisarlo pronto: seguir usándolo así puede dañar el compresor, que es la pieza más cara."],
      ["¿Cobran la visita si no reparo?", "La visita de diagnóstico tiene un valor fijo de $15.000. Si aceptas el presupuesto, ese monto se descuenta del total."],
      ["¿Reparan cualquier marca?", "Sí, atendemos equipos de todas las marcas del mercado, incluidos split, multisplit y cassette."],
      ["¿Cuánto se demoran en llegar?", "Coordinamos la visita por WhatsApp o teléfono y atendemos a domicilio en toda la Región Metropolitana."],
    ],
  },
];

/**
 * Páginas por comuna. REGLA: cada una tiene que decir algo REAL y distinto de esa comuna
 * (tipo de vivienda, altura, acceso, permisos de fachada). Clonar el mismo texto cambiando el
 * nombre son "doorway pages" y Google las castiga — no sirven ni para el cliente ni para el SEO.
 */
const COMUNAS = [
  {
    slug: "aire-acondicionado-las-condes",
    name: "Las Condes",
    intro:
      "Buena parte del trabajo en Las Condes es en departamentos de altura y edificios con reglamento de copropiedad: la unidad exterior casi nunca puede quedar a la vista desde la calle y hay que respetar el punto que autoriza la administración.",
    puntos: [
      ["Departamentos en altura", "Trabajamos con la condensadora en balcón, logia o repisa técnica según lo que permita el edificio, y dejamos el drenaje conducido para que no gotee al vecino de abajo."],
      ["Coordinación con la administración", "Varios edificios piden aviso previo, horario de trabajo acotado y protección de ascensores y pasillos. Lo coordinamos antes de subir con el equipo."],
      ["Casas del sector oriente", "En casas de Los Dominicos, San Damián o El Golf resolvemos recorridos de cañería largos y equipos multisplit para varias piezas."],
    ],
  },
  {
    slug: "aire-acondicionado-providencia",
    name: "Providencia",
    intro:
      "En Providencia conviven edificios nuevos con departamentos antiguos de muros gruesos y casas remodeladas. Eso cambia por completo la instalación: no es lo mismo perforar un tabique nuevo que un muro de albañilería de los años 60.",
    puntos: [
      ["Edificios antiguos", "Muros gruesos, cielos altos y poco espacio para la unidad exterior. Definimos el recorrido de cañería más corto y prolijo antes de picar nada."],
      ["Oficinas y consultas", "Atendemos oficinas del eje Providencia–Nueva Providencia y consultas médicas, coordinando el trabajo fuera del horario de atención cuando hace falta."],
      ["Mantención recurrente", "Muchos departamentos del sector tienen equipos con años de uso sin mantención: se recuperan con la limpieza profunda del evaporador."],
    ],
  },
  {
    slug: "aire-acondicionado-nunoa",
    name: "Ñuñoa",
    intro:
      "Ñuñoa es mitad casa antigua y mitad edificio nuevo. En las casas de Plaza Ñuñoa o Villa Frei el desafío suele ser el cielo alto y la instalación eléctrica antigua; en los edificios nuevos, el espacio para la unidad exterior.",
    puntos: [
      ["Casas antiguas", "Revisamos que el circuito eléctrico soporte el equipo antes de instalar. Un split conectado a un circuito saturado hace saltar el automático."],
      ["Cielos altos", "En living de doble altura hay que calcular capacidad por volumen, no solo por metros cuadrados, o el equipo nunca alcanza a enfriar."],
      ["Departamentos nuevos", "Instalación en balcón o logia respetando lo que permite el edificio, con drenaje conducido."],
    ],
  },
  {
    slug: "aire-acondicionado-maipu",
    name: "Maipú",
    intro:
      "En Maipú predominan las casas de dos pisos en condominio, donde el segundo piso se recalienta en verano. Es la comuna donde más se pide instalar en dormitorio y living con un solo equipo bien dimensionado.",
    puntos: [
      ["Casas de dos pisos", "El segundo piso siempre necesita más capacidad que el primero: la orientación poniente y el techo directo pesan más que los metros cuadrados."],
      ["Multisplit para varias piezas", "Cuando hay que enfriar dormitorio y living, un multisplit sale mejor que dos equipos separados y deja una sola unidad exterior."],
      ["Servicio a domicilio", "Vamos hasta tu casa en Maipú sin costo de traslado adicional dentro de la Región Metropolitana."],
    ],
  },
  {
    slug: "aire-acondicionado-puente-alto",
    name: "Puente Alto",
    intro:
      "Puente Alto es una de las comunas más calurosas de Santiago en verano y con mayor demanda de instalación en casa. También es donde más equipos comprados en retail llegan sin instalar.",
    puntos: [
      ["Instalación de equipos comprados", "Si compraste el split en una tienda, te lo instalamos: revisamos que la capacidad sea la correcta para la pieza antes de montarlo."],
      ["Reparación a domicilio", "Diagnóstico de $15.000 descontable, igual que en el resto de la RM."],
      ["Casas pareadas", "Cuidamos que la unidad exterior no quede descargando calor ni ruido contra la ventana del vecino: es la causa más común de reclamo."],
    ],
  },
  {
    slug: "aire-acondicionado-la-florida",
    name: "La Florida",
    intro:
      "En La Florida atendemos tanto las casas del sector Vicuña Mackenna como los departamentos cercanos a Mirador Azul y Bellavista. El verano pega fuerte y la mayoría de las urgencias son equipos que dejaron de enfriar.",
    puntos: [
      ["Equipos que dejaron de enfriar", "Suele ser filtros y evaporador saturados o falta de gas por una fuga. Lo diagnosticamos en la visita y te decimos el costo antes de reparar."],
      ["Mantención antes del verano", "Conviene hacerla en primavera: en enero la agenda se llena y el equipo ya lleva semanas trabajando forzado."],
      ["Casas y departamentos", "Instalamos split y multisplit en ambos formatos, con drenaje conducido y puesta en marcha probada."],
    ],
  },
];

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

for (const p of PAGES) {
  const url = `${ORIGIN}/${p.slug}`;

  let pageHead = stripLd(stripLd(head, "FAQPage"), "HVACBusiness")
    .replace(/<title>[^]*?<\/title>/, `<title>${esc(p.title)}</title>`)
    .replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${url}">`)
    .replace(/(<meta name="description" content=")[^"]*(">)/, `$1${esc(p.desc)}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(">)/, `$1${esc(p.title)}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(">)/, `$1${esc(p.desc)}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(">)/, `$1${url}$2`)
    .replace(/(<meta name="twitter:title" content=")[^"]*(">)/, `$1${esc(p.title)}$2`)
    .replace(/(<meta name="twitter:description" content=")[^"]*(">)/, `$1${esc(p.desc)}$2`)
    /* Los assets se referencian con rutas absolutas, así que sirven igual desde /<slug>/ */
    .replace(/href="assets\//g, 'href="/assets/')
    .replace(/src="assets\//g, 'src="/assets/');

  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${url}#service`,
        name: p.h1,
        serviceType: p.eyebrow,
        description: p.desc,
        provider: { "@type": "HVACBusiness", "@id": `${ORIGIN}/#business`, name: "ServiClima Santiago", telephone: "+56983832944" },
        areaServed: { "@type": "AdministrativeArea", name: "Región Metropolitana de Santiago" },
        url,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: `${ORIGIN}/` },
          { "@type": "ListItem", position: 2, name: p.eyebrow, item: url },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: p.faq.map(([q, a]) => ({
          "@type": "Question",
          name: q,
          acceptedAnswer: { "@type": "Answer", text: a },
        })),
      },
    ],
  };

  const body = `
<main id="main">
  <section aria-labelledby="svc-title">
    <div class="container">
      <nav class="crumbs" aria-label="Ruta de navegación">
        <a href="/">Inicio</a> <span aria-hidden="true">›</span> <span>${esc(p.eyebrow)}</span>
      </nav>
      <div class="section-head">
        <p class="eyebrow">${esc(p.eyebrow)} · Región Metropolitana</p>
        <h1 id="svc-title">${esc(p.h1)}</h1>
        <p class="lead">${esc(p.intro)}</p>
      </div>
      <p>
        <a class="btn btn--call" href="tel:+56983832944">
          <svg aria-hidden="true" focusable="false"><use href="#ico-call"></use></svg> Llamar ahora
        </a>
        <a class="btn btn--wa" data-wa href="${wa(p.waMsg)}">
          <svg aria-hidden="true" focusable="false"><use href="#ico-wa"></use></svg> Cotizar por WhatsApp
        </a>
      </p>
    </div>
  </section>

  <section aria-labelledby="incl-title">
    <div class="container">
      <div class="section-head">
        <h2 id="incl-title">Qué incluye el servicio</h2>
      </div>
      <div class="faq-grid">
        ${p.bullets
          .map(
            ([t, d]) => `<div class="faq-item">
          <h3>${esc(t)}</h3>
          <p>${esc(d)}</p>
        </div>`
          )
          .join("\n        ")}
      </div>
    </div>
  </section>

  <section aria-labelledby="pfaq-title">
    <div class="container">
      <div class="section-head center">
        <p class="eyebrow">Dudas frecuentes</p>
        <h2 id="pfaq-title">Sobre ${esc(p.eyebrow.toLowerCase())} de aire acondicionado</h2>
      </div>
      <div class="faq-grid">
        ${p.faq
          .map(
            ([q, a]) => `<div class="faq-item">
          <h3>${esc(q)}</h3>
          <p>${esc(a)}</p>
        </div>`
          )
          .join("\n        ")}
      </div>
    </div>
  </section>

  <section aria-labelledby="cta-title">
    <div class="container">
      <div class="cta">
        <p class="eyebrow on-dark" style="justify-content:center">Hablemos</p>
        <h2 id="cta-title">¿Coordinamos tu visita?</h2>
        <p class="lead on-dark">Atendemos a domicilio en toda la Región Metropolitana, de lunes a sábado de 9:00 a 18:00.</p>
        <p>
          <a class="btn btn--call" href="tel:+56983832944">
            <svg aria-hidden="true" focusable="false"><use href="#ico-call"></use></svg> Llamar ahora
          </a>
          <a class="btn btn--wa" data-wa href="${wa(p.waMsg)}">
            <svg aria-hidden="true" focusable="false"><use href="#ico-wa"></use></svg> Escribir por WhatsApp
          </a>
        </p>
        <p class="lead on-dark"><a href="/#servicios">Ver todos nuestros servicios</a></p>
      </div>
    </div>
  </section>
</main>
`;

  const html = `${pageHead}<script type="application/ld+json">
${JSON.stringify(ld, null, 2)}
</script>
</head>
${fixAnchors(chromeTop)}
${body}
${fixAnchors(chromeBottom)}`;

  const dir = join(SITE, p.slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), html, "utf8");
  console.log("generado:", `site/${p.slug}/index.html`, (html.length / 1024).toFixed(1) + " KB");
}

/* ---------------- Páginas por comuna ---------------- */
for (const c of COMUNAS) {
  const url = `${ORIGIN}/${c.slug}`;
  const title = `Aire Acondicionado en ${c.name} | Instalación y Reparación | ServiClima`;
  const desc = `Instalación, mantención y reparación de aire acondicionado en ${c.name}. Servicio a domicilio, garantía escrita y diagnóstico de $15.000 descontable.`;
  const waMsg = `Hola ServiClima, necesito un servicio de aire acondicionado en ${c.name}.`;

  const pageHead = stripLd(stripLd(head, "FAQPage"), "HVACBusiness")
    .replace(/<title>[^]*?<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${url}">`)
    .replace(/(<meta name="description" content=")[^"]*(">)/, `$1${esc(desc)}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(">)/, `$1${esc(title)}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(">)/, `$1${esc(desc)}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(">)/, `$1${url}$2`)
    .replace(/(<meta name="twitter:title" content=")[^"]*(">)/, `$1${esc(title)}$2`)
    .replace(/(<meta name="twitter:description" content=")[^"]*(">)/, `$1${esc(desc)}$2`)
    .replace(/href="assets\//g, 'href="/assets/')
    .replace(/src="assets\//g, 'src="/assets/');

  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${url}#service`,
        name: `Aire acondicionado en ${c.name}`,
        description: desc,
        provider: { "@type": "HVACBusiness", "@id": `${ORIGIN}/#business`, name: "ServiClima Santiago", telephone: "+56983832944" },
        areaServed: { "@type": "City", name: c.name, containedInPlace: { "@type": "AdministrativeArea", name: "Región Metropolitana de Santiago" } },
        url,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: `${ORIGIN}/` },
          { "@type": "ListItem", position: 2, name: c.name, item: url },
        ],
      },
    ],
  };

  const body = `
<main id="main">
  <section aria-labelledby="com-title">
    <div class="container">
      <nav class="crumbs" aria-label="Ruta de navegación">
        <a href="/">Inicio</a> <span aria-hidden="true">›</span> <span>${esc(c.name)}</span>
      </nav>
      <div class="section-head">
        <p class="eyebrow">Servicio a domicilio · ${esc(c.name)}</p>
        <h1 id="com-title">Aire acondicionado en ${esc(c.name)}</h1>
        <p class="lead">${esc(c.intro)}</p>
      </div>
      <p>
        <a class="btn btn--call" href="tel:+56983832944">
          <svg aria-hidden="true" focusable="false"><use href="#ico-call"></use></svg> Llamar ahora
        </a>
        <a class="btn btn--wa" data-wa href="${wa(waMsg)}">
          <svg aria-hidden="true" focusable="false"><use href="#ico-wa"></use></svg> Cotizar por WhatsApp
        </a>
      </p>
    </div>
  </section>

  <section aria-labelledby="loc-title">
    <div class="container">
      <div class="section-head">
        <h2 id="loc-title">Cómo trabajamos en ${esc(c.name)}</h2>
      </div>
      <div class="faq-grid">
        ${c.puntos
          .map(
            ([t, d]) => `<div class="faq-item">
          <h3>${esc(t)}</h3>
          <p>${esc(d)}</p>
        </div>`
          )
          .join("\n        ")}
      </div>
    </div>
  </section>

  <section aria-labelledby="svcs-title">
    <div class="container">
      <div class="section-head">
        <h2 id="svcs-title">Nuestros servicios en ${esc(c.name)}</h2>
      </div>
      <div class="faq-grid">
        <div class="faq-item">
          <h3><a href="/instalacion-aire-acondicionado">Instalación de aire acondicionado</a></h3>
          <p>Equipos split y multisplit, con cálculo de capacidad y 1 año de garantía en la mano de obra.</p>
        </div>
        <div class="faq-item">
          <h3><a href="/mantencion-aire-acondicionado">Mantención y limpieza</a></h3>
          <p>Limpieza profunda del evaporador, lavado de la unidad exterior, drenaje y control de gas.</p>
        </div>
        <div class="faq-item">
          <h3><a href="/reparacion-aire-acondicionado">Reparación</a></h3>
          <p>Diagnóstico a domicilio por $15.000, descontable del total si haces la reparación con nosotros.</p>
        </div>
      </div>
    </div>
  </section>

  <section aria-labelledby="cta-title">
    <div class="container">
      <div class="cta">
        <p class="eyebrow on-dark" style="justify-content:center">Hablemos</p>
        <h2 id="cta-title">¿Te visitamos en ${esc(c.name)}?</h2>
        <p class="lead on-dark">Atendemos de lunes a sábado de 9:00 a 18:00 en toda la Región Metropolitana.</p>
        <p>
          <a class="btn btn--call" href="tel:+56983832944">
            <svg aria-hidden="true" focusable="false"><use href="#ico-call"></use></svg> Llamar ahora
          </a>
          <a class="btn btn--wa" data-wa href="${wa(waMsg)}">
            <svg aria-hidden="true" focusable="false"><use href="#ico-wa"></use></svg> Escribir por WhatsApp
          </a>
        </p>
      </div>
    </div>
  </section>
</main>
`;

  const html = `${pageHead}<script type="application/ld+json">
${JSON.stringify(ld, null, 2)}
</script>
</head>
${fixAnchors(chromeTop)}
${body}
${fixAnchors(chromeBottom)}`;

  const dir = join(SITE, c.slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), html, "utf8");
  console.log("generado:", `site/${c.slug}/index.html`, (html.length / 1024).toFixed(1) + " KB");
}
