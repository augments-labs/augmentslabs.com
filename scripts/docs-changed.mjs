/**
 * Decides whether the deployed site is behind the project docs.
 *
 * Reads the manifest the live site serves at SITE_URL/synced/manifest.json,
 * asks GitHub for the latest docs commit of every project, and prints
 * `changed=true|false` plus the projects that moved in GitHub output
 * format. The docs-refresh workflow appends this to $GITHUB_OUTPUT and
 * only triggers a deploy when something changed.
 *
 * A manifest the site cannot serve (first deploy, outage) counts as changed:
 * a rebuild that was not needed costs less than docs that stay stale.
 */
import projects from "../src/lib/projects.json" with { type: "json" };
import { defaultBranch, docsChanged, latestDocsCommit } from "./github.mjs";

const site = (process.env.SITE_URL ?? "https://augmentslabs.com").replace(
  /\/$/,
  "",
);

async function liveManifest() {
  try {
    const res = await fetch(`${site}/synced/manifest.json`, {
      headers: { "User-Agent": "augments-labs-website" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error(`Could not read the live manifest: ${error.message}`);
    return null;
  }
}

const live = await liveManifest();
const upstream = {};
for (const project of projects) {
  const branch = await defaultBranch(project.slug);
  const commit = await latestDocsCommit(project.slug, branch);
  upstream[project.slug] = { branch, commit };
}

const changed = docsChanged(live, upstream);
for (const project of projects) {
  const was = live?.[project.slug]?.commit ?? "none";
  const now = upstream[project.slug].commit;
  const mark = changed.includes(project.slug) ? "changed" : "same";
  console.error(`  ${project.slug}: ${was} -> ${now} (${mark})`);
}
console.log(`changed=${changed.length > 0}`);
console.log(`projects=${changed.join(" ")}`);
