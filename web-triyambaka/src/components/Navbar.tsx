import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";

const links = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/solutions", label: "Solutions" },
  { to: "/case-studies", label: "Case Studies" },
  { to: "/about", label: "About" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <header
      className={`sticky top-0 z-50 transition-all ${
        scrolled
          ? "backdrop-blur-2xl bg-ink-950/70 border-b border-white/10"
          : "bg-transparent"
      }`}
    >
      <div className="container-app flex items-center justify-between py-4">
        <Link to="/" className="flex items-center gap-3 group">
          <Logo className="h-9 w-9 transition-transform group-hover:rotate-6" />
          <span className="font-display text-xl font-bold tracking-tight text-white">
            Greentrip <span className="gradient-text">Technologies</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                `px-4 py-2 rounded-full text-sm transition ${
                  isActive
                    ? "text-white bg-white/10"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:flex">
          <Link to="/contact" className="btn-primary text-sm py-2.5">
            Get in touch
          </Link>
        </div>

        <button
          className="md:hidden text-slate-200 p-2"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-white/10 bg-ink-950/95 backdrop-blur-xl">
          <div className="container-app py-4 flex flex-col gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                className={({ isActive }) =>
                  `px-4 py-3 rounded-xl text-sm ${
                    isActive
                      ? "text-white bg-white/10"
                      : "text-slate-300 hover:bg-white/5"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
            <Link to="/contact" className="btn-primary mt-3 text-sm">
              Get in touch
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
