# Método Golden — web

Web one-page del centro de pilates **Método Golden** (Cabezo de Torres, Murcia).
HTML, CSS y JavaScript sin dependencias ni proceso de compilación: basta con subir los archivos a cualquier hosting.

```
index.html          Página principal
styles.css          Estilos (paleta y tipografía en :root)
script.js           Menú, animaciones, galería, carrusel, horario y cookies
aviso-legal.html    Textos legales (plantillas)
privacidad.html
cookies.html
img/                Imágenes, vídeo, logo y favicon
fonts/              Tipografías alojadas localmente (Cormorant Garamond e Inter)
robots.txt, sitemap.xml
```

## Ver la web en local

Abre `index.html` en el navegador o, mejor, levanta un servidor:

```bash
npx serve .
```

## Pendiente de sustituir antes de publicar

Busca en el código los marcadores ✏️, 💶 y ⭐ y los textos entre `[corchetes]`.

| Qué | Dónde |
|---|---|
| Logo definitivo (PNG transparente, ~640×200 px) | `img/logo.png` |
| Vídeo del hero (720p, sin audio, < 4 MB) y su imagen fija | `img/hero.mp4`, `img/hero-poster.jpg` |
| Foto de Raquel (vertical) | `img/raquel.jpg` |
| Fotos del estudio | `img/estudio-1.jpg` … `img/estudio-6.jpg` |
| Texto "Sobre mí" (años de experiencia, formación) | `index.html`, bloque `data-editable="sobre-mi"` |
| Precios ("XX €") y contenido de cada bono | `index.html`, sección `#tarifas` |
| Reseñas reales de Google y quitar el aviso de ejemplo | `index.html`, sección `#opiniones` |
| Enlace a la ficha de Google (reseñas) | botón "Ver todas las opiniones en Google" |
| Perfil de Instagram | pie de página y `sameAs` del Schema.org |
| Titular, NIF, email y fecha | `aviso-legal.html`, `privacidad.html`, `cookies.html` |
| Dominio definitivo | `canonical`, `og:url`, `og:image`, Schema.org, `sitemap.xml`, `robots.txt` |

Las imágenes y el vídeo actuales son provisionales, libres de derechos, de [Pexels](https://www.pexels.com/license/).

## Privacidad (RGPD / LSSI)

- El banner ofrece **Aceptar**, **Rechazar** y **Configurar** con el mismo peso visual.
- La elección se guarda 12 meses en `localStorage` (`mg_cookie_consent`) y se puede cambiar desde "Configurar cookies" en el pie.
- Google Maps no se carga hasta que el usuario acepta los servicios de terceros o pulsa "Cargar mapa".
- Las fuentes se sirven desde `/fonts`, así que no se envían datos a Google Fonts.
- Para añadir analítica en el futuro, mete su script en `loadAnalytics()` de `script.js`: solo se ejecutará con consentimiento.
