# augmentslabs.com

The source of the Augments Labs website. It is a static site built with
Next.js and Tailwind CSS and deployed on Vercel.

## What the site shows

The homepage presents the lab and lists its projects. Each project has a
welcome page with a short description, a quickstart, its highlights and,
for some projects, a small demo. Each project also has a documentation
section with a sidebar, a search box, a table of contents and links to the
previous and next page.

The documentation is not written in this repository. Every project keeps
its docs in its own repository, in a `docs/` folder. A script downloads
those folders before the site is built, so the site always shows what the
projects publish. The downloaded files live in `content/` and
`public/synced/`, which are ignored by git. Do not edit them by hand. To
change a page, change it in the project repository.

To add a project to the site, add an entry to `src/lib/projects.json`.

## Working on the site

You need Node.js and npm.

```bash
npm install
npm run dev
```

The first command installs the dependencies. The second downloads the docs
and starts the site at http://localhost:3000.

The download calls the GitHub API, which allows only a few requests per
hour without a token. If the download fails, set a `GITHUB_TOKEN`
environment variable with a token that can read public repositories, and
run the command again. Never commit the token.

Other commands:

```bash
npm test          # run the unit tests
npm run lint      # check the code
npm run build     # build the site the way Vercel does
```

## How a change reaches the live site

The repository has two long-lived branches. `dev` is the default branch
and receives every pull request. `main` is the branch Vercel deploys. It
only changes through a pull request from `dev`, so releasing is one merge.
Both branches require the CI check to pass. `RELEASING.md` has the steps.

CI runs lint, the tests and a full build on every pull request and on
every push to `dev` and `main`.

Because the docs live in other repositories, a docs change there does not
touch this one. Once an hour, a workflow compares the docs version the
live site was built from with the latest docs in each project repository.
When something is new, it builds the site once to make sure the new docs
render, then asks Vercel to deploy. The Vercel deploy hook is stored in
the `VERCEL_DEPLOY_HOOK_URL` repository secret. You can also run that
workflow by hand from the Actions tab.

Dependabot opens a weekly pull request into `dev` when a dependency has a
newer version.
