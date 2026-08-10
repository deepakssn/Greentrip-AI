import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="py-32 text-center">
      <div className="container-app">
        <p className="font-mono text-accent-cyan">404</p>
        <h1 className="mt-3 font-display text-4xl md:text-6xl font-bold text-white">
          Page not found
        </h1>
        <p className="mt-4 text-slate-400">
          The page you were looking for doesn't exist or has moved.
        </p>
        <Link to="/" className="btn-primary mt-8 inline-flex">
          Back home
        </Link>
      </div>
    </section>
  );
}
