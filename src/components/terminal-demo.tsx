import { ReactNode } from "react";
import type { Demo, DemoLine } from "@/lib/projects";
import styles from "./terminal-demo.module.css";

interface TerminalDemoProps {
  demo: Demo;
  className?: string;
}

function renderLineContent(line: DemoLine): ReactNode {
  const { kind, text } = line;

  if (kind === "prompt") {
    return (
      <>
        <span className={styles.prompt}>›</span>{" "}
        <span
          className={styles.typing}
          data-typing
          style={
            {
              "--chars": text.length,
            } as React.CSSProperties
          }
        >
          {text}
        </span>
        <span className={styles.cursor} />
      </>
    );
  }

  if (kind === "question") {
    return (
      <div className={styles.question}>
        {text.split("\n").map((part, i) => (
          <div
            key={i}
            data-chosen={part.startsWith("›") ? "true" : undefined}
          >
            {part}
          </div>
        ))}
      </div>
    );
  }

  if (kind === "result") {
    return <span className={styles.result}>{text}</span>;
  }

  if (kind === "tool") {
    return <span className={styles.tool}>{text}</span>;
  }

  if (kind === "mode") {
    return <span className={styles.mode}>{text}</span>;
  }

  return text;
}

export function TerminalDemo({
  demo,
  className,
}: TerminalDemoProps) {
  const containerClasses = [styles.container, className]
    .filter(Boolean)
    .join(" ");

  return (
    <figure
      role="img"
      aria-label={demo.alt}
      className={containerClasses}
      style={
        {
          "--loop": demo.loopMs,
        } as React.CSSProperties
      }
    >
      <div className={styles.terminal}>
        <div className={styles.bar}>
          <div className={styles.dot} />
          <div className={styles.dot} />
          <div className={styles.dot} />
          <span className={styles.title}>{demo.title}</span>
        </div>
        <div className={styles.body}>
          {demo.lines.map((line, index) => (
            <div
              key={index}
              className={styles.line}
              data-line-kind={line.kind}
              style={
                {
                  "--at": line.at,
                } as React.CSSProperties
              }
            >
              {renderLineContent(line)}
            </div>
          ))}
        </div>
      </div>
      <figcaption className={styles.caption}>{demo.caption}</figcaption>
    </figure>
  );
}
