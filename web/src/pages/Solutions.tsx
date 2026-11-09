import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Section from "../components/Section";
import { solutions } from "../data/services";

export default function Solutions() {
  return (
    <Section
      eyebrow="Solutions"
      title="AI blueprints, ready to adapt"
      description="Each solution is a proven architecture we deploy and tailor — saving months versus building from scratch."
    >
      <div className="grid gap-6 md:grid-cols-2">
        {solutions.map((s) => (
          <div key={s.title} className="card flex flex-col">
            {s.logo && (
              <img
                src={s.logo}
                alt=""
                width={480}
                height={160}
                className="h-9 w-auto mb-4 object-contain object-left"
              />
            )}
            <div className="flex flex-wrap gap-2">
              {s.tags.map((t) => (
                <span key={t} className="chip">{t}</span>
              ))}
            </div>
            <h3 className="mt-4 font-display text-xl font-semibold text-fg">
              {s.title}
            </h3>
            <p className="mt-2 text-sm text-fg-muted flex-1">{s.desc}</p>
            <Link
              to={s.href ?? "/contact"}
              className="btn-ghost mt-6 self-start text-sm py-2.5"
            >
              {s.href ? "Explore GTDoc" : "Discuss this solution"}{" "}
              <ArrowRight size={16} />
            </Link>
          </div>
        ))}
      </div>
    </Section>
  );
}
