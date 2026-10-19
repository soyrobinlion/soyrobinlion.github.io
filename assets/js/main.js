/* =========================================================
   SOYROBINLION — main.js
   Navegación SPA, menú móvil, Canvas, animaciones y GitHub.
   Vanilla JavaScript. Sin dependencias.
   ========================================================= */

(function () {
  "use strict";

  /* ---------- Configuración ---------- */

  var prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  var GH_USER = "soyrobinlion";

  var VIEWS = {
    home: {
      hash: "#inicio",
      title: "ROBIN LION — Desarrollador de Software Full Stack",
    },
    about: {
      path: "./views/about/index.html",
      hash: "#sobre-mi",
      title: "Sobre mí — ROBIN LION",
    },
    technology: {
      path: "./views/technology/index.html",
      hash: "#tecnologia",
      title: "Tecnología — ROBIN LION",
    },
    repositories: {
      path: "./views/repositories/index.html",
      hash: "#repositorios",
      title: "Repositorios — ROBIN LION",
    },
    GitHub: {
      path: "./views/GitHub/index.html",
      hash: "#github",
      title: "GitHub — ROBIN LION",
    },
  };

  var currentView = "home";
  var navigationId = 0;

  /* ---------- Elementos principales ---------- */

  var toggle = document.getElementById("nav-toggle");
  var menu = document.getElementById("nav-menu");
  var header = document.querySelector(".site-header");

  // Recomendado: envolver el hero inicial con #view-container.
  // Si todavía no existe, usamos #main como alternativa.
  var main = document.getElementById("main");
  var viewContainer = document.getElementById("view-container") || main;

  // Guardar el HTML original para restaurar Inicio sin duplicarlo.
  var homeHTML = viewContainer ? viewContainer.innerHTML : "";

  var yearEl = document.getElementById("year");

  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* ---------- Menú móvil ---------- */

  function closeMenu() {
    if (!toggle || !menu) return;

    menu.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Abrir menú");
  }

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var isOpen = menu.classList.toggle("open");

      toggle.setAttribute("aria-expanded", String(isOpen));
      toggle.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeMenu();
    });

    document.addEventListener("click", function (event) {
      if (
        menu.classList.contains("open") &&
        !menu.contains(event.target) &&
        !toggle.contains(event.target)
      ) {
        closeMenu();
      }
    });
  }

  /* ---------- Header al hacer scroll ---------- */

  function onScroll() {
    if (!header) return;

    header.classList.toggle("scrolled", window.scrollY > 12);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Navegación SPA ---------- */

  function normalizeViewName(name) {
    return Object.prototype.hasOwnProperty.call(VIEWS, name) ? name : null;
  }

  function viewFromHash(hash) {
    var keys = Object.keys(VIEWS);

    for (var i = 0; i < keys.length; i++) {
      if (VIEWS[keys[i]].hash === hash) {
        return keys[i];
      }
    }

    return "home";
  }

  function updateActiveLink(viewName) {
    if (!menu) return;

    menu.querySelectorAll("[data-view]").forEach(function (link) {
      var active = link.dataset.view === viewName;

      link.classList.toggle("active", active);

      if (active) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  function revealContent(root) {
    if (!root) return;

    var elements = root.querySelectorAll(".reveal");

    elements.forEach(function (element) {
      if (prefersReduced || !("IntersectionObserver" in window)) {
        element.classList.add("in");
        return;
      }

      element.classList.remove("in");

      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;

            entry.target.classList.add("in");
            observer.unobserve(entry.target);
          });
        },
        {
          threshold: 0.12,
          rootMargin: "0px 0px -8% 0px",
        },
      );

      observer.observe(element);
    });
  }

  async function showView(name, options) {
    options = options || {};

    name = normalizeViewName(name);
    if (!name || !viewContainer) return;

    var requestId = ++navigationId;

    // Restaurar Inicio usando el contenido original.
    if (name === "home") {
      viewContainer.innerHTML = homeHTML;
      currentView = "home";
      document.title = VIEWS.home.title;
    } else {
      var view = VIEWS[name];

      try {
        viewContainer.setAttribute("aria-busy", "true");

        var response = await fetch(view.path, {
          headers: { Accept: "text/html" },
        });

        if (!response.ok) {
          throw new Error(
            "Error HTTP " + response.status + " al cargar " + view.path,
          );
        }

        var html = await response.text();

        // Ignorar respuestas antiguas si el usuario cambió de sección.
        if (requestId !== navigationId) return;

        var doc = new DOMParser().parseFromString(html, "text/html");

        // Las vistas pueden utilizar #view-content o <main>.
        var content =
          doc.querySelector("#view-content") ||
          doc.querySelector("main") ||
          doc.querySelector("section");

        if (!content) {
          throw new Error(
            "La vista no contiene #view-content, main ni section.",
          );
        }

        // Solo se inserta el contenido; no se reemplaza index.html.
        viewContainer.innerHTML = content.innerHTML;

        currentView = name;
        document.title = doc.title || view.title;
      } catch (error) {
        if (requestId !== navigationId) return;

        console.error("Error al cargar la vista:", error);

        // Mantener la página principal si falla una sección.
        if (currentView === "home") {
          viewContainer.innerHTML = homeHTML;
        }

        viewContainer.removeAttribute("aria-busy");

        document.dispatchEvent(
          new CustomEvent("spa:error", {
            detail: { view: name, error: error },
          }),
        );

        return;
      } finally {
        if (requestId === navigationId) {
          viewContainer.removeAttribute("aria-busy");
        }
      }
    }

    if (options.updateHistory !== false) {
      var hash = VIEWS[name].hash;

      if (window.location.hash !== hash) {
        history.pushState({ view: name }, "", hash);
      }
    }

    updateActiveLink(name);
    closeMenu();
    window.scrollTo({ top: 0, behavior: "auto" });

    revealContent(viewContainer);

    // Actualizar año si la vista contiene este elemento.
    var viewYear = viewContainer.querySelector("#year");

    if (viewYear) {
      viewYear.textContent = String(new Date().getFullYear());
    }

    // Permite inicializar funciones específicas de cada vista.
    document.dispatchEvent(
      new CustomEvent("spa:view", {
        detail: { view: name },
      }),
    );
  }

  // Navegar al pulsar los enlaces del menú.
  document.addEventListener("click", function (event) {
    var link = event.target.closest("a[data-view]");

    if (
      !link ||
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      link.target === "_blank" ||
      link.hasAttribute("download")
    ) {
      return;
    }

    var name = normalizeViewName(link.dataset.view);

    if (!name) return;

    event.preventDefault();
    showView(name);
  });

  // Atrás y adelante sin recargar el documento.
  window.addEventListener("popstate", function () {
    showView(viewFromHash(window.location.hash), {
      updateHistory: false,
    });
  });

  // Permitir abrir una sección directamente mediante su hash.
  var initialView = viewFromHash(window.location.hash);

  updateActiveLink(initialView);

  if (initialView !== "home") {
    showView(initialView, { updateHistory: false });
  } else {
    revealContent(viewContainer);
  }

  /* ---------- Animaciones reveal de la página inicial ---------- */

  function initReveals() {
    revealContent(viewContainer);
  }

  initReveals();

  /* ---------- Fondo Canvas animado ---------- */

  var canvas = document.getElementById("bg-canvas");

  if (canvas && !prefersReduced) {
    var ctx = null;

    try {
      ctx = canvas.getContext("2d");
    } catch (error) {
      ctx = null;
    }

    if (ctx) {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var particles = [];
      var rafId = null;
      var resizeTimer = null;

      function initParticles() {
        var width = window.innerWidth;
        var height = window.innerHeight;
        var count = Math.min(Math.floor((width * height) / 16000), 90);

        particles = [];

        for (var i = 0; i < count; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            r: Math.random() * 1.6 + 0.4,
          });
        }
      }

      function resizeCanvas() {
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        canvas.style.width = window.innerWidth + "px";
        canvas.style.height = window.innerHeight + "px";

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        initParticles();
      }

      function draw() {
        var width = window.innerWidth;
        var height = window.innerHeight;

        ctx.clearRect(0, 0, width, height);

        for (var i = 0; i < particles.length; i++) {
          var p = particles[i];

          p.x += p.vx;
          p.y += p.vy;

          if (p.x < 0) p.x = width;
          else if (p.x > width) p.x = 0;

          if (p.y < 0) p.y = height;
          else if (p.y > height) p.y = 0;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(94, 234, 212, 0.45)";
          ctx.fill();
        }

        for (var a = 0; a < particles.length; a++) {
          for (var b = a + 1; b < particles.length; b++) {
            var dx = particles[a].x - particles[b].x;
            var dy = particles[a].y - particles[b].y;
            var distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 120) {
              ctx.beginPath();
              ctx.moveTo(particles[a].x, particles[a].y);
              ctx.lineTo(particles[b].x, particles[b].y);

              ctx.strokeStyle =
                "rgba(56, 189, 248, " + 0.12 * (1 - distance / 120) + ")";

              ctx.lineWidth = 1;
              ctx.stroke();
            }
          }
        }

        rafId = requestAnimationFrame(draw);
      }

      function startCanvas() {
        if (!rafId && !document.hidden) {
          rafId = requestAnimationFrame(draw);
        }
      }

      function stopCanvas() {
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      }

      document.addEventListener("visibilitychange", function () {
        if (document.hidden) stopCanvas();
        else startCanvas();
      });

      window.addEventListener("resize", function () {
        clearTimeout(resizeTimer);

        resizeTimer = setTimeout(function () {
          dpr = Math.min(window.devicePixelRatio || 1, 2);
          resizeCanvas();
        }, 180);
      });

      resizeCanvas();
      startCanvas();
    }
  }

  /* ---------- Utilidades para repositorios GitHub ---------- */

  function showFallback() {
    var fallback = document.getElementById("repo-fallback");

    if (fallback) fallback.hidden = false;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[character];
    });
  }

  function langColor(language) {
    var colors = {
      JavaScript: "#f1e05a",
      TypeScript: "#3178c6",
      HTML: "#e34c26",
      CSS: "#563d7c",
      PHP: "#4f5d95",
      Laravel: "#ff2d20",
    };

    return colors[language] || "#8b949e";
  }

  // Inicialización de repositorios cuando una vista los necesita.
  async function loadRepositories() {
    var repoGrid = document.getElementById("repo-grid");
    if (!repoGrid) return;

    var fallback = document.getElementById("repo-fallback");

    try {
      var response = await fetch(
        "https://api.github.com/users/" +
          encodeURIComponent(GH_USER) +
          "/repos?sort=updated&per_page=12",
      );

      if (!response.ok) {
        throw new Error("GitHub API: HTTP " + response.status);
      }

      var repos = await response.json();

      if (!Array.isArray(repos) || repos.length === 0) {
        showFallback();
        return;
      }

      repoGrid.innerHTML = repos
        .map(function (repo) {
          var name = escapeHtml(repo.name);
          var description = escapeHtml(
            repo.description || "Repositorio de " + GH_USER,
          );
          var language = repo.language ? escapeHtml(repo.language) : "Varios";

          var color = langColor(repo.language);

          return (
            '<article class="repo-card">' +
            '<h3><a href="' +
            escapeHtml(repo.html_url) +
            '" target="_blank" rel="noopener noreferrer">' +
            name +
            "</a></h3>" +
            "<p>" +
            description +
            "</p>" +
            '<span class="repo-language">' +
            '<span class="repo-language-dot" style="background:' +
            color +
            '"></span>' +
            language +
            "</span>" +
            "</article>"
          );
        })
        .join("");

      if (fallback) fallback.hidden = true;
    } catch (error) {
      console.error("No se pudieron cargar los repositorios:", error);
      showFallback();
    }
  }

  // Las funciones se ejecutan después de insertar una vista.
  document.addEventListener("spa:view", function (event) {
    var view = event.detail && event.detail.view;

    if (view === "repositories") {
      loadRepositories();
    }
  });

  // Exponer utilidades únicamente dentro de este módulo.
  // escapeHtml y langColor quedan listas para ampliaciones futuras.
})();
