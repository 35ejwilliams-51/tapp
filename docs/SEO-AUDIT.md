# TAPP — SEO Audit & Roadmap

_Last updated: 2026-06-30_

TAPP is a React + Vite SPA deployed on Vercel. Positioning: **"Your AI trading desk — cleaner charts, higher-conviction setups."** It scans markets and produces ICT/SMC trade plans. It is **educational, not financial advice, and never executes trades** — this framing matters for both copy and compliance, and should be consistent across all indexable pages.

---

## 1. Current state

Before this pass, `index.html` contained only `charset`, `viewport`, and `<title>TAPP</title>`. That means:

- No description, no social preview, no canonical, no favicon hints.
- A bare one-word title with zero keyword or positioning signal.
- Crucially, **all content is rendered client-side by `/src/main.jsx`** — see the limitation in §3.

## 2. Additions made to `index.html`

All edits were additive and safe (the module script and `#root` div are untouched):

- `<html lang="en">` — confirmed already present.
- Descriptive `<title>` using TAPP positioning.
- `meta description` (with the "educational, never executes trades" framing).
- `meta theme-color` = `#07090D`.
- Open Graph: `og:title`, `og:description`, `og:type=website`, `og:site_name`, `og:image` (`/og-image.png`), `og:url`.
- Twitter card: `summary_large_image` + title/description/image.
- `canonical` → `https://tapp.app/` (placeholder).
- Favicon `<link>` (placeholder `/favicon.svg`).

**Replace the placeholders** (`tapp.app`, `/og-image.png`, `/favicon.svg`) with real production values. Add the `og-image.png` (1200×630) and `favicon.svg` to `/public` so Vite serves them at the root.

---

## 3. The fundamental limitation: a Vite SPA serves an empty shell

This is the single most important finding. A standard Vite React build ships an `index.html` whose `<body>` is essentially `<div id="root"></div>` plus a JS bundle. React fills `#root` **in the browser, after JS loads**.

- The `<head>` tags we just added (title, description, OG) **are** in the static HTML, so they work for link previews and basic indexing of the home URL.
- But **page body content, headings, and any per-route metadata** (e.g. `/pricing`, `/features`, `/blog/...`) exist only after JS executes. Many crawlers, link unfurlers, and AI/answer engines see an empty shell for everything below `<head>`.
- React Helmet / `react-helmet-async` updates tags client-side — useful for users and Google's deferred render queue, but **not** present in the initial HTML, so it does not reliably help non-JS crawlers or social scrapers.

### Options to fix it (marketing/indexable pages)

| Option | What it is | Pros | Cons |
|---|---|---|---|
| **A. Prerender at build (`vite-plugin-prerender` / `react-snap` / `vite-plugin-ssg`)** | Build step renders chosen routes to static HTML, hydrated on load. | Stays inside the existing Vite app; cheap; no new framework; per-route HTML with real content + meta. | Only works well for **static** marketing routes; dynamic/auth pages can't be prerendered; some plugins are lightly maintained; extra build config. |
| **B. Static/SSR marketing layer in front (Astro or Next.js)** | Marketing site (home, pricing, features, blog) built in Astro/Next; the actual app (`/app/*`) stays the Vite SPA. | Best-in-class SEO for the pages that need it; first-class meta/JSON-LD/sitemap; blog/content scales well. | New framework + repo/route boundary to maintain; more moving parts; routing/handoff between marketing and app. |
| **C. Do nothing (SPA only)** | Rely on the static `<head>` + Google's JS rendering. | Zero cost. | Weak for non-Google crawlers, social scrapers, and AI answer engines; per-route SEO essentially absent. |

### Recommendation

Given the locked decision to **"evolve the Vite app, lean budget,"** start with **Option A — build-time prerendering** for the marketing routes (`/`, `/pricing`, `/features`, plus any static legal/about pages). It keeps everything in one Vite codebase, costs little, and gets real HTML + per-route meta in front of crawlers. Pair it with `react-helmet-async` so each route declares its own title/description that the prerenderer bakes in.

Treat **Option B (Astro front-end for marketing)** as the upgrade path **if/when content marketing (a blog, many landing pages) becomes a priority** — that is where Astro's authoring + SEO ergonomics pay for the added complexity. Keep the app routes as the SPA either way.

---

## 4. Semantic heading structure

For each prerendered/marketing page:

- Exactly **one `<h1>`** per page describing that page's intent. Home: e.g. _"Your AI trading desk — cleaner charts, higher-conviction setups."_
- `<h2>` for major sections (How it works, Features, Pricing, FAQ), `<h3>` for sub-points. **Don't skip levels** for styling — style with CSS, keep the order logical.
- Use landmarks: `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`. One `<main>` per page.
- Descriptive link text ("See pricing", not "click here"); `alt` text on chart/feature images; visible, indexable text rather than text baked into images.

---

## 5. `sitemap.xml` + `robots.txt`

Place both in `/public` so Vite serves them at the site root. Update URLs/dates as routes change (a prerender/build script can generate the sitemap automatically).

**`/public/robots.txt`**

```
User-agent: *
Allow: /
Disallow: /app/
Disallow: /api/

Sitemap: https://tapp.app/sitemap.xml
```

> Disallow the in-app/authenticated areas (`/app/`, `/api/`) — they aren't useful in search and may be gated anyway. Keep marketing routes crawlable.

**`/public/sitemap.xml`**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://tapp.app/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://tapp.app/features</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://tapp.app/pricing</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

---

## 6. Structured data (JSON-LD)

Add JSON-LD to the home page `<head>` (bake it in via the prerender step so crawlers see it). Two relevant types:

**Organization**

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "TAPP",
  "url": "https://tapp.app/",
  "logo": "https://tapp.app/og-image.png",
  "description": "TAPP is an AI trading desk that scans markets and delivers ICT/SMC trade plans. Educational analysis only — TAPP does not execute trades or provide financial advice."
}
</script>
```

**SoftwareApplication**

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "TAPP",
  "applicationCategory": "FinanceApplication",
  "operatingSystem": "Web",
  "url": "https://tapp.app/",
  "description": "Your AI trading desk — cleaner charts, higher-conviction setups. Market scanning and ICT/SMC trade plans for self-directed traders. Educational; not financial advice.",
  "offers": {
    "@type": "Offer",
    "price": "0.00",
    "priceCurrency": "USD",
    "description": "Subscription plans available."
  }
}
```

> Update `offers` to reflect real pricing. Validate with Google's Rich Results Test before shipping. Avoid `Review`/`AggregateRating` markup unless you have genuine reviews.

---

## 7. Performance basics (Core Web Vitals)

Vite + Vercel gives a good baseline; protect it:

- **Code-split routes** (`React.lazy` + dynamic `import()`) so the marketing pages don't ship the whole app bundle. Smaller initial JS → better LCP/INP.
- **Images**: serve WebP/AVIF, set explicit `width`/`height` (avoids CLS), lazy-load below-the-fold, and keep `og-image.png` reasonably sized.
- **Fonts**: `font-display: swap`, preload the primary font, subset if possible.
- **Caching/CDN**: Vercel handles this; ensure hashed asset filenames (Vite default) for long cache lifetimes.
- Measure with Lighthouse / PageSpeed Insights on the **deployed** URL, not dev. Target LCP < 2.5s, CLS < 0.1, INP < 200ms.

---

## 8. Keyword themes (trading-signals / ICT audience)

Cluster content around intent. TAPP's edge is the AI desk + ICT/SMC methodology, so lean into method-specific terms competitors of general "stock app" type don't rank for.

- **Core / brand-adjacent**: AI trading desk, AI trade plans, trade setup scanner, higher-conviction setups, cleaner charts.
- **Methodology (high intent, lower competition)**: ICT trading, Smart Money Concepts (SMC), order blocks, fair value gaps (FVG), liquidity sweeps, market structure shifts, premium/discount arrays, killzones.
- **Use-case / problem**: how to find high-probability setups, ICT trade plan generator, market scanner for ICT/SMC, trade idea generator.
- **Audience**: self-directed traders, day traders, forex/futures/crypto traders (match to actual covered markets).
- **Trust/disclaimer terms** (own them honestly): "educational, not financial advice", "TAPP does not execute trades" — reinforces compliance and matches how cautious users search.

**Content actions**: one focused landing page per major cluster (an "ICT trade plans" page, an "SMC scanner" page), an FAQ section (good for `FAQPage` schema and answer-engine pickup), and — once a content layer exists (Option B) — a glossary/blog targeting the long-tail methodology terms above.

---

## 9. Priority checklist

1. **(Done)** Static `<head>` SEO in `index.html`.
2. Replace placeholders (domain, `og-image.png`, `favicon.svg`) with real assets in `/public`.
3. Add `robots.txt` + `sitemap.xml` to `/public`.
4. Implement **build-time prerendering (Option A)** for marketing routes + `react-helmet-async` per-route meta.
5. Bake in JSON-LD on the home page.
6. Enforce one-`h1`/semantic-landmark structure on marketing pages.
7. Code-split, optimize images/fonts; measure on the deployed URL.
8. Build out keyword-themed landing pages + FAQ.
