import { describe, it, expect } from "vitest";
import { createElement as h } from "react";
import { renderToString } from "react-dom/server";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { LineIcon } from "./line-icon";
import { ICON_NAMES, DEFAULT_ICON } from "@/lib/projects";

describe("LineIcon component", () => {
  it("renders an svg element", () => {
    const html = renderToString(h(LineIcon, { name: "terminal" }));
    expect(html).toContain("<svg");
    expect(html).toContain("</svg>");
  });

  it("sets aria-hidden attribute", () => {
    const html = renderToString(h(LineIcon, { name: "terminal" }));
    expect(html).toContain('aria-hidden="true"');
  });

  it("sets data-icon attribute with icon name", () => {
    const html = renderToString(h(LineIcon, { name: "terminal" }));
    expect(html).toContain('data-icon="terminal"');
  });

  it("renders all icon names from ICON_NAMES", () => {
    for (const name of ICON_NAMES) {
      const html = renderToString(h(LineIcon, { name }));
      expect(html).toContain(`data-icon="${name}"`);
      expect(html).toContain("aria-hidden");
    }
  });

  it("renders default icon when used", () => {
    const html = renderToString(h(LineIcon, { name: DEFAULT_ICON }));
    expect(html).toContain(`data-icon="${DEFAULT_ICON}"`);
  });

  it("uses 24x24 viewBox", () => {
    const html = renderToString(h(LineIcon, { name: "terminal" }));
    expect(html).toContain('viewBox="0 0 24 24"');
  });

  it("sets viewBox on the svg element", () => {
    const html = renderToString(h(LineIcon, { name: "box" }));
    expect(html).toContain('viewBox="0 0 24 24"');
  });

  it("includes className when provided", () => {
    const html = renderToString(
      h(LineIcon, { name: "terminal", className: "custom-class" })
    );
    expect(html).toContain("custom-class");
  });

  it("every shape has pathLength attribute", () => {
    const html = renderToString(h(LineIcon, { name: "terminal" }));
    const pathLengthCount = (html.match(/pathLength="100"/g) || []).length;
    expect(pathLengthCount).toBeGreaterThan(0);
  });

  it("all icons render with pathLength attributes", () => {
    for (const name of ICON_NAMES) {
      const html = renderToString(h(LineIcon, { name }));
      const pathLengthCount = (html.match(/pathLength="100"/g) || []).length;
      expect(pathLengthCount).toBeGreaterThan(0);
    }
  });

  it("CSS file contains prefers-reduced-motion rule", () => {
    const cssPath = resolve(__dirname, "./line-icon.module.css");
    const css = readFileSync(cssPath, "utf-8");
    expect(css).toContain("prefers-reduced-motion");
  });

  it("CSS removes animation under prefers-reduced-motion", () => {
    const cssPath = resolve(__dirname, "./line-icon.module.css");
    const css = readFileSync(cssPath, "utf-8");
    expect(css).toMatch(/@media\s*\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)/);
  });

  it("idle state sets stroke-dashoffset: 100", () => {
    const cssPath = resolve(__dirname, "./line-icon.module.css");
    const css = readFileSync(cssPath, "utf-8");
    expect(css).toMatch(/\[data-motion="idle"\][\s\S]*?stroke-dashoffset:\s*100/);
  });

  it("running and paused share one rule that sets animation: draw", () => {
    const cssPath = resolve(__dirname, "./line-icon.module.css");
    const css = readFileSync(cssPath, "utf-8");
    expect(css).toMatch(/:global\(\[data-motion="running"\]\)[\s\S]*?,\s*:global\(\[data-motion="paused"\]\)[\s\S]*?animation:\s*draw/);
  });

  it("paused state sets animation-play-state: paused", () => {
    const cssPath = resolve(__dirname, "./line-icon.module.css");
    const css = readFileSync(cssPath, "utf-8");
    expect(css).toMatch(/\[data-motion="paused"\][\s\S]*?animation-play-state:\s*paused/);
  });

  it("hover rule for .group inside media query uses redraw", () => {
    const cssPath = resolve(__dirname, "./line-icon.module.css");
    const css = readFileSync(cssPath, "utf-8");
    expect(css).toMatch(/@media\s*\(\s*hover:\s*hover\s*\)[\s\S]*\.group[\s\S]*:hover[\s\S]*animation:\s*redraw/);
  });

  it("focus rule for .group uses redraw", () => {
    const cssPath = resolve(__dirname, "./line-icon.module.css");
    const css = readFileSync(cssPath, "utf-8");
    expect(css).toMatch(/\.group[\s\S]*:focus[\s\S]*animation:\s*redraw/);
  });

  it("reduced motion block sets animation: none and stroke-dashoffset: 0", () => {
    const cssPath = resolve(__dirname, "./line-icon.module.css");
    const css = readFileSync(cssPath, "utf-8");
    expect(css).toMatch(/@media\s*\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)[\s\S]*animation:\s*none\s*!important[\s\S]*stroke-dashoffset:\s*0\s*!important/);
  });

  it("base size is 22px", () => {
    const cssPath = resolve(__dirname, "./line-icon.module.css");
    const css = readFileSync(cssPath, "utf-8");
    expect(css).toMatch(/\.icon\s*{[\s\S]*?width:\s*22px[\s\S]*?height:\s*22px/);
  });

  it("rendered with no className, svg class attribute has no leading or trailing space", () => {
    const html = renderToString(h(LineIcon, { name: "terminal" }));
    const classMatch = html.match(/class="([^"]*)"/);
    expect(classMatch).not.toBeNull();
    if (classMatch) {
      expect(classMatch[1]).not.toMatch(/^\s/);
      expect(classMatch[1]).not.toMatch(/\s$/);
    }
  });

  it("idle state sets opacity: 0", () => {
    const cssPath = resolve(__dirname, "./line-icon.module.css");
    const css = readFileSync(cssPath, "utf-8");
    expect(css).toMatch(/\[data-motion="idle"\][\s\S]*?opacity:\s*0/);
  });

  it("draw keyframes start at opacity: 0 and end at opacity: 1", () => {
    const cssPath = resolve(__dirname, "./line-icon.module.css");
    const css = readFileSync(cssPath, "utf-8");
    expect(css).toMatch(/@keyframes\s+draw[\s\S]*?from\s*{[\s\S]*?opacity:\s*0[\s\S]*?to\s*{[\s\S]*?opacity:\s*1/);
  });

  it("redraw keyframes start at opacity: 0 and end at opacity: 1", () => {
    const cssPath = resolve(__dirname, "./line-icon.module.css");
    const css = readFileSync(cssPath, "utf-8");
    expect(css).toMatch(/@keyframes\s+redraw[\s\S]*?from\s*{[\s\S]*?opacity:\s*0[\s\S]*?to\s*{[\s\S]*?opacity:\s*1/);
  });

  it("reduced motion block sets opacity: 1", () => {
    const cssPath = resolve(__dirname, "./line-icon.module.css");
    const css = readFileSync(cssPath, "utf-8");
    expect(css).toMatch(/@media\s*\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)[\s\S]*?opacity:\s*1\s*!important/);
  });
});
