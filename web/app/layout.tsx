import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { standardMarketRiskWarning } from "@/lib/compliance";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vriksha",
  description: "SEBI RA-backed model portfolio strategy subscriptions."
};

const navItems: Array<{ href: Route; label: string }> = [
  { href: "/strategies", label: "Strategies" },
  { href: "/performance", label: "Performance" },
  { href: "/compliance", label: "Compliance" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/contact", label: "Contact" }
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <div className="bg-ink px-4 py-2 text-center text-[13px] font-medium leading-5 text-white">
          {standardMarketRiskWarning}
        </div>
        <header className="sticky top-0 z-30 border-b border-line bg-paper/92 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <span className="grid h-9 w-9 place-items-center rounded bg-pine text-white">
                <ShieldCheck size={18} aria-hidden="true" />
              </span>
              <span>Vriksha</span>
            </Link>
            <nav className="hidden items-center gap-6 text-sm text-ink/72 md:flex">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className="hover:text-ink">
                  {item.label}
                </Link>
              ))}
            </nav>
            <Link
              href="/login"
              className="rounded bg-ink px-4 py-2 text-sm font-medium text-white"
            >
              Login
            </Link>
          </div>
        </header>
        {children}
        <footer className="border-t border-line bg-[#fffaf4]">
          <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 text-sm text-ink/68 sm:px-6 md:grid-cols-4 lg:px-8">
            <p>Vriksha publishes model portfolios and research notes under a SEBI RA framework.</p>
            <p>Model portfolios are research products. They are not trade execution services.</p>
            <p>All returns shown are subject to assumptions, costs, market risk, and methodology limits.</p>
            <nav className="grid gap-2">
              <Link href="/compliance" className="font-medium text-ink">Compliance</Link>
              <Link href="/investor-charter">Investor Charter</Link>
              <Link href="/complaints">Complaints Disclosure</Link>
              <Link href="/audit-report">Audit Report</Link>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
