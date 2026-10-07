import { codeToTokens, type BundledLanguage } from "shiki";

export type Token = { content: string; light: string; dark: string };
export type TokenRow = Token[];

const THEMES = {
  light: "github-light-default",
  dark: "github-dark-default",
} as const;

/**
 * Colours source lines with the same themes the docs use, one token row per
 * input line, so an editor demo can type each line on its own.
 */
export async function tokenizeLines(
  lines: string[],
  lang: BundledLanguage,
): Promise<TokenRow[]> {
  const { tokens } = await codeToTokens(lines.join("\n"), {
    lang,
    themes: THEMES,
  });
  return lines.map((_, i) =>
    (tokens[i] ?? []).map((token) => ({
      content: token.content,
      light: token.htmlStyle?.color ?? token.color ?? "",
      dark: token.htmlStyle?.["--shiki-dark"] ?? token.color ?? "",
    })),
  );
}
