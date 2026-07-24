"use client";

import { useEffect, useRef, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ShieldCheck, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const navItems: Array<{ href: Route; label: string }> = [
  { href: "/", label: "Home" },
  { href: "/strategies", label: "Strategies" },
  { href: "/performance", label: "Performance" },
  { href: "/compliance", label: "Compliance" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/contact", label: "Contact" }
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;

    supabase.auth.getUser().then(({ data }) => setLoggedIn(Boolean(data.user)));
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(Boolean(session?.user));
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase?.auth.signOut();
    setLoggedIn(false);
    window.location.href = "/";
  }

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    function onClickOutside(event: MouseEvent) {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onClickOutside);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, [open]);

  return (
    <header
      ref={headerRef}
      className={cn(
        "sticky top-0 z-30 border-b bg-paper/92 backdrop-blur transition-all duration-250 ease-out",
        scrolled ? "border-line shadow-sm bg-paper/96" : "border-line/60 shadow-none"
      )}
    >
      <div className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="grid h-9 w-9 place-items-center rounded bg-pine text-white">
            <ShieldCheck size={18} aria-hidden="true" />
          </span>
          <span className="font-serif text-lg tracking-tight">Vriksha</span>
        </Link>

        <nav className="hidden items-center gap-1 text-sm text-ink/72 md:flex">
          {navItems.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group relative rounded px-3 py-2 transition-colors duration-180",
                  active ? "font-semibold text-ink" : "hover:text-ink"
                )}
              >
                {item.label}
                <span
                  className={cn(
                    "absolute inset-x-3 -bottom-[1px] h-[2px] origin-left scale-x-0 rounded-full bg-pine transition-transform duration-250 ease-out group-hover:scale-x-100",
                    active && "scale-x-100"
                  )}
                  aria-hidden="true"
                />
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {loggedIn ? (
            <>
              <Link
                href="/dashboard"
                className="rounded bg-ink px-4 py-2 text-sm font-medium text-white transition duration-180 hover:bg-pine active:bg-pine/90"
              >
                Dashboard
              </Link>
              <button
                type="button"
                className="hidden rounded border border-line px-3 py-2 text-sm font-medium text-ink/72 transition duration-180 hover:border-pine/40 hover:text-ink sm:inline-flex"
                onClick={signOut}
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded bg-ink px-4 py-2 text-sm font-medium text-white transition duration-180 hover:bg-pine active:bg-pine/90"
            >
              Login
            </Link>
          )}
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded border border-line text-ink transition-colors duration-180 hover:border-pine/40 hover:bg-paper md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-250 ease-out md:hidden",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <nav id="mobile-nav" className="container-page flex flex-col gap-1 border-t border-line py-3">
            {navItems.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded px-3 py-2.5 text-sm transition-colors duration-180",
                    active ? "bg-sky/60 font-semibold text-ink" : "text-ink/72 hover:bg-paper hover:text-ink"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            {loggedIn && (
              <button
                type="button"
                className="rounded px-3 py-2.5 text-left text-sm text-ink/72 transition-colors duration-180 hover:bg-paper hover:text-ink"
                onClick={signOut}
              >
                Sign out
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
