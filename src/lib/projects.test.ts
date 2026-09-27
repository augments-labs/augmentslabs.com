import { describe, it, expect } from "vitest";
import {
  ICON_NAMES,
  DEFAULT_ICON,
  iconFor,
  validateDemo,
  projects,
  type IconName,
  type Demo,
} from "./projects";

describe("projects", () => {
  describe("ICON_NAMES", () => {
    it("contains the expected icon set", () => {
      expect(ICON_NAMES).toEqual([
        "terminal",
        "graph",
        "checklist",
        "box",
        "person",
        "eye",
        "fork",
        "home",
        "gauge",
      ]);
    });

    it("is readonly", () => {
      expect(() => {
        // @ts-expect-error - testing immutability
        ICON_NAMES.push("invalid");
      }).toThrow();
    });
  });

  describe("DEFAULT_ICON", () => {
    it("is 'box'", () => {
      expect(DEFAULT_ICON).toBe("box");
    });

    it("is a valid icon name", () => {
      expect(ICON_NAMES).toContain(DEFAULT_ICON);
    });
  });

  describe("IconName type", () => {
    it("accepts valid icon names", () => {
      const icon: IconName = "terminal";
      expect(ICON_NAMES).toContain(icon);
    });
  });

  describe("iconFor", () => {
    it("returns the project icon when present", () => {
      const project = {
        slug: "test",
        name: "Test",
        tagline: "Test",
        language: "Test",
        repoUrl: "https://example.com",
        quickstart: { label: "Test", code: "test" },
        highlights: [],
        icon: "terminal" as IconName,
      };
      expect(iconFor(project)).toBe("terminal");
    });

    it("returns the default icon when not present", () => {
      const project = {
        slug: "test",
        name: "Test",
        tagline: "Test",
        language: "Test",
        repoUrl: "https://example.com",
        quickstart: { label: "Test", code: "test" },
        highlights: [],
      };
      expect(iconFor(project)).toBe(DEFAULT_ICON);
    });

    it("returns the default icon when icon is undefined", () => {
      const project = {
        slug: "test",
        name: "Test",
        tagline: "Test",
        language: "Test",
        repoUrl: "https://example.com",
        quickstart: { label: "Test", code: "test" },
        highlights: [],
        icon: undefined,
      };
      expect(iconFor(project)).toBe(DEFAULT_ICON);
    });
  });

  describe("validateDemo", () => {
    it("returns empty array for a valid demo", () => {
      const demo: Demo = {
        title: "Test Demo",
        caption: "A test caption",
        alt: "Alt text",
        loopMs: 5000,
        lines: [
          { at: 0, kind: "mode", text: "line 1" },
          { at: 1000, kind: "prompt", text: "line 2" },
          { at: 3000, kind: "result", text: "line 3" },
        ],
      };
      expect(validateDemo(demo)).toEqual([]);
    });

    it("rejects lines that are not in time order", () => {
      const demo: Demo = {
        title: "Test Demo",
        caption: "A test caption",
        alt: "Alt text",
        loopMs: 5000,
        lines: [
          { at: 1000, kind: "mode", text: "line 1" },
          { at: 500, kind: "prompt", text: "line 2" },
        ],
      };
      const errors = validateDemo(demo);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain("order");
    });

    it("rejects the last line if it starts at or after the loop end", () => {
      const demo: Demo = {
        title: "Test Demo",
        caption: "A test caption",
        alt: "Alt text",
        loopMs: 5000,
        lines: [
          { at: 0, kind: "mode", text: "line 1" },
          { at: 5000, kind: "prompt", text: "line 2" },
        ],
      };
      const errors = validateDemo(demo);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain("before the loop");
    });

    it("allows the last line if it starts before the loop end", () => {
      const demo: Demo = {
        title: "Test Demo",
        caption: "A test caption",
        alt: "Alt text",
        loopMs: 5000,
        lines: [
          { at: 0, kind: "mode", text: "line 1" },
          { at: 4999, kind: "prompt", text: "line 2" },
        ],
      };
      expect(validateDemo(demo)).toEqual([]);
    });

    it("accepts empty lines array", () => {
      const demo: Demo = {
        title: "Test Demo",
        caption: "A test caption",
        alt: "Alt text",
        loopMs: 5000,
        lines: [],
      };
      expect(validateDemo(demo)).toEqual([]);
    });

    it("rejects two lines with the same at", () => {
      const demo: Demo = {
        title: "Test Demo",
        caption: "A test caption",
        alt: "Alt text",
        loopMs: 5000,
        lines: [
          { at: 1000, kind: "mode", text: "line 1" },
          { at: 1000, kind: "prompt", text: "line 2" },
        ],
      };
      const errors = validateDemo(demo);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain("order");
    });

    it("rejects loopMs of zero", () => {
      const demo: Demo = {
        title: "Test Demo",
        caption: "A test caption",
        alt: "Alt text",
        loopMs: 0,
        lines: [
          { at: 0, kind: "mode", text: "line 1" },
        ],
      };
      const errors = validateDemo(demo);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain("loopMs");
    });

    it("rejects loopMs of negative value", () => {
      const demo: Demo = {
        title: "Test Demo",
        caption: "A test caption",
        alt: "Alt text",
        loopMs: -1,
        lines: [
          { at: 0, kind: "mode", text: "line 1" },
        ],
      };
      const errors = validateDemo(demo);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain("loopMs");
    });

    it("rejects a first line with negative at", () => {
      const demo: Demo = {
        title: "Test Demo",
        caption: "A test caption",
        alt: "Alt text",
        loopMs: 5000,
        lines: [
          { at: -100, kind: "mode", text: "line 1" },
        ],
      };
      const errors = validateDemo(demo);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain("non-negative");
    });

    it("rejects a demo with no lines and loopMs zero", () => {
      const demo: Demo = {
        title: "Test Demo",
        caption: "A test caption",
        alt: "Alt text",
        loopMs: 0,
        lines: [],
      };
      const errors = validateDemo(demo);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain("loopMs");
    });

    it("accepts a first line with at of zero and valid loopMs", () => {
      const demo: Demo = {
        title: "Test Demo",
        caption: "A test caption",
        alt: "Alt text",
        loopMs: 5000,
        lines: [
          { at: 0, kind: "mode", text: "line 1" },
        ],
      };
      expect(validateDemo(demo)).toEqual([]);
    });
  });

  describe("all projects in projects.json", () => {
    it("have valid icons or no icon field", () => {
      for (const project of projects) {
        if (project.icon !== undefined) {
          expect(ICON_NAMES).toContain(project.icon);
        }
      }
    });

    it("have valid demos or no demo field", () => {
      for (const project of projects) {
        if (project.demo !== undefined) {
          const errors = validateDemo(project.demo);
          expect(errors).toEqual([]);
        }
      }
    });

    it("all three projects have icons assigned", () => {
      expect(projects).toHaveLength(3);
      for (const project of projects) {
        expect(project.icon).toBeDefined();
        expect(ICON_NAMES).toContain(project.icon);
      }
    });
  });
});
