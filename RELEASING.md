# Releasing

The site deploys from `main`. Day to day work lands on `dev`. A release
moves everything on `dev` to `main` in one pull request.

## Before you release

Check that `dev` is green on GitHub and that the preview Vercel attached to
the last pull request looks right.

## Release

```bash
gh pr create --base main --head dev --title "Release: <what it ships>"
gh pr merge <number> --merge
```

Merge the release with a merge commit. Do not squash it and do not rebase
it. A merge commit puts the exact commits of `dev` on `main`, so the two
branches stay in step and the next release merges cleanly.

Vercel builds `main` and the site is live a few minutes later. Open
https://augmentslabs.com and check the change you shipped.

## If the release pull request cannot merge

A squashed or rebased release puts copies of `dev`'s commits on `main`
under new hashes. From then on, Git sees both branches changing the same
lines and the next release reports a conflict. To repair it once:

```bash
git fetch origin
git worktree add .worktrees/reconcile -b release/reconcile --no-track origin/dev
cd .worktrees/reconcile
git merge -s ours origin/main -m "Reconcile main with dev"
git push -u origin release/reconcile
gh pr create --base main --head release/reconcile --title "Release: <what it ships>"
gh pr merge <number> --merge
```

The `-s ours` merge keeps `dev`'s content exactly and only joins the two
histories. After it is merged, `main` contains `dev`'s commits again.

## Branch settings that make this work

- `dev` requires a pull request and the "Lint, test and build" check. Pull
  requests into `dev` are squashed, and its history stays linear.
- `main` requires a pull request and the same check. It must allow merge
  commits, so "Require linear history" stays off for `main`.
- Only pull requests from `dev` land on `main`. Nothing else is pushed
  there, so `main` never carries a change that `dev` lacks.

## Docs changes

Project documentation comes from the project repositories and does not
need a release. An hourly workflow notices new docs and redeploys the site
on its own. To redeploy sooner, run "Docs refresh" from the Actions tab.
