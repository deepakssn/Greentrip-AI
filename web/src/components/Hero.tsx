import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-hero-glow pointer-events-none" />
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[900px] rounded-full bg-brand-500/20 blur-[120px] pointer-events-none" />

      <div className="container-app relative pt-20 pb-28 md:pt-28 md:pb-40">
        <div className="mx-auto max-w-4xl text-center">
          <span className="chip">
            <Sparkles size={14} className="text-accent-cyan" />
            Applied AI · Agents · LLMs · MLOps
          </span>
          <h1 className="mt-6 font-display text-5xl md:text-7xl font-bold tracking-tight leading-[1.05]">
            <span className="gradient-text">Ship intelligence.</span>
            <br />
            <span className="text-fg">Not just experiments.</span>
          </h1>
          <p className="mt-6 mx-auto max-w-2xl text-lg text-fg-muted">
            Greentrip Technologies partners with ambitious teams to design, build and operate
            production-grade AI — from autonomous agents and LLM apps to
            retrieval, computer vision and full MLOps platforms.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
            <Link to="/contact" className="btn-primary">
              Start a project <ArrowRight size={18} />
            </Link>
            <Link to="/services" className="btn-ghost">
              Explore services
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { k: "50+", v: "AI systems shipped" },
              { k: "12+", v: "Industries served" },
              { k: "99.9%", v: "Production uptime" },
              { k: "<200ms", v: "Avg. p95 latency" },
            ].map((s) => (
              <div key={s.v} className="glass rounded-2xl p-5">
                <div className="font-display text-2xl md:text-3xl font-bold text-fg">
                  {s.k}
                </div>
                <div className="mt-1 text-xs text-fg-muted">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
