import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, Mail, MapPin, Send, AlertTriangle } from "lucide-react";
import Section from "../components/Section";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

type FormState = {
  name: string;
  email: string;
  company: string;
  type: "support" | "project" | "help" | "other";
  budget: string;
  message: string;
  website?: string; // honeypot
};

const initial: FormState = {
  name: "",
  email: "",
  company: "",
  type: "project",
  budget: "",
  message: "",
  website: "",
};

export default function Contact() {
  const [data, setData] = useState<FormState>(initial);
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [error, setError] = useState<string>("");

  const update = (k: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => setData((d) => ({ ...d, [k]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (data.website) return; // bot
    if (!data.name || !data.email || !data.message) {
      setError("Please fill in name, email and message.");
      setStatus("error");
      return;
    }
    setStatus("sending");
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || `Request failed (${res.status})`);
      }
      setStatus("ok");
      setData(initial);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  return (
    <Section
      eyebrow="Contact"
      title={<>Tell us about your <span className="gradient-text">project.</span></>}
      description="Support, help requests, project briefs — they all land in the same inbox. We respond within one business day."
    >
      <div className="grid gap-10 lg:grid-cols-5">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="flex items-center gap-3 text-fg">
              <Mail size={18} className="text-accent-cyan" />
              <span className="font-medium">Email</span>
            </div>
            <a
              href="mailto:support@greentripai.com"
              className="mt-2 block text-fg-muted hover:text-fg"
            >
              support@greentripai.com
            </a>
            <p className="mt-1 text-xs text-fg-subtle">
              For sales, support and partnership inquiries.
            </p>
          </div>
          <div className="card">
            <div className="flex items-center gap-3 text-fg">
              <MapPin size={18} className="text-accent-cyan" />
              <span className="font-medium">Where we work</span>
            </div>
            <p className="mt-2 text-fg-muted">Remote-first, global delivery.</p>
            <p className="mt-1 text-xs text-fg-subtle">
              Hubs across North America, Europe and Asia.
            </p>
          </div>
          <div className="card">
            <h3 className="font-display text-lg font-semibold text-fg">
              Prefer to keep it short?
            </h3>
            <p className="mt-2 text-sm text-fg-muted">
              Just drop your name, email and a one-liner. We'll reply with a few
              sharp questions to scope things.
            </p>
          </div>
        </div>

        <motion.form
          onSubmit={onSubmit}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-3 card gradient-border"
        >
          {status === "ok" ? (
            <div className="text-center py-10">
              <div className="mx-auto h-14 w-14 rounded-full bg-accent-cyan/10 border border-accent-cyan/30 flex items-center justify-center text-accent-cyan">
                <CheckCircle2 size={28} />
              </div>
              <h3 className="mt-4 font-display text-2xl font-semibold text-fg">
                Message received
              </h3>
              <p className="mt-2 text-fg-muted">
                Thanks {`— `}we'll be in touch at the email you provided within one business day.
              </p>
              <button
                type="button"
                className="btn-ghost mt-6"
                onClick={() => setStatus("idle")}
              >
                Send another
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

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="label">Full name</label>
                  <input
                    className="input"
                    placeholder="Jane Doe"
                    value={data.name}
                    onChange={update("name")}
                    required
                  />
                </div>
                <div>
                  <label className="label">Work email</label>
                  <input
                    className="input"
                    type="email"
                    placeholder="jane@company.com"
                    value={data.email}
                    onChange={update("email")}
                    required
                  />
                </div>
                <div>
                  <label className="label">Company</label>
                  <input
                    className="input"
                    placeholder="Acme Inc."
                    value={data.company}
                    onChange={update("company")}
                  />
                </div>
                <div>
                  <label className="label">Inquiry type</label>
                  <select
                    className="input"
                    value={data.type}
                    onChange={update("type")}
                  >
                    <option value="project">New project</option>
                    <option value="support">Support request</option>
                    <option value="help">Help / question</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="label">Budget range (optional)</label>
                  <select
                    className="input"
                    value={data.budget}
                    onChange={update("budget")}
                  >
                    <option value="">Select a range</option>
                    <option value="<25k">Under $25k</option>
                    <option value="25-75k">$25k – $75k</option>
                    <option value="75-200k">$75k – $200k</option>
                    <option value="200k+">$200k+</option>
                    <option value="not-sure">Not sure yet</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="label">How can we help?</label>
                  <textarea
                    className="input min-h-[140px] resize-y"
                    placeholder="Tell us about your goals, data, timelines and any constraints."
                    value={data.message}
                    onChange={update("message")}
                    required
                  />
                </div>
              </div>

              {status === "error" && (
                <div className="mt-5 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
                  <AlertTriangle size={16} className="mt-0.5" />
                  <span>{error || "Something went wrong. Please try again."}</span>
                </div>
              )}

              <div className="mt-6 flex items-center justify-between gap-4 flex-wrap">
                <p className="text-xs text-fg-subtle">
                  By submitting you agree to be contacted at the email provided.
                </p>
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {status === "sending" ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> Sending…
                    </>
                  ) : (
                    <>
                      Send message <Send size={16} />
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </motion.form>
      </div>
    </Section>
  );
}
