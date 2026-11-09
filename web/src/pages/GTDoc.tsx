import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Bell,
  Boxes,
  Building2,
  CalendarClock,
  CheckCircle2,
  KeyRound,
  LayoutDashboard,
  ListTree,
  Loader2,
  Mail,
  Phone,
  Pill,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users,
} from "lucide-react";
import Section from "../components/Section";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

const features = [
  {
    icon: LayoutDashboard,
    title: "Role-aware dashboard",
    desc: "Summary cards, alerts and quick actions that adapt to each staff member's role — the whole clinic at a glance.",
  },
  {
    icon: Users,
    title: "Patient records",
    desc: "Fast search with status filters, rich patient profiles, cross-tab navigation and one-click PDF downloads.",
  },
  {
    icon: CalendarClock,
    title: "Appointments & queue",
    desc: "Multiple booking flows and live queue management keep the front desk and chairs running on time.",
  },
  {
    icon: Stethoscope,
    title: "AI-assisted consultation",
    desc: "A guided clinical workflow with past prescriptions, custom line items and carry-forward tasks between visits.",
  },
  {
    icon: ReceiptText,
    title: "Billing & invoices",
    desc: "Full invoice lifecycle with payment recording and treatment-level line items — no revenue slips through.",
  },
  {
    icon: Pill,
    title: "Prescriptions",
    desc: "Create and review prescriptions with clinic branding and a complete per-patient history.",
  },
  {
    icon: Boxes,
    title: "Pharmacy & inventory",
    desc: "Stock receipts, adjustments and supplier management across a multi-tab inventory built for busy clinics.",
  },
  {
    icon: ListTree,
    title: "Treatment catalog",
    desc: "A Domain → Subdomain → Task hierarchy with pricing so every procedure is standardized and costed.",
  },
  {
    icon: Building2,
    title: "Multi-clinic & doctors",
    desc: "Manage multiple clinics, doctors and time slots with per-clinic branding from a single account.",
  },
  {
    icon: ShieldCheck,
    title: "Roles & access control",
    desc: "Three roles with a clear permissions matrix, plus block/unblock controls for tight, safe access.",
  },
  {
    icon: BarChart3,
    title: "Reports & analytics",
    desc: "Visual reports across revenue, operations and clinical activity to steer the practice with real numbers.",
  },
  {
    icon: KeyRound,
    title: "Passwordless sign-in",
    desc: "Secure email OTP authentication — no passwords to reset, no credentials to leak.",
  },
];

type LeadState = {
  email: string;
  phone: string;
  website?: string; // honeypot
};

const initialLead: LeadState = { email: "", phone: "", website: "" };

export default function GTDoc() {
  const [data, setData] = useState<LeadState>(initialLead);
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [error, setError] = useState<string>("");

  const update = (k: keyof LeadState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setData((d) => ({ ...d, [k]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (data.website) return; // bot
    const email = data.email.trim();
    const phone = data.phone.trim();
    if (!email || !phone) {
      setError("Please add both your email and phone number.");
      setStatus("error");
      return;
    }
    setStatus("sending");
    setError("");
    try {
      const payload = {
        name: email.split("@")[0] || "GTDoc lead",
        email,
        company: "",
        type: "project",
        budget: "",
        message: `GTDoc early-access request.\nPhone: ${phone}\nInterested in the AI-powered dental clinic management app.`,
        website: "",
      };
      const res = await fetch(`${API_BASE}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || `Request failed (${res.status})`);
      }
      setStatus("ok");
      setData(initialLead);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-glow pointer-events-none" />
        <div className="absolute inset-0 grid-bg pointer-events-none" />
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[900px] rounded-full bg-brand-500/20 blur-[120px] pointer-events-none" />

        <div className="container-app relative pt-20 pb-20 md:pt-28 md:pb-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="mx-auto max-w-4xl text-center"
          >
            <img
              src="/gtdoc-logo.png"
              alt="GTDoc"
              className="mx-auto h-14 md:h-16 w-auto object-contain"
            />
            <span className="chip mt-6">
              <Sparkles size={14} className="text-accent-cyan" />
              AI for dental clinics
            </span>
            <h1 className="mt-6 font-display text-4xl md:text-6xl font-bold tracking-tight leading-[1.05]">
              <span className="gradient-text">The AI-powered</span>
              <br />
              <span className="text-fg">dental clinic OS.</span>
            </h1>
            <p className="mt-6 mx-auto max-w-2xl text-lg text-fg-muted">
              GTDoc runs your entire practice — patients, appointments,
              consultations, billing, pharmacy and reporting — in one intelligent
              platform, so your team spends less time on admin and more time on care.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
              <a href="#early-access" className="btn-primary">
                Get early access <ArrowRight size={18} />
              </a>
              <a href="#features" className="btn-ghost">
                Explore features
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <div id="features" />
      <Section
        eyebrow="Features"
        title="Everything a modern clinic needs"
        description="One connected system for the front desk, the chair, the pharmacy and the back office."
      >
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.04 }}
              className="card"
            >
              <div className="h-10 w-10 rounded-lg bg-surface/5 border border-line/10 flex items-center justify-center text-accent-cyan">
                <f.icon size={18} />
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold text-fg">
                {f.title}
              </h3>
              <p className="mt-2 text-sm text-fg-muted">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Why GTDoc"
        title="Built to run the whole practice"
      >
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Bell,
              title: "Fewer no-shows",
              desc: "Smart queues and reminders keep the schedule full and patients on time.",
            },
            {
              icon: ReceiptText,
              title: "Cleaner revenue",
              desc: "Treatment-linked billing and invoice tracking close the gaps that leak income.",
            },
            {
              icon: ShieldCheck,
              title: "Safe by design",
              desc: "Role-based access and passwordless auth protect patient data end to end.",
            },
          ].map((b) => (
            <div key={b.title} className="card gradient-border">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-brand-500 to-accent-violet flex items-center justify-center text-[#141810] shadow-glow">
                <b.icon size={20} />
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold text-fg">
                {b.title}
              </h3>
              <p className="mt-2 text-sm text-fg-muted">{b.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <section id="early-access" className="py-16 md:py-24">
        <div className="container-app">
          <div className="relative overflow-hidden rounded-3xl gradient-border p-8 md:p-14 bg-gradient-to-br from-brand-900/40 via-ink-900 to-ink-900">
            <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-brand-500/30 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-accent-violet/30 blur-3xl" />
            <div className="relative grid gap-10 lg:grid-cols-2 items-center">
              <div>
                <span className="chip"><Sparkles size={14} /> Early access</span>
                <h2 className="mt-6 font-display text-3xl md:text-4xl font-bold text-fg">
                  Interested? <span className="gradient-text">Get on the list.</span>
                </h2>
                <p className="mt-4 text-fg-muted max-w-md">
                  Leave your email and phone number and our team will reach out with a
                  personalized GTDoc walkthrough for your clinic.
                </p>
              </div>

              <motion.form
                onSubmit={onSubmit}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="card"
              >
                {status === "ok" ? (
                  <div className="text-center py-8">
                    <div className="mx-auto h-14 w-14 rounded-full bg-accent-cyan/10 border border-accent-cyan/30 flex items-center justify-center text-accent-cyan">
                      <CheckCircle2 size={28} />
                    </div>
                    <h3 className="mt-4 font-display text-2xl font-semibold text-fg">
                      You're on the list
                    </h3>
                    <p className="mt-2 text-fg-muted">
                      Thanks — we'll be in touch shortly to schedule your walkthrough.
                    </p>
                    <button
                      type="button"
                      className="btn-ghost mt-6"
                      onClick={() => setStatus("idle")}
                    >
                      Add another
                    </button>
                  </div>
                ) : (
                  <>
                    <input
                      type="text"
                      name="website"
                      value={data.website}
                      onChange={update("website")}
                      tabIndex={-1}
                      autoComplete="off"
                      className="hidden"
                      aria-hidden
                    />
                    <div className="space-y-5">
                      <div>
                        <label className="label">Work email</label>
                        <div className="relative">
                          <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle" />
                          <input
                            className="input pl-10"
                            type="email"
                            placeholder="you@clinic.com"
                            value={data.email}
                            onChange={update("email")}
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="label">Phone number</label>
                        <div className="relative">
                          <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle" />
                          <input
                            className="input pl-10"
                            type="tel"
                            placeholder="+91 98765 43210"
                            value={data.phone}
                            onChange={update("phone")}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {status === "error" && (
                      <p className="mt-4 text-sm text-red-300">
                        {error || "Something went wrong. Please try again."}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={status === "sending"}
                      className="btn-primary mt-6 w-full disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {status === "sending" ? (
                        <>
                          <Loader2 size={18} className="animate-spin" /> Sending…
                        </>
                      ) : (
                        <>
                          Request early access <ArrowRight size={16} />
                        </>
                      )}
                    </button>
                    <p className="mt-3 text-xs text-fg-subtle">
                      We'll only use your details to contact you about GTDoc.
                    </p>
                  </>
                )}
              </motion.form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
