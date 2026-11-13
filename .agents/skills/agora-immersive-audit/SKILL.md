---
name: agora-immersive-audit
description: Evaluate and enhance Agorà APS's existing immersive site without breaking routes, chapter book, Magazine, official identity, CMS or accessibility.
---

# Agorà — Identity-preserving immersive audit

Use before ANY visual/3D change to this repository.

## Immutable contracts
- Keep production hostname, all existing route paths, anchors, canonical URLs, sitemap entries and RSS links. Run `node scripts/verify-url-contract.mjs`.
- Preserve the chapter-book interaction, book index, navigation, footer links, Magazine slugs/articles, editor/CMS, donations, chat and forms.
- Do not change, redraw or recolor logo assets. No petrol, cobalt, electric blue or blue gradient in any user-facing background, CTA, menu, book, magazine or editor surface. Use the established design tokens from `DESIGN.md`: warm ink `#332b24`, terracotta `#b85628`, ivory `#f8f0e6`, paper `#fffaf5`, sage `#e5ebe6` and gold `#efbb82`. Derive *shades* only, not a new petrol/cobalt/violet brand.
- Keep readable semantic HTML in the DOM with JavaScript disabled. No scroll hijacking, focus trap, URL rewriting, layout-blocking shaders or mandatory WebGL.

## Audit protocol
1. Inventory `index.html`, both generator scripts, `assets/book.js`, `assets/cinematic-agora.js`, `assets/cinematic-system.*`, and 45-page URL contract.
2. Apply Vercel's [Web Design Guidelines](https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines) to contrast, focus states, navigation, tap targets, semantics, accessible reading and image sizing.
3. Apply [Frontend Design](https://github.com/anthropics/skills/tree/main/skills/frontend-design) for coherent editorial art direction; retain institutional identity rather than copying a reference reel.
4. For 3D, use layered transforms and GPU-composited transform/opacity; follow [React Three Fiber performance concepts](https://github.com/pmndrs/react-three-fiber/blob/master/docs/advanced/scaling-performance.mdx) only if a deliberate WebGL component is justified. This repo is static HTML/vanilla JS; do NOT migrate frameworks just for effects.
5. Support `prefers-reduced-motion`, Save-Data, mobile, keyboard and low-powered devices. Pause offscreen work; do not animate article prose or prevent scroll.
6. Check 320, 375, 390, 768, 1024, 1440px widths. Watch navigation, mobile book pages, 3D overflow, focus visibility and memory/frame budget.
7. Run `npm run build`, `npm run check` and `node scripts/verify-brand-immersion.mjs`; inspect actual browser behavior before merging. Keep a reversible PR and record any tests not executed.

## Success condition
The visitor feels progressively deeper visual space while scrolling, **without** losing a single content path, menu item, article, logo detail or reading option.
