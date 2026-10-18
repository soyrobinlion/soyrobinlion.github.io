# SOYROBINLION — Home personal de GitHub

SOYROBINLION es la **Home personal de GitHub** de `soyrobinlion`. No es un portafolio profesional — es un espacio para compartir identidad digital, intereses tecnológicos y descubrir repositorios.

Perfil oficial: <https://github.com/soyrobinlion>

## Propósito

- Presentar la identidad digital SOYROBINLION.
- Explorar intereses tecnológicos mediante tarjetas visuales.
- Descubrir repositorios públicos (vía API pública de GitHub, con fallback honesto).
- Conectar con el perfil de GitHub.

## Tecnologías

Exclusivamente HTML5, CSS3 y JavaScript nativo. Sin frameworks, sin dependencias y sin compilación.

## Estructura

```
.
├── index.html
├── assets/
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   └── main.js
│   └── img/
│       ├── favicon.svg
│       └── cover.svg
├── README.md
└── .nojekyll
```

## Ejecución local

```bash
python3 -m http.server 8000
```

Abre <http://localhost:8000>. No requiere `npm install` ni ningún servidor Node.js.

## Publicación en GitHub Pages

1. Sube el contenido a la rama principal del repositorio.
2. En GitHub: **Settings → Pages**.
3. Selecciona la rama principal y la carpeta raíz (`/`).
4. El archivo `.nojekyll` evita el procesado con Jekyll.

## Características

- Diseño futurista, responsive (320 px → escritorio) y accesible.
- Fondo animado en Canvas que respeta `prefers-reduced-motion`.
- **Reveal con mejora progresiva:** el contenido es visible por defecto; solo se oculta temporalmente cuando JavaScript está activo. Si JS falla, todo se muestra.
- Menú móvil accesible (Escape, clic fuera, navegación por teclado).
- Carga opcional de repositorios desde la API pública de GitHub. Si no hay red o la API falla, se muestra un enlace directo al perfil.
- Año actual automático en el footer.

## Personalización

- **Universo tecnológico:** edita las tarjetas en la sección `#universe` de `index.html`.
- **Colores:** modifica las variables CSS en `:root` (`assets/css/styles.css`).
- **Usuario de GitHub:** cambia `GH_USER` en `assets/js/main.js` si cambia de usuario.
