import type { Demo } from "@/lib/projects";
import type { TokenRow } from "@/lib/highlight";
import motion from "./demo-motion.module.css";
import styles from "./editor-demo.module.css";

interface EditorDemoProps {
  demo: Demo;
  /** One coloured token row per demo line, from `tokenizeLines`. */
  rows: TokenRow[];
  className?: string;
}

/** Lines the editor shows at once; a longer file scrolls to follow the typing. */
const VISIBLE_ROWS = 18;

/**
 * How many lines the file has scrolled, as a CSS expression of the demo
 * clock: each line typed past the visible rows adds one, sliding in over
 * 200ms. It reads 0 while the file fits.
 */
function scrolledLines(demo: Demo): string {
  const terms = demo.lines
    .slice(VISIBLE_ROWS)
    .map((line) => `clamp(0, (var(--demo-t) - ${line.at}) / 200, 1)`);
  return terms.length ? `calc(${terms.join(" + ")})` : "0";
}

/**
 * A source file being written in an editor: a tab with the file name, a
 * line number gutter, and each line typed in turn with the docs' colours.
 */
export function EditorDemo({ demo, rows, className }: EditorDemoProps) {
  const containerClasses = [motion.container, className]
    .filter(Boolean)
    .join(" ");

  return (
    <figure
      role="img"
      aria-label={demo.alt}
      className={containerClasses}
      style={{ "--loop": demo.loopMs } as React.CSSProperties}
    >
      <div className={styles.editor}>
        <div className={styles.tabs}>
          <span className={styles.tab}>{demo.title}</span>
        </div>
        <div
          className={styles.body}
          style={{ "--rows": VISIBLE_ROWS } as React.CSSProperties}
        >
          <div className={styles.viewport}>
            <div
              className={styles.file}
              style={
                { "--scroll-lines": scrolledLines(demo) } as React.CSSProperties
              }
            >
              {demo.lines.map((line, index) => (
                <div
                  key={index}
                  className={`${motion.line} ${styles.row}`}
                  data-line-kind={line.kind}
                  style={{ "--at": line.at } as React.CSSProperties}
                >
                  <span className={styles.number}>{index + 1}</span>
                  <span
                    className={motion.typing}
                    data-typing
                    style={
                      { "--chars": line.text.length } as React.CSSProperties
                    }
                  >
                    {(rows[index] ?? []).map((token, i) => (
                      <span
                        key={i}
                        className={styles.token}
                        style={
                          {
                            color: token.light,
                            "--shiki-dark": token.dark,
                          } as React.CSSProperties
                        }
                      >
                        {token.content}
                      </span>
                    ))}
                  </span>
                  {index === demo.lines.length - 1 ? (
                    <span className={motion.cursor} />
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <figcaption className={motion.caption}>{demo.caption}</figcaption>
    </figure>
  );
}
