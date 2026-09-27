<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project: augmentslabs.com website

Static Next.js (App Router) + Tailwind v4 site. Source is public at
`github.com/augments-labs/augmentslabs.com`; production deploys from `main`
on Vercel. The only secret is `GITHUB_TOKEN`, set in Vercel's environment to
raise the GitHub API limit for the docs sync. Never commit it.

- Commands: `npm run dev` (syncs docs first), `npm test` (vitest),
  `npm run lint`, `npm run build` (docs sync + next build + pagefind index).
- Docs content is SYNCED from the project repos by `scripts/sync-docs.mjs`
  into `content/` and `public/synced/`. Never edit generated output; edit
  the source repo's `docs/` folder instead.
- Project card/welcome-page data: `src/lib/projects.json`.
- A project picks its card icon with `icon`, one name from `ICON_NAMES` in
  `src/lib/projects.ts`; with none it gets the default. A project page shows
  a terminal demo when the project has a `demo` entry: a transcript written
  by hand from that project's documentation, showing only behaviour the
  documentation describes. `validateDemo` checks its shape in the tests.
- Motion: an element animates only inside a `MotionGate`
  (`src/components/motion-gate.tsx`), which runs it while it is on screen,
  the tab is visible and the visitor has not asked for reduced motion. The
  finished state is the default, so pages are complete with no script.
  Docs routes import none of it.
- Unit tests live beside the code they cover: `src/lib/*.test.ts` for the
  docs logic and `src/components/*.test.ts` for rendering (vitest, node
  environment; the markdown test renders the real pipeline through
  `react-dom/server`).
- Site copy is written by hand and must read that way. Plain sentences in
  the user's vocabulary. No em dashes anywhere in `src/`, `scripts/`,
  `README.md` or this file (the generated block above is the one exception).
  Avoid stock patterns: three-item lists for rhythm, "X, not Y" reversals,
  empty intensifiers. Say what the tool does, not what it is like.
- Titles join with a middle dot (`Page · Project · Augments Labs`);
  `docPageTitle` in `src/lib/docs.ts` skips a project name the doc already
  carries.
- Fenced code blocks in docs render through the `pre` override in
  `src/components/markdown.tsx`, which must keep a real `<pre>` element:
  whitespace, the `.prose pre` surface and the copy button all depend on it.
- Design of record for the UI: `.sdlc-skills/designs/2026-08-08-augmentslabs-redesign.md`,
  revised by the `2026-08-09-site-chrome-polish*.md` series (latest v4:
  header, theme toggle, light tokens, footer removal, safe area, touch
  targets, breadcrumbs, native back) and by
  `2026-09-27-motion-and-components.md` with its revision 2 (line icons,
  terminal demo, motion rules). These live in `.sdlc-skills/`, which
  is local and not committed; ask the owner for them if missing.
- `CLAUDE.md` is a symlink to this file; keep them in sync by editing only
  `AGENTS.md`.
