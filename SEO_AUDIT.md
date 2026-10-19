# Pro Square Tiling — Free SEO Audit

For a local tradie, **most of the Google results come from the Map Pack** (the 3 businesses shown with a map). That's driven mostly by your **Google Business Profile + reviews**, then by the website. Both are free.

---

## Part A — Off-site (biggest impact, no code)

| # | Action | Why |
|---|--------|-----|
| 1 | **Claim/verify a [Google Business Profile](https://business.google.com)**. Category: *Tile contractor* (secondary: *Bathroom remodeler*). Add a service area (Wangaratta, Benalla, Beechworth, Myrtleford, Albury–Wodonga, etc.), hours, 20+ project photos, services, and the website link. | This is what puts you in the Map Pack. It's the #1 local ranking factor. |
| 2 | **Ask every past client for a Google review** (send them the short review link from GBP). Reply to every review. | Review count and recency strongly affect Map Pack ranking. Reviews on your own site **don't** show as stars in Google. |
| 3 | **Set up [Google Search Console](https://search.google.com/search-console)**, verify the domain, and submit `/sitemap.xml`. | Shows which searches you appear for, flags indexing errors, and lets you request indexing. |
| 4 | **Free directory listings** with *identical* name / phone / address (NAP): Bing Places, Apple Business Connect, hipages, Oneflare, Yellow Pages, True Local, Hotfrog, Word of Mouth, Facebook page. | Consistent citations build trust with Google. |
| 5 | **Local backlinks**: ask builders, plumbers, tile suppliers, and kitchen/bathroom designers you work with to link to you. | Relevant local links are a strong ranking signal. |

> [!IMPORTANT]
> If 663 Banksdale Road is a home address, set GBP up as a **service-area business** and hide the address. Keep the NAP identical everywhere you list it.

---

## Part B — On-site issues found in the code

### 🔴 Critical

1. **Every page tells Google it's a copy of the homepage.**
   [layout.tsx](file:///C:/Users/james/Documents/Workspace/01_Projects/local-websites/pro-square/pro-square/src/app/layout.tsx#L8-L10) sets `alternates.canonical: '/'` in the root layout. `/gallery`, `/quote` and `/reviews` inherit it, so Google may drop them from results.
   **Fix:** give each page its own canonical.

2. **There are no location keywords anywhere.** The title, description, H1 and body copy never mention a town or region. Google can't match you to searches like *"tiler Wangaratta"*. The address only appears in the footer and schema.
   **Fix:** put the location in titles, descriptions, the H1 and the intro copy. For example: *"Tiler in Wangaratta & North East Victoria | Pro Square Tiling"*.

3. **The homepage H1 changes every 3 seconds and only names a project** (e.g. *"Master Ensuite Sanctuary & Calacatta"*), see [Hero.tsx](file:///C:/Users/james/Documents/Workspace/01_Projects/local-websites/pro-square/pro-square/src/components/Hero.tsx#L180-L188).
   **Fix:** use one fixed, keyword-rich H1 (e.g. *"Bathroom, Kitchen & Outdoor Tiling in Wangaratta"*) and make the rotating headline a styled `<p>`/`<h2>`.

4. **The sitemap only lists the homepage** ([sitemap.ts](file:///C:/Users/james/Documents/Workspace/01_Projects/local-websites/pro-square/pro-square/src/app/sitemap.ts)).
   **Fix:** add `/gallery`, `/quote` and `/reviews`.

### 🟠 High

5. **Thin structured data** ([layout.tsx](file:///C:/Users/james/Documents/Workspace/01_Projects/local-websites/pro-square/pro-square/src/app/layout.tsx#L30-L46)). Change the type to `HomeAndConstructionBusiness`. Add `areaServed`, `geo`, `openingHoursSpecification`, `priceRange`, `sameAs` (GBP/Facebook/Instagram), `founder` (Michael Perez), `hasOfferCatalog` (services), and an international phone number (`+61467551492`).
6. **No social share image or favicon.** There's no `og:image`, so links shared on Facebook or Messenger show no preview, and there's no `app/icon.png`. Add `opengraph-image` and `icon` files.
7. **Gallery and Quote pages have no OpenGraph tags**, and their titles have no location keywords.
8. **Reviews load client-side** ([ApprovedReviews.tsx](file:///C:/Users/james/Documents/Workspace/01_Projects/local-websites/pro-square/pro-square/src/components/ApprovedReviews.tsx#L21)). The review text isn't in the initial HTML, so crawlers may not see it. Render reviews on the server.

### 🟡 Medium

9. **Weak alt text.** The before/after images use `alt="Before"` / `alt="After"` ([Gallery.tsx](file:///C:/Users/james/Documents/Workspace/01_Projects/local-websites/pro-square/pro-square/src/components/Gallery.tsx#L285-L294)), and the hero uses short names. Use descriptive alt text, e.g. *"Grey ensuite renovation after tiling, Wangaratta"*.
10. **No dedicated service pages.** One page per service is the best long-term free win, e.g. `/bathroom-tiling`, `/kitchen-splashbacks`, `/pool-and-outdoor-tiling`, `/waterproofing`. Each needs 300–600 words of unique copy, photos, an FAQ and a quote CTA. These pages rank for specific searches that the homepage can't.
11. **Add an FAQ section** with `FAQPage` schema, covering cost per m², timelines, waterproofing certificates, service area and warranty.

---

## Proposed implementation order

1. Fix the canonicals, expand the sitemap and add the location keywords to all metadata *(about 30 min)*
2. Fix the H1, write location-rich hero/intro copy and improve the alt text
3. Upgrade the JSON-LD schema, add an OG image and favicon
4. Render reviews on the server
5. Build the service pages and FAQ *(I need your input on the copy and the service area)*
