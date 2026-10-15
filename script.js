/* =========================================================
   Método Golden — interacción
   Sin dependencias. Se ejecuta con "defer".
   ========================================================= */
(function () {
  "use strict";

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Almacenamiento seguro (puede fallar en modo privado) ---------- */
  var store = {
    get: function (key) {
      try { return JSON.parse(window.localStorage.getItem(key)); } catch (e) { return null; }
    },
    set: function (key, value) {
      try { window.localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* sin almacenamiento */ }
    }
  };

  /* =========================================================
     Cabecera: fondo sólido al hacer scroll
     ========================================================= */
  var header = $("[data-header]");
  var hero = $(".hero");
  function updateHeader() {
    if (!header) return;
    var solid = !hero || window.scrollY > 40 || document.body.classList.contains("nav-open");
    header.classList.toggle("is-solid", solid);
  }
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  /* =========================================================
     Menú móvil
     ========================================================= */
  var navToggle = $("[data-nav-toggle]");
  var nav = $("[data-nav]");
  function setNav(open) {
    if (!navToggle || !nav) return;
    navToggle.setAttribute("aria-expanded", String(open));
    $(".sr-only", navToggle).textContent = open ? "Cerrar menú" : "Abrir menú";
    nav.classList.toggle("is-open", open);
    document.body.classList.toggle("nav-open", open);
    updateHeader();
  }
  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      setNav(navToggle.getAttribute("aria-expanded") !== "true");
    });
    $$("a", nav).forEach(function (link) {
      link.addEventListener("click", function () { setNav(false); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        setNav(false);
        navToggle.focus();
      }
    });
    window.matchMedia("(min-width: 960px)").addEventListener("change", function (mq) {
      if (mq.matches) setNav(false);
    });
  }

  /* =========================================================
     Enlace activo del menú según la sección visible
     ========================================================= */
  var navLinks = $$('.site-nav ul a[href^="#"]');
  if ("IntersectionObserver" in window && navLinks.length) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) {
          var active = link.getAttribute("href") === "#" + entry.target.id;
          if (active) link.setAttribute("aria-current", "true");
          else link.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    navLinks.forEach(function (link) {
      var section = $(link.getAttribute("href"));
      if (section) sectionObserver.observe(section);
    });
  }

  /* =========================================================
     Aparición suave al hacer scroll
     ========================================================= */
  var reveals = $$(".reveal");
  if (!reducedMotion && "IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { revealObserver.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* =========================================================
     Vídeo del hero
     ========================================================= */
  var video = $("[data-hero-video]");
  var videoToggle = $("[data-video-toggle]");
  if (video) {
    var saveData = navigator.connection && navigator.connection.saveData;
    var userPaused = false;

    var setPausedUI = function (paused) {
      if (!videoToggle) return;
      videoToggle.setAttribute("aria-pressed", String(paused));
      $("[data-video-toggle-label]", videoToggle).textContent = paused ? "Reproducir vídeo de fondo" : "Pausar vídeo de fondo";
    };

    if (reducedMotion || saveData) {
      // Respetamos la preferencia del usuario: se queda la imagen fija
      video.removeAttribute("autoplay");
      video.pause();
      userPaused = true;
      setPausedUI(true);
    }

    if (videoToggle) {
      videoToggle.addEventListener("click", function () {
        if (video.paused) {
          userPaused = false;
          video.play().catch(function () {});
          setPausedUI(false);
        } else {
          userPaused = true;
          video.pause();
          setPausedUI(true);
        }
      });
    }

    // Pausa el vídeo cuando no se ve para ahorrar batería y CPU
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        if (userPaused) return;
        if (entries[0].isIntersecting) video.play().catch(function () {});
        else video.pause();
      }).observe(video);
    }
  }

  /* =========================================================
     Lightbox de la galería
     ========================================================= */
  var dialog = $("[data-lightbox-dialog]");
  var galleryLinks = $$("[data-lightbox]");
  if (dialog && galleryLinks.length && typeof dialog.showModal === "function") {
    var lbImg = $("[data-lightbox-img]", dialog);
    var lbCaption = $("[data-lightbox-caption]", dialog);
    var current = 0;
    var lastTrigger = null;

    var show = function (index) {
      current = (index + galleryLinks.length) % galleryLinks.length;
      var link = galleryLinks[current];
      var thumb = $("img", link);
      lbImg.src = link.getAttribute("href");
      lbImg.alt = thumb ? thumb.alt : "";
      lbCaption.textContent = (thumb ? thumb.alt : "") + " (" + (current + 1) + " de " + galleryLinks.length + ")";
    };

    galleryLinks.forEach(function (link, i) {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        lastTrigger = link;
        show(i);
        dialog.showModal();
      });
    });

    $("[data-lightbox-prev]", dialog).addEventListener("click", function () { show(current - 1); });
    $("[data-lightbox-next]", dialog).addEventListener("click", function () { show(current + 1); });
    $("[data-lightbox-close]", dialog).addEventListener("click", function () { dialog.close(); });

    dialog.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") show(current - 1);
      if (e.key === "ArrowRight") show(current + 1);
    });
    // Clic fuera de la imagen cierra
    dialog.addEventListener("click", function (e) {
      if (e.target === dialog) dialog.close();
    });
    dialog.addEventListener("close", function () {
      if (lastTrigger) lastTrigger.focus();
    });

    // Deslizar en móvil
    var touchX = null;
    dialog.addEventListener("touchstart", function (e) { touchX = e.touches[0].clientX; }, { passive: true });
    dialog.addEventListener("touchend", function (e) {
      if (touchX === null) return;
      var dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
      touchX = null;
    });
  }

  /* =========================================================
     Carrusel de opiniones
     ========================================================= */
  $$("[data-carousel]").forEach(function (carousel) {
    var track = $("[data-carousel-track]", carousel);
    var slides = $$(".review", track);
    var prev = $("[data-carousel-prev]", carousel);
    var next = $("[data-carousel-next]", carousel);
    var dotsWrap = $("[data-carousel-dots]", carousel);
    if (!track || !slides.length) return;

    var dots = slides.map(function (slide, i) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("aria-label", "Ir a la opinión " + (i + 1));
      dot.addEventListener("click", function () { goTo(i); });
      dotsWrap.appendChild(dot);
      return dot;
    });

    function slideStep() {
      return slides.length > 1 ? slides[1].offsetLeft - slides[0].offsetLeft : track.clientWidth;
    }
    function currentIndex() {
      return Math.round(track.scrollLeft / slideStep());
    }
    function goTo(i) {
      track.scrollTo({ left: i * slideStep(), behavior: reducedMotion ? "auto" : "smooth" });
    }
    function update() {
      var idx = currentIndex();
      var maxScroll = track.scrollWidth - track.clientWidth - 2;
      dots.forEach(function (d, i) {
        if (i === idx) d.setAttribute("aria-current", "true");
        else d.removeAttribute("aria-current");
      });
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= maxScroll;
    }

    prev.addEventListener("click", function () { goTo(currentIndex() - 1); });
    next.addEventListener("click", function () { goTo(currentIndex() + 1); });
    track.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { e.preventDefault(); goTo(currentIndex() - 1); }
      if (e.key === "ArrowRight") { e.preventDefault(); goTo(currentIndex() + 1); }
    });

    var ticking = false;
    track.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () { update(); ticking = false; });
    }, { passive: true });
    window.addEventListener("resize", update);
    update();
  });

  /* =========================================================
     Horario: resalta el día de hoy y muestra si está abierto
     (hora de Murcia, aunque el visitante esté en otro huso)
     ========================================================= */
  var hoursTable = $("[data-hours]");
  if (hoursTable) {
    var schedule = { 0: null, 1: [7, 21], 2: [7, 21], 3: [7, 21], 4: [7, 21], 5: [7, 21], 6: [9, 14] };
    var now = new Date();
    var day = now.getDay();
    var hourDecimal = now.getHours() + now.getMinutes() / 60;

    try {
      var parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/Madrid", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false
      }).formatToParts(now);
      var get = function (type) { return (parts.filter(function (p) { return p.type === type; })[0] || {}).value; };
      day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
      hourDecimal = (parseInt(get("hour"), 10) % 24) + parseInt(get("minute"), 10) / 60;
    } catch (e) { /* se usa la hora local */ }

    var row = $('tr[data-day="' + day + '"]', hoursTable);
    if (row) row.classList.add("is-today");

    var status = $("[data-open-status]");
    if (status) {
      var range = schedule[day];
      var isOpen = range && hourDecimal >= range[0] && hourDecimal < range[1];
      status.textContent = isOpen ? "Abierto ahora" : "Cerrado ahora";
      status.classList.toggle("is-open", !!isOpen);
    }
  }

  /* =========================================================
     Consentimiento de cookies (RGPD / LSSI)
     - Nada de terceros se carga sin consentimiento.
     - La elección se guarda 12 meses y se puede cambiar
       en "Configurar cookies" del pie.
     ========================================================= */
  var CONSENT_KEY = "mg_cookie_consent";
  var CONSENT_VERSION = 1;
  var CONSENT_MAX_AGE = 365 * 24 * 60 * 60 * 1000;

  var banner = $("[data-cookie-banner]");
  var form = $("[data-cookie-form]");
  var btnAccept = $("[data-cookie-accept]");
  var btnReject = $("[data-cookie-reject]");
  var btnConfigure = $("[data-cookie-configure]");
  var btnSave = $("[data-cookie-save]");
  var chkExternal = $("[data-cookie-external]");
  var chkAnalytics = $("[data-cookie-analytics]");

  function readConsent() {
    var c = store.get(CONSENT_KEY);
    if (!c || c.version !== CONSENT_VERSION || !c.date) return null;
    if (Date.now() - c.date > CONSENT_MAX_AGE) return null;
    return c;
  }

  function applyConsent(c) {
    if (c && c.external) loadMap();
    if (c && c.analytics) loadAnalytics();
  }

  function saveConsent(external, analytics) {
    var previous = readConsent();
    var c = { version: CONSENT_VERSION, date: Date.now(), necessary: true, external: !!external, analytics: !!analytics };
    store.set(CONSENT_KEY, c);
    hideBanner();
    // Si se retira un permiso ya concedido, recargamos para descargar el servicio
    if ((previous && previous.external && !c.external) || (previous && previous.analytics && !c.analytics)) {
      window.location.reload();
      return;
    }
    applyConsent(c);
  }

  function showBanner(withSettings) {
    if (!banner) return;
    var c = readConsent();
    if (chkExternal) chkExternal.checked = !!(c && c.external);
    if (chkAnalytics) chkAnalytics.checked = !!(c && c.analytics);
    toggleSettings(!!withSettings);
    banner.hidden = false;
  }

  function hideBanner() {
    if (banner) banner.hidden = true;
  }

  function toggleSettings(open) {
    if (!form) return;
    form.hidden = !open;
    btnSave.hidden = !open;
    btnConfigure.setAttribute("aria-expanded", String(open));
  }

  if (banner) {
    btnAccept.addEventListener("click", function () { saveConsent(true, true); });
    btnReject.addEventListener("click", function () { saveConsent(false, false); });
    btnConfigure.addEventListener("click", function () {
      toggleSettings(form.hidden);
      if (!form.hidden && chkExternal) chkExternal.focus();
    });
    btnSave.addEventListener("click", function () {
      saveConsent(chkExternal.checked, chkAnalytics.checked);
    });

    var existing = readConsent();
    if (existing) applyConsent(existing);
    else showBanner(false);
  }

  $$("[data-cookie-settings]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      showBanner(true);
      btnConfigure.focus();
    });
  });

  /* ---------- Mapa de Google (solo con permiso) ---------- */
  var mapLoaded = false;
  function loadMap() {
    var frame = $("[data-map]");
    if (!frame || mapLoaded) return;
    mapLoaded = true;
    var iframe = document.createElement("iframe");
    iframe.src = frame.getAttribute("data-map-src");
    iframe.title = "Mapa de Google con la ubicación de Método Golden en Cabezo de Torres";
    iframe.loading = "lazy";
    iframe.referrerPolicy = "no-referrer-when-downgrade";
    iframe.setAttribute("allowfullscreen", "");
    frame.appendChild(iframe);
    var placeholder = $("[data-map-placeholder]", frame);
    if (placeholder) placeholder.remove();
  }
  var mapButton = $("[data-map-load]");
  if (mapButton) {
    // Carga puntual: solo para esta visita, no cambia la preferencia guardada
    mapButton.addEventListener("click", loadMap);
  }

  /* ---------- Analítica (vacío a propósito) ----------
     Si en el futuro añadís Google Analytics u otra herramienta,
     insertad aquí su script: solo se ejecutará con consentimiento. */
  function loadAnalytics() {}
})();
