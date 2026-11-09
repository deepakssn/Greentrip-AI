import type { PropsWithChildren, ReactNode } from "react";

type Props = PropsWithChildren<{
  eyebrow?: string;
  title?: ReactNode;
  description?: ReactNode;
  className?: string;
  align?: "left" | "center";
}>;

export default function Section({
  eyebrow,
  title,
  description,
  className = "",
  align = "center",
  children,
}: Props) {
  return (
    <section className={`py-20 md:py-28 ${className}`}>
      <div className="container-app">
        {(eyebrow || title || description) && (
          <div
            className={`mb-14 ${align === "center" ? "text-center mx-auto max-w-3xl" : "max-w-3xl"}`}
          >
            {eyebrow && <span className="chip mb-4">{eyebrow}</span>}
            {title && (
              <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-fg">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-4 text-fg-muted text-base md:text-lg">
                {description}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
