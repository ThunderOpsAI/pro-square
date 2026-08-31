---
name: seo
description: >
  Search Engine Optimization reference, audit guide, and autonomous agent operating
  framework. Use whenever the user wants to optimize a website for organic search or
  AI answer engines, audit technical SEO health, plan content or keyword strategy,
  diagnose a ranking or traffic drop, implement structured data / schema markup, set
  up recurring SEO monitoring, or review any page, site, or codebase for SEO
  compliance. Also trigger this whenever another skill or task touches crawlability,
  metadata, robots.txt, sitemaps, Core Web Vitals, or page performance — SEO
  implications are easy to miss and this skill should be consulted proactively even
  when the user doesn't say "SEO" explicitly.
disable-model-invocation: false
---

# SEO — Search Engine Optimization

A comprehensive, practitioner-grade reference and operating framework for optimizing
websites across traditional search engines **and** AI answer engines (Google AI
Overviews, ChatGPT, Perplexity, Claude). Sections 1–14 are a self-contained knowledge
reference; Section 15 defines how to run SEO work as a recurring, autonomous agent
loop rather than a one-off audit.

---

## 0  Operating Principles

1. **White-hat only.** Strictly adhere to Google Search Essentials. No cloaking,
   keyword stuffing, or manipulative link schemes.
2. **User-centric.** Optimize for human experience first, crawlers second.
3. **Data-driven.** Every recommendation is backed by data (search volume, keyword
   difficulty, CTR, Core Web Vitals) — never a hunch.

---

## 1  E-E-A-T — The Quality Framework

E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) is Google's
quality-rater framework. It is not a direct ranking score — it shapes the automated
systems that rank pages.

| Signal | How to demonstrate |
|---|---|
| **Experience** | First-hand usage, original photos/video, dated personal accounts, case studies |
| **Expertise** | Author bios with verifiable credentials, bylines linked to author pages, cited sources |
| **Authoritativeness** | Editorial backlinks from industry publications, brand mentions on Wikipedia/news sites |
| **Trustworthiness** | HTTPS, clear contact info, privacy policy, accurate NAP, transparent sponsorship disclosures |

- **YMYL** (Your Money or Your Life) pages — health, finance, legal, safety — face the
  strictest E-E-A-T scrutiny.
- The first "E" (Experience) is the primary hedge against mass-produced AI content:
  show lived, documented experience that a model cannot fabricate.

---

## 2  Technical SEO

Technical SEO establishes the foundation every other discipline depends on. A page
that cannot be crawled, rendered, or indexed cannot rank.

### 2.1  Crawlability & Indexability

| Element | Rule |
|---|---|
| **robots.txt** | Allow all critical CSS/JS/media. Block internal search results, login pages, admin panels. Audit quarterly. |
| **XML Sitemap** | Include only indexable, 200-status canonical URLs. Use `<lastmod>` to signal freshness. Submit via Google Search Console (GSC). |
| **Canonical tags** | Every page declares its own canonical. Point filtered/sorted/paginated variants to the master page. |
| **Noindex** | Apply to thin, duplicate, or utility pages (tag archives, internal search, staging). Prefer `noindex` over `robots.txt` disallow when the page has inbound links you want to preserve equity from. |
| **Hreflang** | Required for multilingual/multiregional sites. Declare with `<link rel="alternate" hreflang="x">`. Every page must include a self-referencing hreflang. |
| **Redirect chains** | Max one hop (301). Audit for loops. Never redirect then canonicalize to a third URL. |
| **Orphan pages** | Zero orphan pages — every page reachable via at least one internal link and/or sitemap entry. |
| **HTTP status** | Resolve all 4xx/5xx errors. Monitor via GSC > Indexing and Screaming Frog crawls. |
| **JavaScript rendering** | If content loads via JS, verify with `URL Inspection > Live Test` in GSC. Prefer SSR or static generation for critical content. |

### 2.2  Core Web Vitals (CWV)

Measured at the **75th percentile of real-user (field) data** over a rolling 28-day
window. Lab scores (Lighthouse) are diagnostic only — field data from CrUX is what
Google uses.

| Metric | What it measures | Good threshold |
|---|---|---|
| **LCP** (Largest Contentful Paint) | Loading speed of the largest visible element | ≤ 2.5 s |
| **INP** (Interaction to Next Paint) | Responsiveness across the full session (replaced FID in 2024) | ≤ 200 ms |
| **CLS** (Cumulative Layout Shift) | Visual stability — unexpected layout movement | ≤ 0.1 |

**Optimization levers:**

- **LCP:** Preload hero image/font, use `fetchpriority="high"`, serve images via CDN
  in modern formats (AVIF/WebP), minimize server response time (TTFB < 800 ms).
- **INP:** Break long tasks (> 50 ms) with `scheduler.yield()`, defer non-critical JS,
  minimize main-thread work, avoid layout thrashing.
- **CLS:** Reserve explicit dimensions on all images/videos/embeds/ads. Never inject
  content above the viewport after load. Use `content-visibility: auto` cautiously.

### 2.3  Mobile-First

Google crawls and indexes the mobile version of your site. Ensure:

- Complete content parity between mobile and desktop (no hidden tabs, no truncated text).
- Touch targets ≥ 48 × 48 CSS px with ≥ 8 px spacing.
- No horizontal scroll. Viewport meta tag set: `<meta name="viewport" content="width=device-width, initial-scale=1">`.
- Font sizes ≥ 16 px for body text.

### 2.4  Site Architecture & URL Structure

- **Flat hierarchy:** Every important page reachable within **3 clicks** from the homepage.
- **URL format:** Short, lowercase, hyphen-separated, descriptive. `domain.com/category/topic-name` — no underscores, dates, session IDs, or excessive parameters.
- **Breadcrumbs:** Implement with `BreadcrumbList` schema.
- **Siloing (topic clusters):** Organize content into semantic silos — a pillar page links to supporting cluster pages, and vice versa. Cross-silo bridge links are permitted but deliberate.
- **Pagination:** Use `rel="next"` / `rel="prev"` where applicable. For infinite-scroll, ensure a crawlable paginated HTML fallback.

### 2.5  HTTPS & Security

- Serve all pages over HTTPS. HSTS header recommended.
- Mixed content (HTTP resources on HTTPS pages) must be zero.
- Review GSC > Security & Manual Actions regularly.

---

## 3  On-Page SEO

On-page optimization has evolved from keyword density to **intent matching** and
**information gain**.

### 3.1  Search Intent Alignment

Before creating or optimizing a page, analyze the current SERP for the target query
and classify intent:

| Intent type | SERP signals | Content format |
|---|---|---|
| **Informational** | Featured snippets, PAA boxes, knowledge panels | How-to guides, explainers, FAQs, definitions |
| **Commercial investigation** | Comparison tables, "best of" listicles, review carousels | Comparison articles, buyer's guides, reviews |
| **Transactional** | Product carousels, shopping ads, PDPs | Product/service pages, pricing, CTAs |
| **Navigational** | Site links, brand knowledge panel | Homepage, about page, branded landing pages |

Mismatched intent = content will not rank regardless of quality.

### 3.2  Title Tags & Meta Descriptions

| Element | Guidelines |
|---|---|
| **Title tag** | 50–60 characters. Front-load primary keyword. Include brand name at end (` \| Brand`). Unique per page. |
| **Meta description** | 150–160 characters. Actionable, includes primary keyword naturally, contains a value proposition or CTA. Unique per page. |
| **H1** | One per page. Matches or closely mirrors the title tag. Clearly states the page's topic. |

- If Google rewrites your title, your original is likely too long, stuffed, or misaligned with page content.

### 3.3  Heading Hierarchy & Content Structure

- Use H2s for major sections, H3s for subsections. Headings form a scannable outline.
- **Answer-first:** Provide a direct, concise answer in the first 50–100 words. AI systems and featured snippets pull from this position.
- Use bullet lists, numbered steps, tables, and TL;DR summaries to make content **extractable** by both humans and AI.
- Embed relevant images, diagrams, and videos within the content body (not just at the top).

### 3.4  Keyword & Entity Optimization

- **Primary keyword:** Appears in title, H1, first paragraph, URL slug, and image alt text — naturally, not forced.
- **Semantic depth:** Cover related entities, synonyms, and subtopics.
- **Topical authority:** Build content hubs (pillar + cluster) rather than isolated pages targeting single keywords.
- **Keyword cannibalization:** Audit for multiple pages targeting the same keyword. Consolidate or differentiate intent.

### 3.5  Internal Linking

- Link from high-authority pages to pages you want to rank.
- Use descriptive, keyword-relevant anchor text (not "click here").
- Every new page should receive ≥ 3 internal links at publication.
- Audit for orphan pages quarterly.

### 3.6  Image Optimization

| Attribute | Best practice |
|---|---|
| **Alt text** | Specific, descriptive, honest. "Men's navy leather running shoe, side profile" not "blue shoes" or "IMG_4382". |
| **File name** | Descriptive, hyphenated: `navy-leather-running-shoe.webp` |
| **Format** | WebP or AVIF for photos. SVG for icons/logos. PNG only when transparency is required. |
| **Sizing** | Serve images at the rendered size. Use `srcset` and `sizes` for responsive images. |
| **Lazy loading** | `loading="lazy"` on below-fold images. Never lazy-load the LCP image. |
| **Compression** | Target < 100 KB for most images. Use lossy compression where quality loss is imperceptible. |

### 3.7  Content Quality Signals

- **Information gain:** Provide data, insights, or perspectives not available elsewhere.
- **Freshness:** Update content when facts change. Use `dateModified` in Article schema.
- **Comprehensiveness:** Cover the topic thoroughly enough the user doesn't need to return to the SERP.
- **Thin content audit:** Regularly identify and improve, consolidate, or `noindex` pages with little unique value.

---

## 4  Off-Page SEO & Link Building

Off-page SEO establishes trust and authority through third-party validation. The era
of link volume is over — topical relevance and editorial quality are what count.

### 4.1  Backlink Quality Criteria

| Signal | Weight |
|---|---|
| **Domain authority / relevance** | A link from a topically related DR 60+ site outweighs dozens from unrelated directories. |
| **Editorial context** | Links embedded in relevant editorial content carry more weight than sidebar/footer links. |
| **Anchor text diversity** | Natural anchor profiles mix branded, naked URL, and descriptive anchors. Over-optimized exact-match anchors are a spam signal. |
| **Link freshness** | Recently acquired links from active sites carry more signal. |

### 4.2  Link Acquisition Strategies

| Strategy | Description | Effort |
|---|---|---|
| **Digital PR** | Original data studies, surveys, free tools; pitch to journalists. | High |
| **Expert sourcing** | Respond to journalist queries (Qwoted, Featured/HARO, SourceBottle, `#JournoRequest`) with specific, expert-led quotes within 1 hour. | Medium |
| **Broken link building** | Find dead pages on competitor sites with high backlink counts, create a superior replacement, pitch the linking sites. | Medium |
| **Guest posting** | Original, high-quality articles for relevant industry publications. | Medium |
| **Link-worthy assets** | Calculators, interactive tools, comprehensive guides, infographics, original research. | High |
| **Community participation** | Genuine contribution on Reddit, Stack Exchange, industry forums. | Low |

### 4.3  Brand Signals

- Unlinked brand mentions on authoritative sites are increasingly important signals for both Google and LLMs.
- Branded search volume correlates with ranking power.
- Build presence across YouTube, social media, podcasts, and review platforms (G2, Trustpilot, Capterra).

### 4.4  Toxic Link Management

- Monitor backlink profile for sudden spikes of spammy links.
- Use the **Google Disavow Tool** only for confirmed spam or after a manual action.
- Document all disavow decisions.

---

## 5  Structured Data & Schema Markup

Structured data helps search engines and AI systems interpret content unambiguously.
It powers rich results and increases the likelihood of citation in AI Overviews.

### 5.1  Implementation Rules

- **Format:** JSON-LD in `<script type="application/ld+json">` in `<head>` or end of `<body>`.
- **Accuracy:** Schema must describe content visible on the page. Never add hidden facts.
- **Specificity > breadth:** Complete, accurate properties for a few relevant types beats broad, incomplete markup.
- **Validation:** Test every page with Google Rich Results Test and Schema.org Validator before deployment.
- **Nesting:** Combine types logically (e.g., `Organization` as `publisher` of `Article`).

### 5.2  Essential Schema Types

| Type | Use case | Key properties |
|---|---|---|
| **Article / BlogPosting** | Editorial/blog content | `headline`, `author`, `datePublished`, `dateModified`, `publisher`, `image` |
| **Product** | E-commerce PDPs | `name`, `brand`, `sku`, `offers`, `aggregateRating`, `review` |
| **LocalBusiness** | Physical locations | `name`, `address`, `telephone`, `openingHours`, `geo`, `priceRange` |
| **Organization** | Company-level identity | `name`, `url`, `logo`, `sameAs` |
| **FAQ** | Q&A pages | `mainEntity` array of `Question` + `acceptedAnswer` |
| **HowTo** | Step-by-step instructions | `step` array with `name`, `text`, `image` per step |
| **BreadcrumbList** | Navigation hierarchy | `itemListElement` with `position`, `name`, `item` |
| **VideoObject** | Embedded videos | `name`, `description`, `thumbnailUrl`, `uploadDate`, `duration`, `contentUrl` |
| **Event** | Events/webinars | `name`, `startDate`, `endDate`, `location`, `offers` |
| **SoftwareApplication** | Apps / tools | `name`, `operatingSystem`, `applicationCategory`, `offers`, `aggregateRating` |

### 5.3  Entity Linking with `sameAs`

Connects your entity to external authoritative sources, anchoring your brand in the
Knowledge Graph:

```json
"sameAs": [
  "https://www.wikipedia.org/wiki/Your_Brand",
  "https://www.wikidata.org/wiki/Q12345",
  "https://www.linkedin.com/company/your-brand"
]
```

Only link to verified, accurate profiles — `sameAs` is how AI systems cross-check identity.

---

## 6  Generative Engine Optimization (GEO) & Answer Engine Optimization (AEO)

With AI-powered search now a primary discovery channel, optimization must target
**citation in AI-generated answers**, not just blue-link rankings. ~50–60% of sources
cited in AI Overviews also rank in the top 10 organically — strong traditional SEO
remains the best path to AI visibility.

### 6.1  Core GEO Principles

| Principle | Implementation |
|---|---|
| **Extractability** | Answer-first page design. Clear H2/H3 hierarchy. Concise "answer blocks" (1–3 sentences) under descriptive headings. Bullet points, tables, TL;DRs. |
| **Verifiability** | Cite authoritative sources. Specific statistics with attribution. Expert quotes with full name and credentials. |
| **Entity authority** | Consistent brand presence across authoritative platforms (Wikipedia, G2, Trustpilot, Reddit, industry publications). |
| **Semantic mapping** | Research the sub-queries (fan-out queries) AI models generate when answering a prompt. Map content to those, not just the top-level keyword. |

### 6.2  `llms.txt`

A community-proposed Markdown file at site root (`/llms.txt`) providing a curated
index of a site's most important content for AI agents.

- **Status:** Not a Google ranking signal; not required for AI Overviews or AI Mode.
- **When to use:** Developer documentation, API references, or as a roadmap for specific AI agents.
- Treat as an optional "insurance policy," not a ranking hack.

### 6.3  New Metrics

| Metric | What it tracks |
|---|---|
| **Citation frequency** | How often your domain is cited in AI-generated responses |
| **Share of model** | Your citation rate vs. competitors for target queries |
| **AI referral traffic** | Sessions arriving from AI platforms (track via UTMs or referrer headers) |
| **AI visibility** | Presence/absence in AI Overviews for target queries |

---

## 7  Local SEO

### 7.1  Google Business Profile (GBP)

GBP accounts for ~32% of local pack ranking weight. Treat it as a live entity feed.

| Action | Detail |
|---|---|
| **Primary category** | Single most impactful lever. Most specific category matching your core service. |
| **Completeness** | Zero "Add" buttons remaining. Every attribute, service, product, photo, description field filled. |
| **Freshness** | Post weekly. Populate Q&A proactively. |
| **Reviews** | Volume, recency, and response rate all matter. Respond to every review. |
| **Photos** | High-quality, original, geo-tagged preferred, uploaded regularly. |
| **Business hours** | Accuracy is critical. Update for holidays/special hours. |

### 7.2  NAP Consistency

NAP = Name, Address, Phone. Consistency across all digital touchpoints is non-negotiable.

- Treat NAP as **entity data**, not marketing copy.
- Prioritize accuracy on Google, Apple Maps, Bing Places, Yelp, Facebook, industry directories.
- NAP inconsistencies across ≥ 3 major sources can exclude you from AI-generated local answers in up to 74% of queries.
- Audit quarterly.

### 7.3  Local Content & Links

- Location-specific landing pages with unique, locally relevant content.
- Local backlinks from chambers of commerce, local news, community organizations.
- `LocalBusiness` schema on every location page.

---

## 8  International SEO

### 8.1  Architecture Options

| Structure | Example | Best for | Trade-off |
|---|---|---|---|
| **Subfolders** | `example.com/fr/` | Most businesses (default) | Consolidates domain authority; weaker geo signal |
| **ccTLDs** | `example.fr` | Country branding; regulatory separation | Strongest geo signal; fragmented authority; high cost |
| **Subdomains** | `fr.example.com` | Independent regional operations | Flexible hosting; must build authority per subdomain |

**Default to subfolders** unless regulatory, branding, or infrastructure requirements demand otherwise.

### 8.2  Hreflang Implementation

- Declare `<link rel="alternate" hreflang="xx-YY" href="...">` on every page, including a self-referencing tag.
- Include `x-default` for fallback / language selector pages.
- Common errors: missing self-reference, mismatched return links, incorrect codes.

### 8.3  Localization vs. Translation

- **Keywords:** Research search behavior per target market — direct translations rarely match local search terms.
- **Currency, units, date formats.**
- **Cultural context:** Imagery, examples, tone, legal requirements.
- **Local link building** in each target market.

---

## 9  E-Commerce SEO

### 9.1  Product Pages (PDPs)

- Unique, benefit-focused descriptions (never manufacturer copy-paste).
- Clear H1 = product name. Concise, keyword-rich URL.
- High-resolution images with descriptive alt text.
- Trust signals: reviews, clear pricing, shipping/returns info, prominent CTA.
- `Product` schema with `brand`, `sku`, `offers`, `aggregateRating`, `review`.

### 9.2  Category Pages (PLPs)

- Often higher SEO potential than PDPs — target broader, higher-volume queries.
- Unique descriptive content, not just a product grid.
- `CollectionPage` or `ItemList` schema.

### 9.3  Faceted Navigation

Biggest source of crawl budget waste and duplicate content in e-commerce.

| Control | When to use |
|---|---|
| **Canonical to parent** | Default for most filter combinations. |
| **Noindex** | Filter combinations with zero search volume. |
| **Allow indexing** | Only high-value combinations with proven search demand. |
| **PRG pattern / AJAX** | Keep filter interactions invisible to crawlers. |
| **robots.txt disallow** | Last resort for extreme parameter sprawl. |

### 9.4  Out-of-Stock Products

- **Temporarily out of stock:** Keep page live, "notify me" CTA, `availability: OutOfStock`.
- **Permanently discontinued:** 301 redirect to closest alternative or parent category.

---

## 10  Video & Media SEO

### 10.1  YouTube Optimization

| Factor | Guidance |
|---|---|
| **Watch time & retention** | Primary ranking signals. Target ≥ 50% audience retention. |
| **CTR** | Title + thumbnail drive clicks. Target 4–10% CTR. |
| **Title** | Front-load primary keyword within first 50–60 characters. |
| **Description** | First 2–3 lines visible before "Show More" — make them count. |
| **Tags / hashtags** | 5–8 relevant tags. |
| **Chapters** | Use timestamps to create chapters. |
| **Channel authority** | Stick to a consistent niche. |
| **Closed captions** | Upload accurate captions/transcripts. |

### 10.2  Video on Your Site

- `VideoObject` schema for every embedded video.
- Video sitemap (`video-sitemap.xml`) or entries in main sitemap.

### 10.3  Image SEO for Visual Search

- High-quality, original imagery (stock photos have limited visual-search value).
- Surrounding text provides context for the image's role.
- `ImageObject` schema where appropriate.

---

## 11  Penalties & Recovery

### 11.1  Manual Actions

A human reviewer determined your site violates Google's spam policies.

- **Detection:** GSC > Security & Manual Actions.
- **Common causes:** Unnatural links, thin/scraped content, cloaking, keyword stuffing, structured data abuse.
- **Recovery:** Fix every cited issue, document changes, submit a Reconsideration Request via GSC. ~2–4 weeks review.

### 11.2  Algorithmic Suppression

Automated systems (core updates, spam updates, helpful content system) reduced visibility.

- **Detection:** No GSC notification. Correlate traffic drops with known update timelines.
- **Recovery:** No reconsideration request. Improve site quality, prune/upgrade thin content, strengthen E-E-A-T. Can take months.

### 11.3  Common Content Issues

| Issue | Fix |
|---|---|
| **Duplicate content** | `rel="canonical"` to master. 301 redirect alternates. Manage URL parameters. |
| **Thin content** | Add unique insights/data/media, or consolidate and redirect. |
| **AI-generated spam** | Add substantial human review, editing, original perspective. |
| **Keyword stuffing** | Rewrite for natural language; focus on semantic coverage. |
| **Cloaking** | Serve identical content to users and crawlers. No exceptions. |

---

## 12  SEO Audit Framework

### 12.1  Tool Stack

| Tool | Primary role |
|---|---|
| **Google Search Console** | Ground truth: indexation, performance, manual actions, CWV field data. Free. |
| **Screaming Frog SEO Spider** | Technical crawl: status codes, metadata, canonicals, redirects, JS rendering, internal linking. |
| **Ahrefs** | Backlink analysis, keyword research, content gap, site audit. |
| **SEMrush** | Keyword tracking, competitive analysis, on-page checker, site audit. |
| **Google PageSpeed Insights** | CWV diagnostics (lab + field). |
| **Chrome UX Report (CrUX)** | Real-user CWV data at origin and URL level. |
| **Schema Markup Validator** | Validate JSON-LD structured data. |
| **GA4 API** | User behavior (bounce rate, time on page) and conversions. |

### 12.2  Audit Workflow

1. **Crawl** — map architecture, find broken links, redirect chains, missing metadata, orphan pages, duplicate content.
2. **Analyze** — automated health score, backlink profile, keyword gaps, content opportunities.
3. **Verify** — confirm indexation data aligns with crawl findings; check manual actions.
4. **Measure** — assess CWV field performance.
5. **Prioritize** — score every finding by **business impact** × **effort**:
   - **P1 (Critical):** Indexation blockers, manual actions, site-wide 5xx errors, noindex on revenue pages.
   - **P2 (High):** Failing CWV, broken internal links, missing canonicals, thin content on high-traffic pages.
   - **P3 (Medium):** Missing schema, suboptimal metadata, image optimization gaps.
   - **P4 (Low):** Minor metadata tweaks, optional structured data types, cosmetic URL improvements.

---

## 13  Quick-Reference Checklists

### New Page Launch

- [ ] Target keyword identified and intent verified against SERP
- [ ] Unique title tag (50–60 chars), meta description (150–160 chars), H1
- [ ] Content structured with H2/H3 hierarchy, answer-first format
- [ ] Primary keyword in title, H1, URL, first paragraph, image alt
- [ ] ≥ 3 internal links pointing to the new page
- [ ] New page links out to ≥ 2 relevant existing pages
- [ ] All images optimized (WebP/AVIF, alt text, lazy loading on below-fold)
- [ ] Relevant schema markup implemented and validated
- [ ] Page passes CWV thresholds
- [ ] Page added to XML sitemap
- [ ] Mobile rendering verified

### Technical Health

- [ ] Zero 4xx/5xx errors on important pages
- [ ] No redirect chains > 1 hop
- [ ] robots.txt reviewed (not blocking critical resources)
- [ ] XML sitemap submitted and current
- [ ] All pages have self-referencing canonical
- [ ] HTTPS enforced sitewide, zero mixed content
- [ ] CWV passing on mobile (field data)
- [ ] No orphan pages
- [ ] JS-rendered content verified via GSC Live Test

### Content Quality

- [ ] Content matches verified search intent
- [ ] Provides information gain (original data, first-hand experience, unique analysis)
- [ ] Comprehensive enough to end the user's search journey
- [ ] Author byline with verifiable credentials (especially YMYL)
- [ ] `datePublished` and `dateModified` present and accurate
- [ ] No thin, duplicate, or outdated content dragging sitewide quality
- [ ] Internal links use descriptive anchor text

---

## 14  Common Mistakes

| Mistake | Why it hurts | Fix |
|---|---|---|
| Optimizing for keywords instead of intent | Content ranks for nothing because format/depth mismatches what searchers need | Analyze SERP, match format and depth to dominant intent |
| Ignoring mobile experience | Google indexes mobile-first; poor mobile = poor rankings | Audit with real devices, not just DevTools |
| Neglecting internal linking | Orphan pages never get crawled or ranked | Build systematic pillar/cluster linking; audit quarterly |
| Chasing link volume over relevance | Directory links carry less weight than one editorial link | Focus on digital PR and editorial placements |
| Implementing schema without validation | Invalid/incomplete schema is ignored, wastes effort | Validate every implementation with Rich Results Test |
| Publishing and forgetting | Content decays; stale pages drag sitewide quality | Schedule content reviews; update `dateModified` |
| Over-relying on AI-generated content | Mass-produced, unedited AI text is actively suppressed | Use AI as a draft tool; add human editing, original data |
| Blocking CSS/JS in robots.txt | Google can't render the page correctly | Allow all rendering resources; block only admin/utility endpoints |
| IP-based language redirects | Prevents crawlers from seeing all versions | Use hreflang + visible language selector; never force-redirect |
| Treating SEO as a one-time project | Algorithms evolve continuously; competitors never stop | Embed SEO into the content/dev lifecycle permanently |

---

## 15  Autonomous Operating Cadence

When operating as an ongoing agent (not a one-off audit), run SEO work on a defined
schedule rather than only when asked. Sections 1–14 are the "what" and "how" —
this section is the "when."

### 15.1  Daily Routines

- **Traffic anomaly detection:** Query the GSC API. Alert if organic impressions or clicks drop > 15% day-over-day.
- **Uptime monitoring:** Ping priority URLs to confirm the site is live.
- **SERP tracking:** Check rankings for the top 10 most critical "money" keywords.

### 15.2  Weekly Routines

- **Site crawl:** Lightweight technical crawl — broken links, missing image alt text, newly introduced duplicate H1s.
- **Content decay check:** Identify pages that lost ranking positions in the last 30 days; flag for refresh.
- **GSC query mining:** Extract new queries the site gets impressions for but isn't targeting; suggest as article topics.

### 15.3  Monthly Routines

- **Content pruning analysis:** Pages with 0 organic sessions over 6 months → Update, Merge (301), or Delete (410).
- **Competitor audit:** Compare DA/DR, estimated traffic, and new referring domains against core competitors.
- **Reporting:** Generate a summarized report of KPIs (below).

### 15.4  KPIs

Measure success strictly against:

1. **Organic traffic volume** — MoM and YoY growth.
2. **Non-branded keyword rankings** — improvements in positions 1–3 and 4–10.
3. **SERP CTR** — are optimized titles actually getting clicked?
4. **Organic conversions / revenue** — requires GA4 integration; the ultimate business metric.
5. **Core Web Vitals pass rate** — % of URLs marked "Good."

### 15.5  Required Integrations for Autonomous Operation

This cadence assumes live API access. Without these, the routines above are
aspirational — implement/connect them before enabling scheduled runs:

- **Google Search Console API** — impressions, clicks, indexation status.
- **GA4 API** — user behavior and conversions.
- **Ahrefs / SEMrush / Moz API** — competitor research, keyword volume, backlink data.
- **PageSpeed Insights (CrUX) API** — technical speed auditing.
- **Screaming Frog / Sitebulb API** — deep technical crawling.
