import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { SessionDemo } from "./session-demo";
import type { Demo } from "@/lib/projects";

const demo: Demo = {
  surface: "session",
  title: "~/projects/parser",
  caption: "Caption for the session",
  alt: "Alt text for the session",
  loopMs: 12000,
  lines: [
    { at: 300, kind: "prompt", text: "fix the parser <bug>" },
    { at: 4000, kind: "skill", text: "sdlc-skills:debugging" },
    { at: 4700, kind: "text", text: "Using debugging first." },
    { at: 5500, kind: "note", text: "Ran 1 shell command" },
  ],
};

function render() {
  return renderToString(createElement(SessionDemo, { demo }));
}

describe("SessionDemo", () => {
  it("renders a figure with role img, the alt text and the loop length", () => {
    const html = render();
    expect(html).toContain('role="img"');
    expect(html).toContain('aria-label="Alt text for the session"');
    expect(html).toContain('style="--loop:12000"');
  });

  it("names Claude Code and shows the working directory in the header", () => {
    const html = render();
    expect(html).toContain("Claude Code");
    expect(html).toContain("~/projects/parser");
  });

  it("types the prompt and escapes it", () => {
    const html = render();
    expect(html).toContain("--chars:20");
    expect(html).toContain("fix the parser &lt;bug&gt;");
  });

  it("renders a skill line as a Skill call that loaded", () => {
    const html = render();
    expect(html).toContain("Skill");
    expect(html).toContain("(sdlc-skills:debugging)");
    expect(html).toContain("Successfully loaded skill");
  });

  it("times every line and marks its kind", () => {
    const html = render();
    for (const at of [300, 4000, 4700, 5500]) {
      expect(html).toContain(`style="--at:${at}"`);
    }
    expect(html).toContain('data-line-kind="note"');
    expect(html).toContain("Ran 1 shell command");
  });

  it("renders a figcaption with the caption", () => {
    expect(render()).toContain("Caption for the session");
  });
});
