import { describe, expect, it } from "vitest";
import { docsChanged } from "../../scripts/github.mjs";

const live = {
  "crucible-code": { branch: "main", commit: "aaa" },
  "sdlc-skills": { branch: "dev", commit: "bbb" },
};

describe("docsChanged", () => {
  it("is false when every project is at the deployed docs commit", () => {
    expect(docsChanged(live, { ...live })).toEqual([]);
  });

  it("names a project whose docs moved", () => {
    const upstream = { ...live, "sdlc-skills": { branch: "dev", commit: "ccc" } };
    expect(docsChanged(live, upstream)).toEqual(["sdlc-skills"]);
  });

  it("names a project the deployed site has never synced", () => {
    const upstream = { ...live, "augments-adk-python": { branch: "main", commit: "ddd" } };
    expect(docsChanged(live, upstream)).toEqual(["augments-adk-python"]);
  });

  it("treats a missing live manifest as every project changed", () => {
    expect(docsChanged(null, live)).toEqual(["crucible-code", "sdlc-skills"]);
  });
});
