import { cn } from "@/lib/cn";

export function Section({
  className,
  tight = false,
  children,
  ...rest
}: {
  className?: string;
  tight?: boolean;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <section className={cn(tight ? "section-tight" : "section", className)} {...rest}>
      {children}
    </section>
  );
}
