import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { TerminalDemo } from "./terminal-demo";
import type { Demo } from "@/lib/projects";

describe("TerminalDemo", () => {
  const basePath = resolve(__dirname);

  const mockDemo: Demo = {
    title: "Test Demo",
    caption: "Test demonstration caption",
    alt: "Test alternative text for the demo",
    loopMs: 18000,
    lines: [
      { at: 0, kind: "prompt", text: "test command" },
      { at: 500, kind: "result", text: "output line" },
      {
        at: 1000,
        kind: "question",
        text: "Do you want to proceed?\n› 1. Yes\n  2. No",
      },
      { at: 2000, kind: "prompt", text: "another & special <script>" },
    ],
  };

  describe("Markup tests", () => {
    it("figure style holds --loop as plain number without ms", () => {
      const html = renderToString(createElement(TerminalDemo, { demo: mockDemo }));
      expect(html).toContain('style="--loop:18000"');
      expect(html).not.toContain("18000ms");
    });

    it("every line has data-line-kind and style holding --at as plain number", () => {
      const html = renderToString(createElement(TerminalDemo, { demo: mockDemo }));
      expect(html).toContain('data-line-kind="prompt"');
      expect(html).toContain('data-line-kind="result"');
      expect(html).toContain('data-line-kind="question"');
      expect(html).toContain('style="--at:0"');
      expect(html).toContain('style="--at:500"');
      expect(html).toContain('style="--at:1000"');
    });

    it("typing span has data-typing and --chars equal to text length", () => {
      const html = renderToString(createElement(TerminalDemo, { demo: mockDemo }));
      expect(html).toContain('data-typing');
      expect(html).toContain('--chars:12');
      expect(html).toContain('--chars:26');
    });

    it("rendered HTML holds no --kind", () => {
      const html = renderToString(createElement(TerminalDemo, { demo: mockDemo }));
      expect(html).not.toContain("--kind");
    });

    it("chosen answer in question has data-chosen true", () => {
      const html = renderToString(createElement(TerminalDemo, { demo: mockDemo }));
      expect(html).toContain('data-chosen="true"');
      expect(html).toContain("› 1. Yes");
    });

    it("renders a figure with role img and aria-label", () => {
      const html = renderToString(createElement(TerminalDemo, { demo: mockDemo }));
      expect(html).toContain('role="img"');
      expect(html).toContain('aria-label="Test alternative text for the demo"');
    });

    it("renders a figcaption with the demo caption", () => {
      const html = renderToString(createElement(TerminalDemo, { demo: mockDemo }));
      expect(html).toContain("<figcaption");
      expect(html).toContain("Test demonstration caption");
    });

    it("renders lines in order", () => {
      const html = renderToString(createElement(TerminalDemo, { demo: mockDemo }));
      const testIndex = html.indexOf("test command");
      const outputIndex = html.indexOf("output line");
      const questionIndex = html.indexOf("Do you want to proceed");
      expect(testIndex).toBeGreaterThan(-1);
      expect(outputIndex).toBeGreaterThan(-1);
      expect(questionIndex).toBeGreaterThan(-1);
      expect(testIndex < outputIndex).toBe(true);
      expect(outputIndex < questionIndex).toBe(true);
    });

    it("escapes HTML entities in text content", () => {
      const html = renderToString(createElement(TerminalDemo, { demo: mockDemo }));
      expect(html).toContain("&amp;");
      expect(html).toContain("&lt;");
      expect(html).toContain("&gt;");
      expect(html).not.toContain("<script>");
    });

    it("renders question lines as bordered blocks, not box-drawing characters", () => {
      const html = renderToString(createElement(TerminalDemo, { demo: mockDemo }));
      expect(html).toContain("Do you want to proceed");
      expect(html).not.toContain("╭");
      expect(html).not.toContain("╮");
      expect(html).not.toContain("│");
      expect(html).not.toContain("╰");
      expect(html).not.toContain("╯");
    });

    it("tool line kind renders with data-line-kind and preserves leading spaces", () => {
      const demoWithTool: Demo = {
        title: "Test Demo",
        caption: "Test caption",
        alt: "Test alt",
        loopMs: 5000,
        lines: [
          { at: 300, kind: "tool", text: "  read   src/lib/docs.ts" },
        ],
      };
      const html = renderToString(
        createElement(TerminalDemo, { demo: demoWithTool })
      );
      expect(html).toContain('data-line-kind="tool"');
      expect(html).toContain("  read   src/lib/docs.ts");
    });
  });

  describe("CSS tests (shared motion rules)", () => {
    it("@property --demo-t is declared", () => {
      const cssPath = resolve(basePath, "demo-motion.module.css");
      const cssContent = readFileSync(cssPath, "utf-8");
      expect(cssContent).toContain("@property --demo-t");
    });

    it(".container sets --demo-t: var(--loop)", () => {
      const cssPath = resolve(basePath, "demo-motion.module.css");
      const cssContent = readFileSync(cssPath, "utf-8");
      expect(cssContent).toContain(".container {");
      expect(cssContent).toContain("--demo-t: var(--loop)");
    });

    it("idle rule sets --demo-t: 0", () => {
      const cssPath = resolve(basePath, "demo-motion.module.css");
      const cssContent = readFileSync(cssPath, "utf-8");
      expect(cssContent).toContain('[data-motion="idle"]');
      expect(cssContent).toContain("--demo-t: 0");
    });

    it("running and paused share one rule that sets animation: tick", () => {
      const cssPath = resolve(basePath, "demo-motion.module.css");
      const cssContent = readFileSync(cssPath, "utf-8");
      expect(cssContent).toContain('[data-motion="running"]');
      expect(cssContent).toContain('[data-motion="paused"]');
      expect(cssContent).toContain("animation: tick");
    });

    it("paused rule sets animation-play-state: paused", () => {
      const cssPath = resolve(basePath, "demo-motion.module.css");
      const cssContent = readFileSync(cssPath, "utf-8");
      expect(cssContent).toContain('[data-motion="paused"]');
      expect(cssContent).toContain("animation-play-state: paused");
    });

    it(".line block holds no animation declaration", () => {
      const cssPath = resolve(basePath, "demo-motion.module.css");
      const cssContent = readFileSync(cssPath, "utf-8");
      const lineSection = cssContent.match(/\.line\s*\{[^}]+\}/);
      expect(lineSection).toBeTruthy();
      expect(lineSection![0]).not.toContain("animation");
    });

    it("reduced motion block sets animation: none on .container", () => {
      const cssPath = resolve(basePath, "demo-motion.module.css");
      const cssContent = readFileSync(cssPath, "utf-8");
      expect(cssContent).toContain("@media (prefers-reduced-motion: reduce)");
      expect(cssContent).toContain("animation: none");
      expect(cssContent).toContain(".container");
    });

    it(".question block sets white-space: pre", () => {
      const cssPath = resolve(basePath, "terminal-demo.module.css");
      const cssContent = readFileSync(cssPath, "utf-8");
      const questionMatch = cssContent.match(/\.question\s*\{[^}]+\}/);
      expect(questionMatch).toBeTruthy();
      expect(questionMatch![0]).toContain("white-space: pre");
    });

    it(".question block holds no pre-wrap and no max-width", () => {
      const cssPath = resolve(basePath, "terminal-demo.module.css");
      const cssContent = readFileSync(cssPath, "utf-8");
      const questionMatch = cssContent.match(/\.question\s*\{[^}]+\}/);
      expect(questionMatch).toBeTruthy();
      expect(questionMatch![0]).not.toContain("pre-wrap");
      expect(questionMatch![0]).not.toContain("max-width");
    });

    it(".question block sets width: max-content", () => {
      const cssPath = resolve(basePath, "terminal-demo.module.css");
      const cssContent = readFileSync(cssPath, "utf-8");
      const questionMatch = cssContent.match(/\.question\s*\{[^}]+\}/);
      expect(questionMatch).toBeTruthy();
      expect(questionMatch![0]).toContain("width: max-content");
    });

    it(".body block still sets overflow-x: auto", () => {
      const cssPath = resolve(basePath, "terminal-demo.module.css");
      const cssContent = readFileSync(cssPath, "utf-8");
      const bodyMatch = cssContent.match(/\.body\s*\{[^}]+\}/);
      expect(bodyMatch).toBeTruthy();
      expect(bodyMatch![0]).toContain("overflow-x: auto");
    });

    it(".question div sets min-height", () => {
      const cssPath = resolve(basePath, "terminal-demo.module.css");
      const cssContent = readFileSync(cssPath, "utf-8");
      const questionDivMatch = cssContent.match(/\.question\s+div\s*\{[^}]+\}/);
      expect(questionDivMatch).toBeTruthy();
      expect(questionDivMatch![0]).toContain("min-height");
    });
  });

  describe("Question indentation tests", () => {
    it("question with empty rows and indented text preserves formatting", () => {
      const demoWithIndent: Demo = {
        title: "Test",
        caption: "Caption",
        alt: "Alt",
        loopMs: 18000,
        lines: [
          {
            at: 0,
            kind: "question",
            text: "Write file\n  hello.txt\n\nDo you want to proceed?\n› 1. Yes, once\n  2. Yes, and don't ask\n  3. No, and end",
          },
        ],
      };
      const html = renderToString(
        createElement(TerminalDemo, { demo: demoWithIndent })
      );
      expect(html).toContain("Write file");
      expect(html).toContain("  hello.txt");
      expect(html).toContain("Do you want to proceed?");
      expect(html).toContain("  2. Yes");
      expect(html).toContain("  3. No");
    });
  });
});
