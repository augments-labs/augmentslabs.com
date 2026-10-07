import { createElement } from "react";
import { renderToReadableStream } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Markdown } from "./markdown";

async function render(content: string): Promise<string> {
  const stream = await renderToReadableStream(
    createElement(Markdown, { content, baseSegments: ["p"] }),
  );
  await stream.allReady;
  return new Response(stream).text();
}

const textOf = (html: string) => html.replace(/<[^>]+>/g, "");

describe("Markdown fenced code blocks", () => {
  it("renders inside a <pre> so indentation and line breaks survive", async () => {
    const html = await render("```ts\nfunction f() {\n    return 1;\n}\n```\n");
    expect(html).toMatch(/<pre[^>]*>\s*<code/);
    expect(html).toMatch(/<pre[^>]*data-language="ts"[^>]*>/);
    expect(textOf(html)).toContain("function f() {\n    return 1;\n}");
  });

  it("keeps the copy button next to the code", async () => {
    const html = await render("```sh\nnpm test\n```\n");
    expect(html).toMatch(/<pre[\s\S]*<\/pre>[\s\S]*Copy/);
  });
});

describe("Markdown raw HTML from the project docs", () => {
  it("renders a <picture> with a dark source as a light and a dark image", async () => {
    const html = await render(
      '<picture>\n  <source media="(prefers-color-scheme: dark)" srcset="../assets/loop-dark.svg">\n  <img alt="The loop" src="../assets/loop-light.svg" width="720">\n</picture>\n',
    );
    expect(html).not.toContain("&lt;picture");
    expect(html).toMatch(
      /<img[^>]*src="\/synced\/assets\/loop-light\.svg"[^>]*class="[^"]*dark:hidden/,
    );
    expect(html).toMatch(
      /<img[^>]*src="\/synced\/assets\/loop-dark\.svg"[^>]*class="[^"]*dark:block/,
    );
    expect(html).toContain('alt="The loop"');
    expect(html).toContain('width="720"');
  });

  it("renders a bare <img> against the docs folder", async () => {
    const html = await render('<img src="./shot.png" alt="Shot">\n');
    expect(html).toContain('<img src="/synced/p/shot.png" alt="Shot"');
  });

  it("keeps inline tags such as <kbd> and <br>", async () => {
    const html = await render("Press <kbd>Esc</kbd> to stop.<br>Then wait.\n");
    expect(html).toContain("<kbd>Esc</kbd>");
    expect(html).toContain("<br");
  });

  it("drops scripts", async () => {
    const html = await render("<script>alert(1)</script>\n\nText\n");
    expect(html).not.toContain("<script");
    expect(html).not.toContain("alert(1)");
  });
});
