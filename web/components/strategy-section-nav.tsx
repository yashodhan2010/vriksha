"use client";

import { useEffect, useState } from "react";
import { LockKeyhole } from "lucide-react";
import { cn } from "@/lib/cn";

type SectionItem = {
  id: string;
  label: string;
  locked?: boolean;
};

export function StrategySectionNav({ items }: { items: SectionItem[] }) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const sections = items
      .map((item) => document.getElementById(item.id))
      .filter((element): element is HTMLElement => Boolean(element));

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActiveId(visible.target.id);
      },
      {
        rootMargin: "-128px 0px -58% 0px",
        threshold: [0.1, 0.25, 0.5]
      }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [items]);

  function scrollToSection(id: string) {
    const element = document.getElementById(id);
    if (!element) return;

    const top = element.getBoundingClientRect().top + window.scrollY - 118;
    window.history.pushState(null, "", `#${id}`);
    window.scrollTo({
      top,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
    });
  }

  return (
    <nav className="sticky top-16 z-20 border-b border-line bg-paper/95 backdrop-blur" aria-label="Strategy sections">
      <div className="mx-auto flex max-w-[1440px] gap-2 overflow-x-auto px-4 py-2 sm:px-6 lg:px-8">
        {items.map((item) => {
          const active = activeId === item.id;
          return (
            <button
              className={cn(
                "inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded px-3 py-2 text-sm font-semibold text-ink/64 transition duration-180 hover:bg-white hover:text-ink focus-visible:bg-white",
                active && "bg-pine text-white hover:bg-pine hover:text-white"
              )}
              type="button"
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              aria-current={active ? "true" : undefined}
            >
              {item.label}
              {item.locked && <LockKeyhole size={13} aria-label="Acknowledgement required" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
