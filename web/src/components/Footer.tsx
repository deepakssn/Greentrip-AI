import { Link } from "react-router-dom";
import { Mail, Github, Linkedin, Twitter } from "lucide-react";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-white/10 bg-ink-950/60">
      <div className="container-app py-14 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <Logo className="h-9 w-9" />
            <span className="font-display text-xl font-bold text-white">
              Greentrip <span className="gradient-text">Technologies</span>
            </span>
          </div>
          <p className="mt-4 max-w-md text-sm text-slate-400">
            Applied AI for modern enterprises. We design, build, and operate
            agentic systems, LLM platforms, and ML pipelines that ship to
            production.
          </p>
          <a
            href="mailto:support@greentripai.com"
            className="mt-4 inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white"
          >
            <Mail size={16} /> support@greentripai.com
          </a>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white mb-3">Company</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><Link to="/about" className="hover:text-white">About</Link></li>
            <li><Link to="/services" className="hover:text-white">Services</Link></li>
            <li><Link to="/solutions" className="hover:text-white">Solutions</Link></li>
            <li><Link to="/case-studies" className="hover:text-white">Case Studies</Link></li>
            <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white mb-3">Connect</h4>
          <div className="flex gap-3">
            <a
              href="https://www.linkedin.com"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-full border border-white/10 hover:bg-white/5"
              aria-label="LinkedIn"
            >
              <Linkedin size={16} />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-full border border-white/10 hover:bg-white/5"
              aria-label="Twitter"
            >
              <Twitter size={16} />
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-full border border-white/10 hover:bg-white/5"
              aria-label="GitHub"
            >
              <Github size={16} />
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-app py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Greentrip Technologies. All rights reserved.</p>
          <p>Built with React, Vite, Tailwind. Hosted on Firebase + Cloud Run.</p>
        </div>
      </div>
    </footer>
  );
}
