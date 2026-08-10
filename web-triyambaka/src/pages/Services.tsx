import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import Section from "../components/Section";
import { services } from "../data/services";

export default function Services() {
  return (
    <>
      <Section
        eyebrow="Services"
        title="A complete AI partner — from strategy to scale"
        description="Engagements scoped to your stage. Whether you're shipping a first AI feature or building a platform, we plug in where it counts."
      >
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <div key={s.title} className="card">
              <div className="h-10 w-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-accent-cyan">
                <s.icon size={18} />
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold text-white">
                {s.title}
              </h3>
              <p className="mt-2 text-sm text-slate-400">{s.desc}</p>
              <ul className="mt-4 space-y-2">
                {s.points.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm text-slate-300">
                    <Check size={16} className="mt-0.5 text-accent-cyan" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Engagements"
        title="Three ways to work with us"
        description="Choose what fits — from a focused sprint to a long-term build partnership."
      >
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              name: "Discovery Sprint",
              price: "2 weeks",
              desc: "Audit, prioritize and prototype the highest-leverage AI bet for your team.",
              perks: ["AI maturity audit", "Use-case shortlist", "Working prototype", "Build/buy plan"],
            },
            {
              name: "Build & Ship",
              price: "6–16 weeks",
              desc: "We design, build and deploy a production AI system end-to-end.",
              perks: ["Architecture & infra", "Models, evals, guardrails", "Integrations", "Launch + handover"],
              featured: true,
            },
            {
              name: "AI Platform Partner",
              price: "Ongoing",
              desc: "Embedded team operating your AI roadmap, platform and SLOs.",
              perks: ["Dedicated pod", "Roadmap ownership", "24×7 ops", "Quarterly OKRs"],
            },
          ].map((p) => (
            <div
              key={p.name}
              className={`card relative ${p.featured ? "gradient-border" : ""}`}
            >
              {p.featured && (
                <span className="absolute -top-3 left-6 chip bg-brand-500/20 border-brand-400/40 text-white">
                  Most popular
                </span>
              )}
              <h3 className="font-display text-xl font-semibold text-white">{p.name}</h3>
              <div className="mt-1 text-sm text-slate-400">{p.price}</div>
              <p className="mt-4 text-sm text-slate-300">{p.desc}</p>
              <ul className="mt-5 space-y-2">
                {p.perks.map((perk) => (
                  <li key={perk} className="flex gap-2 text-sm text-slate-300">
                    <Check size={16} className="mt-0.5 text-accent-cyan" />
                    {perk}
                  </li>
                ))}
              </ul>
              <Link to="/contact" className="btn-ghost mt-6 w-full">
                Talk to us <ArrowRight size={16} />
              </Link>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
