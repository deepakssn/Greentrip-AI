export default function Logo({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <span className={`inline-flex overflow-hidden rounded-xl ring-1 ring-line/20 ${className}`}>
      <img
        src="/gt-logo.webp"
        alt="Greentrip Technologies logo"
        width={96}
        height={96}
        className="h-full w-full object-cover"
      />
    </span>
  );
}
