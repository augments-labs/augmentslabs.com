import { type ReactNode } from "react";
import { type IconName } from "@/lib/projects";
import styles from "./line-icon.module.css";

interface LineIconProps {
  name: IconName;
  className?: string;
}

const iconDefinitions: Record<IconName, ReactNode[]> = {
  terminal: [
    <rect key="0" x="3" y="4.5" width="18" height="15" rx="2" pathLength="100" />,
    <path key="1" d="m7 10 3 2.2L7 14.4" pathLength="100" />,
    <path key="2" d="M12.5 15H17" pathLength="100" />,
  ],
  graph: [
    <circle key="0" cx="6" cy="6.5" r="2.2" pathLength="100" />,
    <circle key="1" cx="18" cy="8" r="2.2" pathLength="100" />,
    <circle key="2" cx="10.5" cy="18" r="2.2" pathLength="100" />,
    <path key="3" d="M8.1 7 15.8 7.8M7 8.6l2.7 7.3M16.6 9.8l-4.6 6.6" pathLength="100" />,
  ],
  checklist: [
    <path key="0" d="m4 6.5 1.6 1.6 2.8-3.1" pathLength="100" />,
    <path key="1" d="M11.5 6.5H20" pathLength="100" />,
    <path key="2" d="m4 12.5 1.6 1.6 2.8-3.1" pathLength="100" />,
    <path key="3" d="M11.5 12.5H20" pathLength="100" />,
    <path key="4" d="M4.4 18.5h3.4M11.5 18.5H20" pathLength="100" />,
  ],
  box: [
    <path key="0" d="M12 3.5 20 8v8l-8 4.5L4 16V8z" pathLength="100" />,
    <path key="1" d="M4 8l8 4.5L20 8M12 12.5v8" pathLength="100" />,
  ],
  person: [
    <circle key="0" cx="12" cy="8" r="3.4" pathLength="100" />,
    <path key="1" d="M5 20c.6-3.6 3.4-5.6 7-5.6s6.4 2 7 5.6" pathLength="100" />,
    <path key="2" d="m15.6 7.6 1.5 1.5 2.9-3" pathLength="100" />,
  ],
  eye: [
    <path key="0" d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12S18 18.5 12 18.5 2.5 12 2.5 12z" pathLength="100" />,
    <circle key="1" cx="12" cy="12" r="2.8" pathLength="100" />,
  ],
  fork: [
    <circle key="0" cx="6" cy="5.5" r="2" pathLength="100" />,
    <circle key="1" cx="18" cy="5.5" r="2" pathLength="100" />,
    <circle key="2" cx="12" cy="19" r="2" pathLength="100" />,
    <path key="3" d="M6 7.5v2.2c0 1.6 1.2 2.8 2.8 2.8h6.4c1.6 0 2.8-1.2 2.8-2.8V7.5M12 12.5V17" pathLength="100" />,
  ],
  home: [
    <path key="0" d="M3.5 11.5 12 4l8.5 7.5" pathLength="100" />,
    <path key="1" d="M6 10v9.5h12V10" pathLength="100" />,
    <path key="2" d="M10 19.5v-5h4v5" pathLength="100" />,
  ],
  gauge: [
    <path key="0" d="M4 17a8.5 8.5 0 1 1 16 0" pathLength="100" />,
    <path key="1" d="m12 14 4-5" pathLength="100" />,
    <path key="2" d="M6.5 19.5h11" pathLength="100" />,
  ],
};

export function LineIcon({ name, className }: LineIconProps): ReactNode {
  const shapes = iconDefinitions[name];
  const classList = [styles.icon, className].filter(Boolean).join(" ");

  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      data-icon={name}
      className={classList}
    >
      {shapes}
    </svg>
  );
}
