import Section from "../components/Section";
import { cases } from "../data/services";

export default function CaseStudies() {
  return (
    <Section
      eyebrow="Case Studies"
      title="Outcomes we've delivered"
      description="A selection of recent AI engagements. Names redacted under NDA — happy to share details on a call."
    >
      <div className="grid gap-6 md:grid-cols-2">
        {cases.map((c) => (
          <div key={c.title} className="card gradient-border">
            <div className="flex items-center justify-between">
              <span className="chip">{c.client}</span>
              <span className="font-mono text-xs text-accent-cyan">{c.metric}</span>
            </div>
            <h3 className="mt-4 font-display text-xl font-semibold text-fg">
              {c.title}
            </h3>
            <p className="mt-2 text-sm text-fg-muted">{c.desc}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {c.tags.map((t) => (
                <span key={t} className="chip">{t}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
