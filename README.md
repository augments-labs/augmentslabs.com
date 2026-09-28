# augmentslabs.com

The Augments Labs website. Static site built with Next.js (App Router) and
Tailwind CSS. Dark-first, teal-accented, one signature: the augment corner
from the logo.

## How it works

- **Routes**
  - `/`: lab homepage (thesis, principles, project cards).
  - `/<slug>`: project welcome page (tagline, quickstart, highlights, CTAs,
    and a terminal demo when the project has one).
  - `/<slug>/docs` + `/<slug>/docs/<page...>`: per-project documentation with
    sidebar, search (⌘K), right-rail TOC, prev/next, and "Edit this page".
  - `/docs`: index of all project docs. `/device-preview`: react-device-lab.
  - Legacy `/docs/<slug>/...` 301-redirects to `/<slug>/docs/...`.
- **Project data** lives in `src/lib/projects.json` (tagline, quickstart,
  highlights, repo URL, plus an optional `icon` and `demo`). Adding a
  project = one JSON entry.
- **Docs are synced, not written here.** Each project keeps its docs in its
  own repo under `docs/`. `scripts/sync-docs.mjs` pulls every `docs/**/*.md`
  (→ `content/docs/<slug>/`) and image (→ `public/synced/<slug>/`) before
  `next dev` and `next build` (npm pre-hooks). `content/` and `public/synced/`
  are gitignored and regenerated every run. Sync swaps via a temp dir; on
  failure (e.g. rate limit) it falls back to the previous snapshot. Set
  `GITHUB_TOKEN` to raise the API limit.
- **Markdown pipeline** (`src/components/markdown.tsx`): react-markdown
  `MarkdownAsync` + GFM + Shiki (rehype-pretty-code, dual light/dark) +
  heading ids/autolinks. Relative `.md` links and images are rewritten onto
  the site (`src/lib/doc-links.ts`); a redundant `docs/<slug>/<slug>/` repo
  layout is collapsed.
- **Search**: Pagefind runs postbuild (`pagefind --site .next/server/app`),
  indexing only `data-pagefind-body` regions into `public/pagefind/`
  (gitignored). The client dialog groups results by current project.
- **Theme**: next-themes, class strategy, default **dark**; tokens in
  `src/app/globals.css` (`--background/--foreground/--muted/--surface/
  --border/--accent`).

## Develop

```bash
npm install
npm run dev        # syncs docs first, then starts Next
npm test           # vitest run (unit tests for the docs logic)
npm run test:watch # vitest watch mode
npm run lint
npm run build      # sync + next build + pagefind index
```

## Conventions

- `AGENTS.md` carries agent-facing guidance; `CLAUDE.md` is a symlink to it.
- The design of record for the current UI lives in
  `.sdlc-skills/designs/2026-08-08-augmentslabs-redesign.md`.
