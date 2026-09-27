import { createElement } from "react";
import { renderToReadableStream } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CodeBlock } from "./code-block";

async function render(children: string): Promise<string> {
  const stream = await renderToReadableStream(
    createElement(CodeBlock, null, children),
  );
  await stream.allReady;
  return new Response(stream).text();
}

describe("CodeBlock copy button", () => {
  it("has aria-label Copy code", async () => {
    const html = await render("<pre><code>test</code></pre>");
    expect(html).toMatch(/aria-label="Copy code"/);
  });

  it("hides button only inside hover: hover media condition", async () => {
    const html = await render("<pre><code>test</code></pre>");
    expect(html).not.toContain("<style");
    expect(html).not.toContain("data-code-block-button");

    const buttonMatch = html.match(/<button[^>]*class="([^"]*)"/);
    expect(buttonMatch).toBeTruthy();
    const buttonClass = buttonMatch![1];
    const tokens = buttonClass.split(/\s+/);

    expect(tokens).toContain("[@media(hover:hover)]:opacity-0");
    expect(tokens).toContain("group-hover:opacity-100");
    expect(tokens).toContain("focus-visible:opacity-100");
    expect(tokens).not.toContain("opacity-0");
  });

  it("wrapper reserves space for button on touch devices", async () => {
    const html = await render("<pre><code>test</code></pre>");

    const wrapperMatch = html.match(/<div[^>]*class="([^"]*)"/);
    expect(wrapperMatch).toBeTruthy();
    const wrapperClass = wrapperMatch![1];
    const tokens = wrapperClass.split(/\s+/);

    expect(tokens).toContain("group");
    expect(tokens).toContain("relative");
    expect(wrapperClass).toMatch(/\[@media\(hover:none\)\]:\[&amp;?_pre\]:pt-10/);
  });
});
