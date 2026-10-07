import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { EditorDemo } from "./editor-demo";
import type { Demo } from "@/lib/projects";
import type { TokenRow } from "@/lib/highlight";

const demo: Demo = {
  surface: "editor",
  title: "review.py",
  caption: "Caption for the editor",
  alt: "Alt text for the editor",
  loopMs: 9000,
  lines: [
    { at: 100, kind: "code", text: "x = 1" },
    { at: 900, kind: "code", text: "" },
    { at: 1200, kind: "code", text: 'print("a & b")' },
  ],
};

const rows: TokenRow[] = [
  [
    { content: "x", light: "#111111", dark: "#eeeeee" },
    { content: " = ", light: "#111111", dark: "#eeeeee" },
    { content: "1", light: "#0550ae", dark: "#79c0ff" },
  ],
  [],
  [
    { content: "print", light: "#0550ae", dark: "#79c0ff" },
    { content: '("a & b")', light: "#0a3069", dark: "#a5d6ff" },
  ],
];

function render() {
  return renderToString(createElement(EditorDemo, { demo, rows }));
}

describe("EditorDemo", () => {
  it("renders a figure with role img, the alt text and the loop length", () => {
    const html = render();
    expect(html).toContain('role="img"');
    expect(html).toContain('aria-label="Alt text for the editor"');
    expect(html).toContain('style="--loop:9000"');
  });

  it("shows the file name as the tab title", () => {
    expect(render()).toContain("review.py");
  });

  it("numbers every line and times each one", () => {
    const html = render();
    expect(html).toContain('style="--at:100"');
    expect(html).toContain('style="--at:900"');
    expect(html).toContain('style="--at:1200"');
    expect(html).toMatch(/>1<\/span>/);
    expect(html).toMatch(/>3<\/span>/);
  });

  it("types each line with --chars equal to its length", () => {
    const html = render();
    expect(html).toContain("--chars:5");
    expect(html).toContain("--chars:0");
    expect(html).toContain("--chars:14");
  });

  it("colours tokens with the light colour and a dark override", () => {
    const html = render();
    expect(html).toContain("color:#0550ae");
    expect(html).toContain("--shiki-dark:#79c0ff");
    expect(html).toContain("a &amp; b");
  });

  it("renders a figcaption with the caption", () => {
    expect(render()).toContain("Caption for the editor");
  });

  it("keeps a short file unscrolled", () => {
    expect(render()).toContain("--scroll-lines:0");
  });

  it("scrolls one line for each line typed past the visible rows", () => {
    const long: Demo = {
      ...demo,
      lines: Array.from({ length: 20 }, (_, i) => ({
        at: 100 + i * 500,
        kind: "code" as const,
        text: `line ${i}`,
      })),
    };
    const longRows: TokenRow[] = long.lines.map((line) => [
      { content: line.text, light: "#111111", dark: "#eeeeee" },
    ]);
    const html = renderToString(createElement(EditorDemo, { demo: long, rows: longRows }));
    // Rows 0..17 fit; rows 18 and 19 each push the file up by one line.
    expect(html).toContain("--rows:18");
    expect(html).toContain("clamp(0, (var(--demo-t) - 9100) / 200, 1)");
    expect(html).toContain("clamp(0, (var(--demo-t) - 9600) / 200, 1)");
    expect(html).not.toContain("var(--demo-t) - 8600)");
  });
});
