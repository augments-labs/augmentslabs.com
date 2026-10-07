import type { Demo, DemoLine } from "@/lib/projects";
import motion from "./demo-motion.module.css";
import styles from "./session-demo.module.css";

interface SessionDemoProps {
  demo: Demo;
  className?: string;
}

function renderLine(line: DemoLine) {
  const { kind, text } = line;

  if (kind === "prompt") {
    return (
      <div className={styles.prompt}>
        <span className={styles.chevron}>❯</span>
        <span
          className={motion.typing}
          data-typing
          style={{ "--chars": text.length } as React.CSSProperties}
        >
          {text}
        </span>
        <span className={motion.cursor} />
      </div>
    );
  }

  if (kind === "skill") {
    return (
      <div className={styles.skill}>
        <span className={styles.skillDot} />
        <span>
          <span className={styles.callName}>Skill</span>
          {`(${text})`}
          <br />
          <span className={styles.loaded}>└ Successfully loaded skill</span>
        </span>
      </div>
    );
  }

  if (kind === "note") {
    return <div className={styles.note}>{text}</div>;
  }

  return (
    <div className={styles.text}>
      <span className={styles.textDot} />
      <span>{text}</span>
    </div>
  );
}

/**
 * A Claude Code session: a plain header with the product name and the
 * working directory, then the conversation line by line. No logo or
 * mascot, on purpose.
 */
export function SessionDemo({ demo, className }: SessionDemoProps) {
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
      <div className={styles.session}>
        <div className={styles.header}>
          <div>
            <div className={styles.product}>Claude Code</div>
            <div className={styles.cwd}>{demo.title}</div>
          </div>
        </div>
        <div className={styles.body}>
          {demo.lines.map((line, index) => (
            <div
              key={index}
              className={motion.line}
              data-line-kind={line.kind}
              style={{ "--at": line.at } as React.CSSProperties}
            >
              {renderLine(line)}
            </div>
          ))}
        </div>
      </div>
      <figcaption className={motion.caption}>{demo.caption}</figcaption>
    </figure>
  );
}
