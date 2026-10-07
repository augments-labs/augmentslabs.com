import Link from "next/link";
import { projects, iconFor, type IconName } from "@/lib/projects";
import { LineIcon } from "@/components/line-icon";
import { MotionGate } from "@/components/motion-gate";

interface Principle {
  title: string;
  body: string;
  icon: IconName;
}

const principles: Principle[] = [
  {
    title: "Human authority",
    body: "A tool from this lab carries out what it was asked and leaves the decisions that matter to the person using it. It never acts on its own behalf.",
    icon: "person",
  },
  {
    title: "Understandable behavior",
    body: "You can see what a tool is doing and why at every step. If it goes somewhere you did not expect, you can stop it and take over.",
    icon: "eye",
  },
  {
    title: "Meaningful choice",
    body: "Each tool works with the models, agents and services you already use. Nothing here ties you to one provider, and you can swap a part out when a better one comes along.",
    icon: "fork",
  },
  {
    title: "Local ownership",
    body: "A tool from this lab runs where you run it, on your machine or in your own environment. Your work and your data stay with you.",
    icon: "home",
  },
  {
    title: "Measured usefulness",
    body: "A tool earns its place by what it does for the person using it. Finished work and fewer mistakes count for more than an impressive demo.",
    icon: "gauge",
  },
];

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
      <section className="pt-20 pb-16 sm:pt-28">
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Practical augments for human capability.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
          An <strong className="font-semibold text-foreground">augment</strong>{" "}
          is a tool that extends what a person can do. It does not replace
          the person or decide for them, and it will not demand their
          attention. The person stays in command.
        </p>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
          Augments Labs is where we build them. Each project below has its own
          repository and its own docs.
        </p>
      </section>

      <section id="projects" className="scroll-mt-20 border-t border-border py-16">
        <h2 className="text-2xl font-semibold tracking-tight">Projects</h2>
        <div className="mt-8 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project.slug}
              href={`/${project.slug}`}
              className="group flex flex-col rounded-xl border border-border bg-surface p-5 transition-colors hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent focus-visible:border-accent"
            >
              <div className="flex items-center justify-between gap-2">
                <MotionGate once>
                  <LineIcon name={iconFor(project)} />
                </MotionGate>
                <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted">
                  {project.language}
                </span>
              </div>
              <h3 className="mt-3 font-semibold group-hover:text-accent">
                {project.name}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-6 text-muted">
                {project.tagline}
              </p>
              <span className="mt-4 text-sm font-medium text-accent">
                Explore →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-border py-16">
        <h2 className="text-2xl font-semibold tracking-tight">What guides us</h2>
        <dl className="mt-8 grid gap-8 sm:grid-cols-2">
          {principles.map((principle) => (
            <div key={principle.title} className="flex gap-3">
              <MotionGate once className="shrink-0 mt-0.5">
                <LineIcon name={principle.icon} />
              </MotionGate>
              <div>
                <dt className="font-semibold">{principle.title}</dt>
                <dd className="mt-1 text-sm leading-6 text-muted">
                  {principle.body}
                </dd>
              </div>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
