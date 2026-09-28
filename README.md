# alexdebiasio.com

A small, hand-built personal site. Markdown goes in, static HTML comes out, via one short
Node script (`build.mjs`). No framework. The only JavaScript is the light/dark switch;
math is rendered at build time with KaTeX.

## Edit a page

Every page is one Markdown file in `content/pages/`:

| File | URL |
| --- | --- |
| `home.md` | `/` |
| `technical.md` | `/technical/` |
| `mathematics.md` | `/mathematics/` |
| `music.md` | `/music/` |
| `repertoire.md` | `/music/repertoire/` |
| `cv.md` | `/cv/` |
| `now.md` | `/now/` |

Each file starts with a little front-matter block:

```markdown
---
title: Music            # shown in the browser tab
nav: music              # which menu item is underlined (technical, mathematics, music, cv, now)
path: /music/repertoire/ # optional; otherwise the filename sets the URL
math: true              # only if the page uses $…$ math
description: One sentence for search results and link previews.
---
```

To add a page, add a new `.md` file. To put it in the menu, add it to `site.nav` at the
top of `build.mjs`.

## Notes in the margin

- **Numbered note:** write `^[the note]` right after a word. On wide screens it appears in
  the right margin; on phones, tapping the number shows it.
- **Unnumbered note** (dates, places, a photo):
  `<span class="marginnote">Spring 2026</span>`. Put it at the end of a heading to set a
  date beside that heading.

## Résumé

The CV page shows a picture of the résumé and links to the PDF. To update it, replace both:

- `assets/files/Alex_De_Biasio_Resume.pdf`, the PDF people download
- `assets/images/resume.png`, the picture shown on the page (about 1700 pixels wide; export
  the PDF's page as a PNG, e.g. `pdftoppm -png -r 200 -singlefile Alex_De_Biasio_Resume.pdf resume`)

## Build and preview

```sh
npm install      # once
npm run build    # writes the site to dist/
npm run serve    # builds, then serves dist/ at http://localhost:8080
```

## Deploy

Netlify runs `npm run build` and serves `dist/`. Commit **everything except `dist/` and
`node_modules/`** (including `build.mjs`, `serve.mjs`, `content/`, `assets/`, and
`package-lock.json`), then push. If a file is left uncommitted, the Netlify build fails.

`assets/_redirects` keeps old links (`/projects/`, `/resume`, the old CV PDF) working.
