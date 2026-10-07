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
    sidebar, search (⌘K), right-rail TOC and prev/next.
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
  `GITHUB_TOKEN` to raise the API limit. The sync also writes
  `public/synced/manifest.json`, the docs commit each project was built
  from, which the docs refresh workflow reads from the live site.
- **Markdown pipeline** (`src/components/markdown.tsx`): react-markdown
  `MarkdownAsync` + GFM + Shiki (rehype-pretty-code, dual light/dark) +
  heading ids/autolinks + rehype-raw for the HTML the docs carry (`<kbd>`,
  `<picture>`; scripts, styles and iframes are dropped). A `<picture>` with
  a dark source renders as two images switched by the theme class.
  Relative `.md` links and images are rewritten onto
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

## Branches and deployment

- `dev` is the default branch. Every change is a pull request into `dev`.
- `main` is what Vercel deploys to augmentslabs.com. It moves only through a
  pull request from `dev`, so a release is one merge.
- Both branches are protected: pull request required, no force push, linear
  history, the CI check must pass.

## Workflows

- **CI** (`.github/workflows/ci.yml`): lint, tests and a full build on every
  pull request and on pushes to `dev` and `main`. The build syncs the docs
  with the workflow's own token.
- **Docs refresh** (`.github/workflows/docs-refresh.yml`): the docs come
  from other repos, so a docs change there does not touch this one. Every
  hour the workflow compares the manifest the live site serves with the
  latest docs commit of each project repo. When one differs, it rebuilds
  once to make sure the new docs render, then calls the Vercel deploy
  hook stored in the `VERCEL_DEPLOY_HOOK_URL` repository secret. Run it by
  hand from the Actions tab, or send a `docs-updated` repository dispatch
  from a project repo, to deploy without waiting for the hour.
- **Dependabot** (`.github/dependabot.yml`): weekly pull requests into `dev`
  for the actions and the npm dependencies, the latter grouped into one.

## Conventions

- `AGENTS.md` carries agent-facing guidance; `CLAUDE.md` is a symlink to it.
- The design of record for the current UI lives in
  `.sdlc-skills/designs/2026-08-08-augmentslabs-redesign.md`.
