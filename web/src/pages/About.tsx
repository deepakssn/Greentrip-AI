import { Compass, Heart, Microscope, Users } from "lucide-react";
import Section from "../components/Section";

const values = [
  {
    icon: Compass,
    title: "Outcomes over output",
    desc: "We measure ourselves on business impact, not models trained or tickets closed.",
  },
  {
    icon: Microscope,
    title: "Rigor in evaluation",
    desc: "If it's not measurable, it's not real. Every system ships with evals and SLOs.",
  },
  {
    icon: Users,
    title: "Embedded, not external",
    desc: "We work as part of your team — pairing, reviewing, and transferring ownership.",
  },
  {
    icon: Heart,
    title: "Responsible by default",
    desc: "Privacy, safety and fairness aren't add-ons. They're requirements from day one.",
  },
];

export default function About() {
  return (
    <>
      <Section
        eyebrow="About"
        title={<>We're builders who happen to <span className="gradient-text">love AI.</span></>}
        description="Greentrip Technologies is a focused team of ML engineers, product builders and platform architects. We've shipped AI systems at startups and Fortune 500s — and we bring the same rigor to every engagement."
      >
        <div className="grid gap-6 md:grid-cols-2">
          {values.map((v) => (
            <div key={v.title} className="card">
              <div className="h-10 w-10 rounded-lg bg-surface/5 border border-line/10 flex items-center justify-center text-accent-cyan">
                <v.icon size={18} />
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold text-fg">
                {v.title}
              </h3>
              <p className="mt-2 text-sm text-fg-muted">{v.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="How we work"
        title="A simple, transparent process"
      >
        <ol className="grid gap-6 md:grid-cols-4">
          {[
            { n: "01", t: "Discover", d: "Understand goals, data, constraints and success metrics." },
            { n: "02", t: "Design", d: "Architect the system, pick models, define evals and SLOs." },
            { n: "03", t: "Build", d: "Implement with weekly demos and continuous evaluation." },
            { n: "04", t: "Operate", d: "Launch, monitor, iterate. Transfer to your team when ready." },
          ].map((s) => (
            <li key={s.n} className="card">
              <div className="font-mono text-xs text-accent-cyan">{s.n}</div>
              <h3 className="mt-3 font-display text-lg font-semibold text-fg">{s.t}</h3>
              <p className="mt-2 text-sm text-fg-muted">{s.d}</p>
            </li>
          ))}
        </ol>
      </Section>
    </>
  );
}
