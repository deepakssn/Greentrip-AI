import { Link } from "react-router-dom";
import { ArrowRight, Cpu, Rocket, Shield, Sparkles, Zap } from "lucide-react";
import Hero from "../components/Hero";
import Section from "../components/Section";
import { services, solutions } from "../data/services";

const pillars = [
  {
    icon: Cpu,
    title: "Engineered for production",
    desc: "Eval harnesses, observability, guardrails and SLOs from day one — not bolted on later.",
  },
  {
    icon: Zap,
    title: "Latency you can feel",
    desc: "Streaming, caching, batching and tight model selection. p95 targets under 200ms where it matters.",
  },
  {
    icon: Shield,
    title: "Safe by design",
    desc: "PII redaction, policy enforcement, red-teaming and audit trails baked into every system we ship.",
  },
  {
    icon: Rocket,
    title: "Ship in weeks",
    desc: "Battle-tested blueprints for agents, RAG, vision and MLOps so we move from idea to value, fast.",
  },
];

export default function Home() {
  return (
    <>
      <Hero />

      <Section
        eyebrow="Why Greentrip Technologies"
        title={<>Built for outcomes,<br />not demos.</>}
        description="Most AI projects stall at the proof-of-concept. We build the unglamorous parts that make AI durable in production."
      >
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {pillars.map((p) => (
            <div
              key={p.title}
              className="card gradient-border"
            >
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-brand-500 to-accent-violet flex items-center justify-center text-[#141810] shadow-glow">
                <p.icon size={20} />
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold text-fg">
                {p.title}
              </h3>
              <p className="mt-2 text-sm text-fg-muted">{p.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Capabilities"
        title="The full stack of applied AI"
        description="From strategy to platforms, agents to vision — one team that owns the outcome."
      >
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.slice(0, 6).map((s) => (
            <div
              key={s.title}
              className="card"
            >
              <div className="h-10 w-10 rounded-lg bg-surface/5 border border-line/10 flex items-center justify-center text-accent-cyan">
                <s.icon size={18} />
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold text-fg">
                {s.title}
              </h3>
              <p className="mt-2 text-sm text-fg-muted">{s.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link to="/services" className="btn-ghost">
            See all services <ArrowRight size={18} />
          </Link>
        </div>
      </Section>

      <Section
        eyebrow="Solutions"
        title="Ready-to-deploy AI blueprints"
        description="Accelerators we've shipped before — adapted to your data, brand and constraints."
      >
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {solutions.slice(0, 6).map((s) => {
            const inner = (
              <>
                {s.logo && (
                  <img
                    src={s.logo}
                    alt=""
                    width={480}
                    height={160}
                    className="h-8 w-auto mb-3 object-contain object-left"
                  />
                )}
                <div className="flex flex-wrap gap-2">
                  {s.tags.map((t) => (
                    <span key={t} className="chip">{t}</span>
                  ))}
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold text-fg">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm text-fg-muted">{s.desc}</p>
              </>
            );
            return s.href ? (
              <Link key={s.title} to={s.href} className="card block hover:bg-surface/[0.05]">
                {inner}
              </Link>
            ) : (
              <div key={s.title} className="card">
                {inner}
              </div>
            );
          })}
        </div>
      </Section>

      <section className="py-24">
        <div className="container-app">
          <div className="relative overflow-hidden rounded-3xl gradient-border p-10 md:p-16 text-center bg-gradient-to-br from-brand-900/40 via-ink-900 to-ink-900">
            <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-brand-500/30 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-accent-violet/30 blur-3xl" />
            <span className="chip"><Sparkles size={14} /> Let's build</span>
            <h2 className="mt-6 font-display text-3xl md:text-5xl font-bold text-fg">
              Have a problem worth <span className="gradient-text">automating?</span>
            </h2>
            <p className="mt-4 text-fg-muted max-w-2xl mx-auto">
              Tell us about your project. We'll respond within one business day with a
              recommended approach and ballpark timeline.
            </p>
            <div className="mt-8 flex justify-center gap-4 flex-wrap">
              <Link to="/contact" className="btn-primary">
                Start a project <ArrowRight size={18} />
              </Link>
              <Link to="/case-studies" className="btn-ghost">
                See case studies
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
