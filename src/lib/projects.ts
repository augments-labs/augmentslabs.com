import projectsJson from "./projects.json";

export const ICON_NAMES = Object.freeze([
  "terminal",
  "graph",
  "checklist",
  "box",
  "person",
  "eye",
  "fork",
  "home",
  "gauge",
] as const);

export type IconName = (typeof ICON_NAMES)[number];

export const DEFAULT_ICON: IconName = "box";

/**
 * What the demo frame looks like. A terminal shows a command line session,
 * an editor shows a source file being written, and a session shows a Claude
 * Code conversation. With none set, the frame is a terminal.
 */
export type DemoSurface = "terminal" | "editor" | "session";

export type DemoLine = {
  at: number;
  /**
   * Terminal: mode, prompt, tool, question, result.
   * Editor: code.
   * Session: prompt, skill, text, note.
   */
  kind:
    | "mode"
    | "prompt"
    | "tool"
    | "question"
    | "result"
    | "code"
    | "skill"
    | "text"
    | "note";
  text: string;
};

export type Demo = {
  surface?: DemoSurface;
  /** Window title: the command, the file name or the working directory. */
  title: string;
  caption: string;
  alt: string;
  loopMs: number;
  lines: DemoLine[];
};

export interface Project {
  /** Repo name in the augments-labs org; also the /<slug> URL segment. */
  slug: string;
  /** Display name on cards and doc pages. */
  name: string;
  /** One-liner shown on the project card. */
  tagline: string;
  language: string;
  repoUrl: string;
  /** Install/build snippet for the welcome page. */
  quickstart: { label: string; code: string };
  /** 3 to 5 bullets for the welcome page. */
  highlights: string[];
  /** Icon identifier for the project card. */
  icon?: IconName;
  /** Recorded session demonstration. */
  demo?: Demo;
}

export const ORG = "augments-labs";

export const projects: Project[] = projectsJson as Project[];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function iconFor(project: Project): IconName {
  return project.icon ?? DEFAULT_ICON;
}

export function validateDemo(demo: Demo): string[] {
  const errors: string[] = [];

  if (demo.loopMs <= 0) {
    errors.push(
      `loopMs must be greater than zero (got ${demo.loopMs}ms)`
    );
  }

  if (demo.lines.length === 0) {
    return errors;
  }

  for (let i = 0; i < demo.lines.length; i++) {
    if (demo.lines[i].at < 0) {
      errors.push(
        `Line ${i} at must be non-negative (at ${demo.lines[i].at}ms is before zero)`
      );
    }
  }

  for (let i = 1; i < demo.lines.length; i++) {
    if (demo.lines[i].at <= demo.lines[i - 1].at) {
      errors.push(
        `Line ${i} must be in time order (at ${demo.lines[i].at}ms is not after ${demo.lines[i - 1].at}ms)`
      );
    }
  }

  const lastLine = demo.lines[demo.lines.length - 1];
  if (lastLine.at >= demo.loopMs) {
    errors.push(
      `Last line must start before the loop ends (at ${lastLine.at}ms is not before ${demo.loopMs}ms)`
    );
  }

  return errors;
}
