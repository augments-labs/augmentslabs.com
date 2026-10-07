import { describe, it, expect } from "vitest";
import { tokenizeLines } from "./highlight";

describe("tokenizeLines", () => {
  it("returns one token row per input line, joining back to the line", async () => {
    const lines = ['if kind == "interrupted":', "    print(kind)", ""];
    const rows = await tokenizeLines(lines, "python");
    expect(rows).toHaveLength(3);
    rows.forEach((row, i) => {
      expect(row.map((t) => t.content).join("")).toBe(lines[i]);
    });
  });

  it("gives every token a light colour and a dark colour", async () => {
    const [row] = await tokenizeLines(["x = 1"], "python");
    for (const token of row) {
      expect(token.light).toMatch(/^#/);
      expect(token.dark).toMatch(/^#/);
    }
  });
});
