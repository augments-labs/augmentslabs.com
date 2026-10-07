/**
 * GitHub API helpers shared by the docs sync and the docs change check.
 *
 * Optional: set GITHUB_TOKEN to raise the GitHub API rate limit (60 req/h
 * unauthenticated).
 */

export const ORG = "augments-labs";

export const headers = {
  "User-Agent": "augments-labs-website",
  ...(process.env.GITHUB_TOKEN
    ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
    : {}),
};

export async function fetchJson(url) {
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const hint = res.status === 403 ? " (rate limited? set GITHUB_TOKEN)" : "";
    throw new Error(`GitHub API returned ${res.status} for ${url}${hint}`);
  }
  return res.json();
}

export async function defaultBranch(slug) {
  const repo = await fetchJson(`https://api.github.com/repos/${ORG}/${slug}`);
  return repo.default_branch;
}

/** The SHA of the latest commit that touched docs/ on the given branch. */
export async function latestDocsCommit(slug, branch) {
  const commits = await fetchJson(
    `https://api.github.com/repos/${ORG}/${slug}/commits?sha=${branch}&path=docs&per_page=1`,
  );
  return commits[0]?.sha ?? null;
}

/**
 * Compares the manifest the deployed site carries with the current state of
 * the project repos. Returns the slugs whose docs differ. A missing live
 * manifest means the site has never been built with one, so every project
 * counts as changed.
 */
export function docsChanged(live, upstream) {
  return Object.keys(upstream).filter(
    (slug) => live?.[slug]?.commit !== upstream[slug].commit,
  );
}
