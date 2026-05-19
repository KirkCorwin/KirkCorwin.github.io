# Portfolio + external data viz pages

This document records how **interactive data visualization** work will relate to [KirkCorwin.github.io](https://github.com/KirkCorwin/KirkCorwin.github.io) without mixing heavy viz code into the main portfolio repo.

## Context (current site)

The live portfolio is a **static multi-page site** in this repository:

- Sidebar layout: Home, About, Projects, Contact, Game
- Project **case studies** that live here: e.g. `projects/cx-results.html`, `projects/service_checklist/`
- Skully widget and dungeon game stay in this repo as lightweight extras

**No changes are required to that structure** when adding new viz work—the portfolio only needs **links** and short descriptions.

## Planned approach: viz on separate repos

New data viz experiences will be:

1. **Hosted in their own GitHub repositories** (one repo per viz or per small family of related vizzes).
2. **Deployed independently** (typically GitHub Pages on that repo’s `main` branch or `/docs`).
3. **Linked from this portfolio** under `projects/`—either:
   - a thin **landing page** in *this* repo (`projects/<slug>.html`) that frames the work and links out, or
   - a direct link from the Projects grid to the external Pages URL.

Keeping viz separate keeps the portfolio repo small, fast to clone, and easy to update without pulling in Three.js, build tooling, or large datasets.

```
┌─────────────────────────────┐     link      ┌──────────────────────────────┐
│  KirkCorwin.github.io       │ ────────────► │  viz-repo (e.g. cx-3d-viz)   │
│  projects.html + optional   │               │  GitHub Pages                │
│  projects/<slug>.html       │ ◄──────────── │  “Back to portfolio” link    │
└─────────────────────────────┘   back link   └──────────────────────────────┘
```

## Technology expectations

External viz repos are expected to use, as appropriate:

- **[Three.js](https://threejs.org/)** (and optionally helpers like OrbitControls) for 3D scenes
- **D3**, **Plotly**, or canvas/WebGL for other chart types
- Static assets or lazy-loaded data (JSON/CSV) committed to the viz repo or loaded from release assets

Build setup per repo is flexible (vanilla ES modules, Vite, etc.)—not prescribed here.

## Portfolio integration checklist (when a viz ships)

When a new viz repo is ready:

1. Add a **Projects** card on `projects.html` (title, 2–3 line summary, tech tags e.g. `Three.js`, `WebGL`).
2. Set the card link to the **GitHub Pages URL** of the viz repo (or to `projects/<slug>.html` if a local stub page is preferred).
3. Optionally add `projects/<slug>.html` in *this* repo with:
   - One paragraph on the problem and methods
   - Link to live demo (external Pages)
   - Link to source repo
   - Consistent header pointing back to `../index.html`
4. Ensure the **viz repo** includes a visible “Portfolio” / “Kirk Corwin” link to `https://kirkcorwin.github.io/` (or the canonical Pages URL).

## What stays in this repo vs. out

| In `KirkCorwin.github.io` | In separate viz repos |
|---------------------------|------------------------|
| Navigation, bio, contact | Three.js scenes, shaders, loaders |
| Project metadata & copy | Large datasets, notebooks exports |
| Thin HTML stubs (optional) | Build pipeline, viz-specific deps |
| `projects/cx-results.html` style write-ups | Interactive 3D / heavy WebGL |

## Naming convention (suggested)

- Repo: `KirkCorwin/<project-slug>-viz` or existing analysis repo with a `/docs` Pages site
- Portfolio stub (optional): `projects/<project-slug>-viz.html`
- Card tag line: domain + stack (e.g. “Cyclocross · Three.js”)

## Out of scope for viz repos

- Replacing the main portfolio layout or sidebar
- Moving Skully widget or dungeon game into viz repos
- Duplicating full case-study prose in both places—portfolio summarizes; viz repo can go deeper

---

*Last updated: plan recorded before first external Three.js viz pages are linked from Projects.*
