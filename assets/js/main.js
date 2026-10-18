/* SOYROBINLION — main.js
   Vanilla JS: progressive-enhancement reveals, mobile menu, Canvas,
   scroll spy, year, and optional GitHub public API for repositories.
   No dependencies. Fails safe: content stays visible if anything breaks. */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  /* ---------- Año actual ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Menú móvil ---------- */
  var toggle = document.getElementById("nav-toggle");
  var menu = document.getElementById("nav-menu");

  function closeMenu() {
    if (!toggle || !menu) return;
    menu.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Abrir menú");
  }

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    });

    Array.prototype.forEach.call(menu.querySelectorAll("a"), function (link) {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });

    document.addEventListener("click", function (e) {
      if (
        menu.classList.contains("open") &&
        !menu.contains(e.target) &&
        !toggle.contains(e.target)
      ) {
        closeMenu();
      }
    });
  }

  /* ---------- Header sombra al hacer scroll ---------- */
  var header = document.querySelector(".site-header");
  function onScroll() {
    if (!header) return;
    if (window.scrollY > 12) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Scroll spy (sección activa) ---------- */
  var navLinks = Array.prototype.slice.call(
    document.querySelectorAll(".nav-menu a"),
  );
  var sections = navLinks
    .map(function (l) {
      return document.querySelector(l.getAttribute("href"));
    })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var id = "#" + entry.target.id;
          navLinks.forEach(function (l) {
            l.classList.toggle("active", l.getAttribute("href") === id);
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach(function (s) {
      spy.observe(s);
    });
  }

  /* ---------- Reveal on scroll (con fallback) ----------
     Importante: si por cualquier motivo el observer no dispara,
     forzamos la visibilidad tras un tiempo de seguridad. */
  var reveals = Array.prototype.slice.call(
    document.querySelectorAll(".reveal"),
  );

  function forceRevealAll() {
    reveals.forEach(function (el) {
      el.classList.add("in");
    });
  }

  if (
    prefersReduced ||
    !("IntersectionObserver" in window) ||
    !reveals.length
  ) {
    forceRevealAll();
  } else {
    var revObs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            revObs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    reveals.forEach(function (el) {
      revObs.observe(el);
    });

    // Red de seguridad: muestra todo después de 2.5s aunque el observer no haya disparado.
    window.setTimeout(forceRevealAll, 2500);
    window.addEventListener("load", function () {
      // tras la carga completa, asegura que lo visible ya está revelado
      window.setTimeout(forceRevealAll, 400);
    });
  }

  /* ---------- Fondo Canvas ---------- */
  var canvas = document.getElementById("bg-canvas");
  if (canvas && !prefersReduced) {
    var ctx = null;
    try {
      ctx = canvas.getContext("2d");
    } catch (e) {
      ctx = null;
    }

    if (ctx) {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var particles = [];
      var rafId = null;

      function resize() {
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        canvas.style.width = window.innerWidth + "px";
        canvas.style.height = window.innerHeight + "px";
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        initParticles();
      }

      function initParticles() {
        var area = window.innerWidth * window.innerHeight;
        var count = Math.min(Math.floor(area / 16000), 90);
        particles = [];
        for (var i = 0; i < count; i++) {
          particles.push({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            r: Math.random() * 1.6 + 0.4,
          });
        }
      }

      function draw() {
        var w = window.innerWidth;
        var h = window.innerHeight;
        ctx.clearRect(0, 0, w, h);

        for (var i = 0; i < particles.length; i++) {
          var p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0) p.x = w;
          else if (p.x > w) p.x = 0;
          if (p.y < 0) p.y = h;
          else if (p.y > h) p.y = 0;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(94, 234, 212, 0.45)";
          ctx.fill();
        }

        for (var a = 0; a < particles.length; a++) {
          for (var b = a + 1; b < particles.length; b++) {
            var dx = particles[a].x - particles[b].x;
            var dy = particles[a].y - particles[b].y;
            var dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
              ctx.beginPath();
              ctx.moveTo(particles[a].x, particles[a].y);
              ctx.lineTo(particles[b].x, particles[b].y);
              ctx.strokeStyle =
                "rgba(56, 189, 248, " + 0.12 * (1 - dist / 120) + ")";
              ctx.lineWidth = 1;
              ctx.stroke();
            }
          }
        }
        rafId = requestAnimationFrame(draw);
      }

      function start() {
        if (!rafId) rafId = requestAnimationFrame(draw);
      }
      function stop() {
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      }

      document.addEventListener("visibilitychange", function () {
        if (document.hidden) stop();
        else start();
      });

      if ("IntersectionObserver" in window) {
        var visObs = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) start();
            else stop();
          });
        });
        visObs.observe(canvas);
      } else {
        start();
      }

      var rt;
      window.addEventListener("resize", function () {
        clearTimeout(rt);
        rt = setTimeout(resize, 180);
      });

      resize();
    }
  }

  /* ---------- Repositorios de GitHub (API pública, opcional) ----------
     Intenta cargar los repositorios públicos del usuario. Si falla o no hay
     red, muestra una tarjeta honesta que enlaza directamente a GitHub.
     Nunca inventa datos. */
  var repoGrid = document.getElementById("repo-grid");
  var fallback = document.getElementById("repo-fallback");
  var GH_USER = "soyrobinlion";

  function showFallback() {
    if (fallback) fallback.hidden = false;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[c];
    });
  }

  function langColor(lang) {
    var colors = {
      JavaScript: "#f1e05a",
      TypeScript: "#3178c6",
      HTML: "#e34c26",
      CSS: "#563d7c",
      Python: "#3572A5",
      Vue: "#41b883",
      Shell: "#89e051",
      Go: "#00ADD8",
      Rust: "#dea584",
      Java: "#b07219",
      C: "#555555",
      "C++": "#f34b7d",
      PHP: "#4F5D95",
      Ruby: "#701516",
    };
    return colors[lang] || "#5eead4";
  }

  function renderRepos(list) {
    if (!repoGrid || !list || !list.length) {
      showFallback();
      return;
    }
    var html = list
      .map(function (r) {
        var desc = r.description
          ? escapeHtml(r.description)
          : "Sin descripción.";
        var lang = r.language
          ? '<span class="lang"><span class="lang-dot" style="background:' +
            langColor(r.language) +
            '"></span>' +
            escapeHtml(r.language) +
            "</span>"
          : "";
        var stars = "<span>★ " + (r.stargazers_count || 0) + "</span>";
        var forks = "<span>⑂ " + (r.forks_count || 0) + "</span>";
        return (
          '<a class="repo-item" href="' +
          escapeHtml(r.html_url) +
          '" target="_blank" rel="noopener noreferrer">' +
          '<div class="repo-item-head"><span class="repo-item-name">' +
          escapeHtml(r.name) +
          "</span></div>" +
          '<p class="repo-item-desc">' +
          desc +
          "</p>" +
          '<div class="repo-item-meta">' +
          lang +
          stars +
          forks +
          "</div>" +
          "</a>"
        );
      })
      .join("");
    repoGrid.innerHTML = html;
  }

  if (repoGrid && "fetch" in window) {
    var controller = "AbortController" in window ? new AbortController() : null;
    var timeoutId = window.setTimeout(function () {
      if (controller) controller.abort();
    }, 7000);

    fetch(
      "https://api.github.com/users/" +
        GH_USER +
        "/repos?sort=updated&per_page=8",
      controller ? { signal: controller.signal } : {},
    )
      .then(function (res) {
        window.clearTimeout(timeoutId);
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (data) {
        if (!Array.isArray(data)) throw new Error("Formato inesperado");
        renderRepos(data);
      })
      .catch(function () {
        window.clearTimeout(timeoutId);
        showFallback();
      });
  } else {
    showFallback();
  }
})();
