import type { Metadata } from "next";
import Link from "next/link";
import { Fraunces, Inter } from "next/font/google";
import { ShieldCheck } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { raProfile } from "@/lib/compliance";
import "./globals.css";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap"
});

const serif = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  weight: ["500", "600"]
});

export const metadata: Metadata = {
  title: "Vriksha",
  description: "SEBI RA-backed model portfolio strategy subscriptions."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body className="font-sans antialiased">
        <noscript>
          <style>{".reveal{opacity:1!important;transform:none!important;}"}</style>
        </noscript>
        <SiteHeader />
        {children}
        <footer className="border-t border-line bg-[#fffaf4]">
          <div className="container-page grid gap-10 py-10 md:grid-cols-[1.3fr_1fr]">
            <div>
              <Link href="/" className="flex w-fit items-center gap-2 font-serif text-lg font-semibold text-ink transition-opacity duration-180 hover:opacity-80">
                <span className="grid h-8 w-8 place-items-center rounded bg-pine text-white">
                  <ShieldCheck size={16} aria-hidden="true" />
                </span>
                Vriksha
              </Link>
              <p className="mt-4 max-w-md text-sm leading-6 text-ink/68">
                Vriksha publishes model portfolios and research notes under a SEBI RA framework.
                Model portfolios are research products and are not trade execution services. All
                returns shown are subject to assumptions, costs, market risk, and methodology limits.
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/52">
                Compliance &amp; disclosures
              </p>
              <nav className="mt-4 grid gap-2.5 text-sm">
                <Link href="/compliance" className="link-underline w-fit font-semibold text-pine hover:text-pine">
                  Compliance
                </Link>
                <Link href="/investor-charter" className="link-underline w-fit">Investor Charter</Link>
                <Link href="/complaints" className="link-underline w-fit">Complaints Disclosure</Link>
                <Link href="/audit-report" className="link-underline w-fit">Audit Report</Link>
              </nav>
            </div>
          </div>
          <div className="border-t border-line">
            <div className="container-page py-4 text-xs text-ink/52">
              <p>
                &copy; {new Date().getFullYear()} Vriksha Research &middot; SEBI RA Registration No.{" "}
                {raProfile.sebiRegistrationNumber}
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
