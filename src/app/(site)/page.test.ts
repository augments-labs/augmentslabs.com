import { readFileSync } from "node:fs";
import { renderToReadableStream } from "react-dom/server";
import { describe, expect, it } from "vitest";

async function render(component: React.ReactElement): Promise<string> {
  const stream = await renderToReadableStream(component);
  await stream.allReady;
  return new Response(stream).text();
}

describe("Home page", () => {
  it("renders one card per project with a data-icon attribute", async () => {
    const { default: Page } = await import("./page");
    const element = await Page();
    const html = await render(element);

    const iconMatches = html.match(/data-icon="(?:terminal|graph|checklist)"/g);
    expect(iconMatches).toHaveLength(3);
  });

  it("renders five principles with data-icon attributes", async () => {
    const { default: Page } = await import("./page");
    const element = await Page();
    const html = await render(element);

    const principleIcons = html.match(/data-icon="(?:person|eye|fork|home|gauge)"/g);
    expect(principleIcons).toHaveLength(5);
  });

  it("hero text contains none of the project names from projects.json", async () => {
    const { default: Page } = await import("./page");
    const element = await Page();
    const html = await render(element);

    const heroMatch = html.match(/<section[^>]*>[\s\S]*?<\/section>/);
    expect(heroMatch).toBeDefined();
    const heroSection = heroMatch![0];

    expect(heroSection).not.toMatch(/Crucible Code/);
    expect(heroSection).not.toMatch(/Augments ADK/);
    expect(heroSection).not.toMatch(/SDLC Skills/);
  });

  it("contains no em dash in rendered text", async () => {
    const { default: Page } = await import("./page");
    const element = await Page();
    const html = await render(element);

    expect(html).not.toMatch(/[\u2013\u2014]/);
  });

  it("has no button or link inside the hero section", async () => {
    const { default: Page } = await import("./page");
    const element = await Page();
    const html = await render(element);

    const heroMatch = html.match(/<section[^>]*>[\s\S]*?<\/section>/);
    expect(heroMatch).toBeDefined();
    const heroSection = heroMatch![0];

    expect(heroSection).not.toMatch(/<button/);
    expect(heroSection).not.toMatch(/<a[\s>]/);
  });

  it("has no figure with role='img' anywhere on the page", async () => {
    const { default: Page } = await import("./page");
    const element = await Page();
    const html = await render(element);

    expect(html).not.toMatch(/<figure[^>]*role="img"/);
  });

  it("every card's icon sits inside an element with data-motion", async () => {
    const { default: Page } = await import("./page");
    const element = await Page();
    const html = await render(element);

    const motionElements = html.match(/data-motion/g);
    expect(motionElements).toHaveLength(8);
  });

  it("in each card, chip text appears before the project name h3, and svg before chip", async () => {
    const { default: Page } = await import("./page");
    const element = await Page();
    const html = await render(element);

    const cardStarts = html.split("<a").slice(1);
    const cards = cardStarts
      .map((part) => "<a" + part)
      .filter((card) => card.includes('href="/') && card.includes("class=") && card.includes("group"))
      .map((card) => card.split("</a>")[0] + "</a>");

    expect(cards.length).toBeGreaterThan(0);

    cards.forEach((card) => {
      const svgIndex = card.indexOf("<svg");
      const chipIndex = card.indexOf("<span");
      const h3Index = card.indexOf("<h3");

      expect(svgIndex).toBeLessThan(chipIndex);
      expect(chipIndex).toBeLessThan(h3Index);
    });
  });

  it("the rendered HTML holds no w-5 h-5", async () => {
    const { default: Page } = await import("./page");
    const element = await Page();
    const html = await render(element);

    expect(html).not.toMatch(/w-5\s+h-5|h-5\s+w-5/);
  });

  it("each card link's class list holds focus-visible:outline-accent and group", async () => {
    const { default: Page } = await import("./page");
    const element = await Page();
    const html = await render(element);

    const cardStarts = html.split("<a").slice(1);
    const cards = cardStarts
      .map((part) => "<a" + part)
      .filter((card) => card.includes('href="/') && card.includes("class=") && card.includes("group"));

    expect(cards.length).toBeGreaterThan(0);

    cards.forEach((card) => {
      expect(card).toMatch(/focus-visible:outline-accent/);
      expect(card).toMatch(/group/);
    });
  });

  it("the em dash escape is used and the test file has no literal em dash", async () => {
    const { default: Page } = await import("./page");
    const element = await Page();
    const html = await render(element);

    expect(html).not.toMatch(/[\u2013\u2014]/);

    const testFile = readFileSync("./src/app/(site)/page.test.ts", "utf-8");
    expect(testFile).not.toContain(String.fromCharCode(0x2014));
  });
});
