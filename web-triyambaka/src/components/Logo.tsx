export default function Logo({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <span className={`inline-flex overflow-hidden rounded-xl ring-1 ring-white/20 ${className}`}>
      <img
        src="/gt-logo.png"
        alt="Greentrip Technologies logo"
        className="h-full w-full object-cover"
        style={{ filter: "hue-rotate(125deg) saturate(170%) brightness(88%)" }}
      />
    </span>
  );
}
