# KirkCorwin.github.io

Professional portfolio for Kirk Corwin — data science, projects, and contact. Includes an optional Skully widget and a browser dungeon mini-game.

## Local preview

```powershell
Set-Location "c:\communal_user_files\home_website\KirkCorwin.github.io"
npx --yes serve .
```

Open the URL shown (e.g. `http://localhost:3000`).

## Site structure

| Page | File | Description |
|------|------|-------------|
| Home | `index.html` | Hero, highlights, CTAs |
| About | `about.html` | Bio and skills |
| Projects | `projects.html` | Project cards with tags and links |
| Contact | `contact.html` | Email and social links |
| Game | `game.html` | Skullboy Dungeon (3 levels) |

Detail pages live under `projects/`.

## Assets

- `css/main.css` — layout, sidebar, typography
- `css/components.css` — cards, hero, buttons
- `css/skully-widget.css` — draggable desktop panel / mobile top bar
- `css/game.css` — game page layout
- `js/layout.js` — shared sidebar and mobile menu
- `js/skully-widget.js` — Skully playground
- `js/game/` — dungeon crawler modules (ES modules)

## Skully widget

On most pages, a floating panel lets you spawn small Skully characters. On desktop, drag the panel by its header. On mobile, controls appear in a sticky bar at the top of the page.

## Dungeon controls

- **Move:** Arrow keys or A/D
- **Jump:** Space
- **Attack:** Z or J
- Touch controls on mobile when playing `game.html`
