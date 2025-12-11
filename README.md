## Sennebogen Chiropractic Website

Static, single‑page marketing site for Sennebogen Chiropractic (Marietta, GA).

### Structure
- `index.html` – page markup and SEO/schema.
- `css/style.css` – design tokens + layout + responsive styles.
- `js/main.js` – mobile nav, smooth scroll, reveal + count‑up animations.
- `assets/` – images and favicon.
- `docs/diary.md` – internal change log.

### Local Preview
Open `index.html` in a browser. No build step required.

### Deployment Notes
- Replace the placeholder domain in `index.html`:
  - Open Graph `og:url`
  - JSON‑LD `url` and `image`
- Keep visible office hours and JSON‑LD hours in sync.

### Maintenance Tips
- Optimize new images to WebP/AVIF and provide `srcset` when possible.
- If the site grows (extra pages, blog, CMS), consider moving to a static site generator (Astro/Eleventy) to centralize data like phone/address/hours.

