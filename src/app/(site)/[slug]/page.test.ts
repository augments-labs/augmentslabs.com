import { renderToReadableStream } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import ProjectWelcomePage from "./page";

// Every shipped project has a demo, so the no-demo path is covered by a
// copy of Augments ADK with its demo removed.
vi.mock("@/lib/projects", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/projects")>();
  const noDemo = { ...actual.getProject("augments-adk-python")! };
  delete noDemo.demo;
  return {
    ...actual,
    getProject: (slug: string) =>
      slug === "no-demo" ? noDemo : actual.getProject(slug),
  };
});

async function renderPage(slug: string): Promise<string> {
  const element = await ProjectWelcomePage({
    params: Promise.resolve({ slug }),
  });
  const stream = await renderToReadableStream(element);
  await stream.allReady;
  return new Response(stream).text();
}

function extractHeaderRegion(html: string): string {
  const navEndIndex = html.indexOf("</nav>");
  const sectionStartIndex = html.indexOf("<section");
  if (navEndIndex === -1 || sectionStartIndex === -1) {
    throw new Error("Header region markers not found in HTML");
  }
  return html.substring(navEndIndex + 6, sectionStartIndex);
}

const baselineHeaderNoDemoProject = '<span class="rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-muted">Python</span><h1 class="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Augments ADK</h1><p class="mt-4 max-w-2xl text-lg leading-8 text-muted">A framework to orchestrate a complex system of agents that performs real-world actions.</p><div class="mt-8 flex flex-wrap gap-3"><a class="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90" href="/no-demo/docs">Read the docs</a><a href="https://github.com/augments-labs/augments-adk-python" target="_blank" rel="noreferrer" class="rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-accent hover:text-accent">View on GitHub</a></div>';

describe("Project Welcome Page", () => {
  it("renders markup unchanged for project without demo", async () => {
    const html = await renderPage("no-demo");
    const headerRegion = extractHeaderRegion(html);
    expect(headerRegion).toBe(baselineHeaderNoDemoProject);
  });

  it("header region starts with grid for project with demo", async () => {
    const html = await renderPage("crucible-code");
    const headerRegion = extractHeaderRegion(html);
    expect(headerRegion).toMatch(/^<div class="grid /);
  });

  it("renders a figure with role img when project has a demo", async () => {
    const html = await renderPage("crucible-code");
    expect(html).toContain('<figure role="img"');
  });

  it("demo figure appears after View on GitHub for project with demo", async () => {
    const html = await renderPage("crucible-code");
    const viewGithubIndex = html.indexOf("View on GitHub");
    const figureIndex = html.indexOf('<figure role="img"');
    expect(viewGithubIndex).toBeGreaterThan(-1);
    expect(figureIndex).toBeGreaterThan(viewGithubIndex);
  });

  it("demo in motion gate with min-w-0 class for project with demo", async () => {
    const html = await renderPage("crucible-code");
    const figureIndex = html.indexOf('<figure role="img"');
    expect(figureIndex).toBeGreaterThan(-1);
    const beforeFigure = html.substring(Math.max(0, figureIndex - 500), figureIndex);
    expect(beforeFigure).toContain('data-motion=');
    expect(beforeFigure).toContain('min-w-0');
  });

  it("grid has lg:grid-cols-2 class for project with demo", async () => {
    const html = await renderPage("crucible-code");
    expect(html).toContain('lg:grid-cols-2');
  });

  it("no lg:grid-cols-2 or empty class for project without demo", async () => {
    const html = await renderPage("no-demo");
    expect(html).not.toContain('lg:grid-cols-2');
    expect(html).not.toContain('class=""');
  });

  it("renders breadcrumb and actions for project with demo", async () => {
    const html = await renderPage("crucible-code");
    expect(html).toContain("Home");
    expect(html).toContain("Read the docs");
    expect(html).toContain("View on GitHub");
  });

  it("renders breadcrumb and actions for project without demo", async () => {
    const html = await renderPage("no-demo");
    expect(html).toContain("Home");
    expect(html).toContain("Read the docs");
    expect(html).toContain("View on GitHub");
  });
});
