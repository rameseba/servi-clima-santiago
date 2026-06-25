/* ServiClima — JS mínimo, sin dependencias. */
(function () {
  "use strict";

  var WA = "56983832944"; // WhatsApp (sin + ni espacios)

  /* ---- Conversión: avisar a Google Ads/Analytics en cada contacto por WhatsApp ----
     Funciona apenas se configure el Google tag (ver README). Si no existe, no hace nada. */
  function trackWhatsApp(origin) {
    try {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: "whatsapp_click", origin: origin || "site" });
      if (typeof window.gtag === "function" && window.SERVICLIMA_ADS_CONVERSION) {
        window.gtag("event", "conversion", { send_to: window.SERVICLIMA_ADS_CONVERSION });
      }
    } catch (e) {}
  }
  document.querySelectorAll("[data-wa]").forEach(function (el) {
    el.addEventListener("click", function () { trackWhatsApp("link"); });
  });

  /* ---- Menú móvil ---- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("nav-menu");
  var headerCta = document.querySelector(".header-cta");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      if (headerCta) headerCta.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        nav.classList.remove("open");
        if (headerCta) headerCta.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Abrir menú");
      }
    });
  }

  /* ---- Formulario -> WhatsApp con validación y sanitización ---- */
  var form = document.getElementById("quote-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var val = function (id) { var el = document.getElementById(id); return el ? el.value.trim() : ""; };
      
      // Validación de Nombre
      var n = val("q-name");
      if (!n || n.length < 2) {
        alert("Por favor, ingresa un nombre válido (mínimo 2 letras).");
        var nameEl = document.getElementById("q-name");
        if (nameEl) nameEl.focus();
        return;
      }
      
      // Validación de Teléfono (exactamente 9 dígitos después de +56)
      var phoneEl = document.getElementById("q-phone");
      var p = phoneEl ? phoneEl.value.trim() : "";
      var digits = p.substring(4).replace(/\D/g, "");
      if (digits.length !== 9) {
        alert("Por favor, ingresa un número de teléfono válido (+56 9 XXXX XXXX). Son 9 números obligatorios.");
        if (phoneEl) phoneEl.focus();
        return;
      }
      
      // Validación de Comuna
      var c = val("q-comuna");
      if (!c || c.length < 3) {
        alert("Por favor, ingresa una comuna válida (mínimo 3 letras).");
        var comunaEl = document.getElementById("q-comuna");
        if (comunaEl) comunaEl.focus();
        return;
      }
      
      // Sanitización contra inyecciones y caracteres especiales
      var cleanString = function(str) {
        return str.replace(/[<>'"&;]/g, "");
      };
      
      n = cleanString(n);
      c = cleanString(c);
      var m = cleanString(val("q-msg"));
      
      var lines = ["Hola ServiClima, quisiera cotizar un servicio."];
      var s = val("q-service"); if (s) lines.push("Servicio: " + s);
      lines.push("Nombre: " + n);
      lines.push("Teléfono: " + p);
      lines.push("Comuna: " + c);
      if (m) lines.push("Mensaje: " + m);
      
      trackWhatsApp("form");
      window.open("https://wa.me/" + WA + "?text=" + encodeURIComponent(lines.join("\n")), "_blank", "noopener");
    });
  }

  /* ---- Máscara dinámica de Teléfono (+56 9 XXXX XXXX) ---- */
  var phoneInput = document.getElementById("q-phone");
  if (phoneInput) {
    phoneInput.addEventListener("focus", function () {
      if (!phoneInput.value.startsWith("+56 ")) {
        phoneInput.value = "+56 ";
      }
    });
    phoneInput.addEventListener("input", function () {
      var val = phoneInput.value;
      if (!val.startsWith("+56 ")) {
        val = "+56 " + val.replace(/^\+?5?6?\s*/, "");
      }
      var prefix = "+56 ";
      var digits = val.substring(prefix.length).replace(/\D/g, "");
      
      if (digits.length > 9) {
        digits = digits.substring(0, 9);
      }
      
      var formatted = "";
      if (digits.length > 0) {
        formatted += digits.substring(0, 1);
      }
      if (digits.length > 1) {
        formatted += " " + digits.substring(1, 5);
      }
      if (digits.length > 5) {
        formatted += " " + digits.substring(5, 9);
      }
      
      phoneInput.value = prefix + formatted;
    });
    phoneInput.addEventListener("keydown", function (e) {
      if (phoneInput.selectionStart < 4 && (e.key === "Backspace" || e.key === "Delete")) {
        e.preventDefault();
      }
    });
  }

  /* ---- Botón flotante de Scroll (Subir / Bajar) ---- */
  var scrollBtn = document.getElementById("scroll-btn");
  if (scrollBtn) {
    window.addEventListener("scroll", function () {
      var totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight <= 0) return;
      var percent = (window.scrollY / totalHeight) * 100;
      if (percent > 60) {
        scrollBtn.classList.add("up");
        scrollBtn.setAttribute("aria-label", "Desplazar hacia arriba");
      } else {
        scrollBtn.classList.remove("up");
        scrollBtn.setAttribute("aria-label", "Desplazar hacia abajo");
      }
    });
    scrollBtn.addEventListener("click", function () {
      if (scrollBtn.classList.contains("up")) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
      }
    });
  }



  /* ---- Globo de chat de WhatsApp con retraso y memoria de sesión ---- */
  var chatBubble = document.getElementById("wa-chat-bubble");
  var chatClose = document.getElementById("wa-chat-close");
  if (chatBubble && chatClose) {
    var isClosed = sessionStorage.getItem("wa-chat-closed");
    if (!isClosed) {
      setTimeout(function () {
        chatBubble.removeAttribute("hidden");
      }, 2500);
    }
    chatClose.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      chatBubble.setAttribute("hidden", "true");
      sessionStorage.setItem("wa-chat-closed", "true");
    });
  }

  /* ---- Slideshow del hero: los slides 2+ y los dots se CREAN tras el load,
         para no agregar nada al DOM inicial y mantener el LCP intacto. ---- */
  var heroSlides = document.getElementById("hero-slides");
  if (heroSlides) {
    var HERO_EXTRA = [
      "/assets/img/instalacion-unidad-nueva-v2-480.webp",
      "/assets/img/split-living-ladrillo-480.webp"
    ];
    function buildHeroSlideshow() {
      HERO_EXTRA.forEach(function (src) {
        var div = document.createElement("div");
        div.className = "hero-slide";
        var img = document.createElement("img");
        img.src = src; img.alt = ""; img.width = 1024; img.height = 1024; img.decoding = "async";
        div.appendChild(img);
        heroSlides.appendChild(div);
      });
      var slides = Array.prototype.slice.call(heroSlides.querySelectorAll(".hero-slide"));
      if (slides.length < 2) return;
      var dotsWrap = document.createElement("div");
      dotsWrap.className = "hero-dots";
      dotsWrap.setAttribute("aria-label", "Cambiar imagen del aire acondicionado");
      var dots = slides.map(function (_, i) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "hero-dot" + (i === 0 ? " is-active" : "");
        b.setAttribute("aria-label", "Imagen " + (i + 1));
        if (i === 0) b.setAttribute("aria-current", "true");
        dotsWrap.appendChild(b);
        return b;
      });
      heroSlides.appendChild(dotsWrap);

      var idx = 0, timer = null;
      var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      function go(n) {
        slides[idx].classList.remove("is-active");
        dots[idx].classList.remove("is-active"); dots[idx].removeAttribute("aria-current");
        idx = (n + slides.length) % slides.length;
        slides[idx].classList.add("is-active");
        dots[idx].classList.add("is-active"); dots[idx].setAttribute("aria-current", "true");
      }
      function stop() { if (timer) { clearInterval(timer); timer = null; } }
      function start() { if (reduce) return; stop(); timer = setInterval(function () { go(idx + 1); }, 5000); }
      dots.forEach(function (d, i) { d.addEventListener("click", function () { go(i); start(); }); });
      heroSlides.addEventListener("mouseenter", stop);
      heroSlides.addEventListener("mouseleave", start);
      requestAnimationFrame(function () { heroSlides.classList.add("hero-slides-ready"); });
      start();
    }
    // Diferir a tiempo idle tras el load: las imágenes extra no compiten con el LCP.
    function scheduleHeroBuild() {
      if (window.requestIdleCallback) requestIdleCallback(buildHeroSlideshow, { timeout: 3000 });
      else setTimeout(buildHeroSlideshow, 1500);
    }
    if (document.readyState === "complete") scheduleHeroBuild();
    else window.addEventListener("load", scheduleHeroBuild);
  }

  /* ---- Galería con lightbox ---- */
  var galleryItems = Array.prototype.slice.call(document.querySelectorAll(".gallery-item"));
  var lb = document.getElementById("lightbox");
  if (galleryItems.length && lb) {
    var lbImg = document.getElementById("lb-img");
    var lbCount = document.getElementById("lb-count");
    var lbClose = document.getElementById("lb-close");
    var current = 0;
    var lastFocus = null;

    function show(i) {
      current = (i + galleryItems.length) % galleryItems.length;
      var item = galleryItems[current];
      var thumb = item.querySelector("img");
      lbImg.src = item.getAttribute("data-full");
      lbImg.alt = thumb ? thumb.alt : "";
      lbCount.textContent = (current + 1) + " / " + galleryItems.length;
    }
    function onKey(e) {
      if (e.key === "Escape") closeLb();
      else if (e.key === "ArrowRight") show(current + 1);
      else if (e.key === "ArrowLeft") show(current - 1);
    }
    function openLb(i) {
      lastFocus = document.activeElement;
      show(i);
      lb.removeAttribute("hidden");
      document.body.style.overflow = "hidden";
      lbClose.focus();
      document.addEventListener("keydown", onKey);
    }
    function closeLb() {
      lb.setAttribute("hidden", "true");
      lbImg.src = "";
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    galleryItems.forEach(function (item, i) {
      item.addEventListener("click", function () { openLb(i); });
    });
    lbClose.addEventListener("click", closeLb);
    document.getElementById("lb-prev").addEventListener("click", function () { show(current - 1); });
    document.getElementById("lb-next").addEventListener("click", function () { show(current + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });
  }

  /* ---- Año del footer ---- */
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
