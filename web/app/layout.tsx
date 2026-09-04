import type { Metadata } from "next";
import Link from "next/link";
import { Fraunces, Inter } from "next/font/google";
import { ArrowUpRight, Linkedin, Mail, MapPin, Phone, Sprout, X } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { raProfile, standardSebiDisclaimer } from "@/lib/compliance";
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
  description: "SEBI RA-backed model portfolio strategy subscriptions.",
  icons: {
    icon: "/emblem-cropped.png",
    shortcut: "/emblem-cropped.png",
    apple: "/emblem-cropped.png"
  }
};

const usefulLinks = [
  { href: "/", label: "Home" },
  { href: "/compliance", label: "Our Origin" },
  { href: "/strategies", label: "Our Research Models" },
  { href: "/blog", label: "Where Alpha Hides" },
  { href: "/performance", label: "Alignment" },
  { href: "/contact", label: "Contact Us" }
];

const importantLinks = [
  { href: "/compliance", label: "Terms & Conditions" },
  { href: "/compliance", label: "Privacy Policies" },
  { href: "/compliance", label: "Disclaimer" },
  { href: "/contact", label: "FAQs" }
];

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="w-fit text-sm font-medium text-white/76 transition hover:text-[#b7dddd]">
      {children}
    </Link>
  );
}

function FooterExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="w-fit text-sm font-medium text-white/76 transition hover:text-[#b7dddd]"
    >
      {children}
    </a>
  );
}

function FooterHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-white/62">{children}</h2>;
}

function ContactIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#b7dddd] text-pine">
      {children}
    </span>
  );
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body className="font-sans antialiased">
        <noscript>
          <style>{".reveal{opacity:1!important;transform:none!important;}"}</style>
        </noscript>
        <SiteHeader />
        {children}
        <footer className="bg-pine text-white">
          <div className="container-page grid gap-9 py-12 sm:py-14 lg:grid-cols-[1.45fr_0.8fr_0.9fr_1fr_1.25fr] lg:gap-12">
            <section className="max-w-sm">
              <Link href="/" className="flex w-fit items-center gap-3 transition-opacity hover:opacity-80">
                <span className="grid h-10 w-10 place-items-center rounded-sm bg-white/92 text-pine">
                  <Sprout size={25} strokeWidth={2.1} aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-base font-semibold uppercase tracking-[0.14em] text-white sm:text-lg">
                    Vriksha Capital
                  </span>
                </span>
              </Link>

              <div className="mt-7 space-y-4 text-sm font-normal leading-6 text-white/74">
                <p>
                  SEBI Registered Research Analyst having Registration No. -{" "}
                  {raProfile.sebiRegistrationNumber}
                </p>
                <p>
                  Compliance officer - {raProfile.complianceOfficer.name},{" "}
                  <a href={`tel:${raProfile.complianceOfficer.telephone.replace(/\s/g, "")}`} className="text-[#b7dddd] underline underline-offset-4">
                    {raProfile.complianceOfficer.telephone}
                  </a>
                  ,{" "}
                  <a href={`mailto:${raProfile.complianceOfficer.email}`} className="text-[#b7dddd] underline underline-offset-4">
                    {raProfile.complianceOfficer.email}
                  </a>
                </p>
                <p>
                  Grievance Redressal - {raProfile.brandName} Research Analysts,{" "}
                  <a href={`mailto:${raProfile.grievanceOfficer.email}`} className="text-[#b7dddd] underline underline-offset-4">
                    {raProfile.grievanceOfficer.email}
                  </a>
                  , {raProfile.grievanceOfficer.telephone}
                </p>
                <p>&ldquo;{standardSebiDisclaimer}&rdquo;</p>
              </div>

              <Link
                href="/contact"
                className="mt-8 inline-flex h-12 min-w-64 items-center justify-between rounded-full border border-white/45 bg-pine px-6 text-sm font-semibold text-white/88 shadow-[inset_-56px_0_0_rgba(0,0,0,0.07)] transition hover:border-[#b7dddd] hover:text-[#b7dddd]"
              >
                <span>Book an appointment</span>
                <ArrowUpRight size={19} aria-hidden="true" />
              </Link>
            </section>

            <section>
              <FooterHeading>Useful Link</FooterHeading>
              <nav className="mt-7 grid gap-3.5">
                {usefulLinks.map((link) => (
                  <FooterLink key={link.label} href={link.href}>
                    {link.label}
                  </FooterLink>
                ))}
              </nav>
            </section>

            <section>
              <FooterHeading>Important Info</FooterHeading>
              <nav className="mt-7 grid gap-3.5">
                {importantLinks.map((link) => (
                  <FooterLink key={link.label} href={link.href}>
                    {link.label}
                  </FooterLink>
                ))}
              </nav>
            </section>

            <section>
              <FooterHeading>Regulatory Disclosures</FooterHeading>
              <nav className="mt-7 grid gap-3.5">
                <FooterLink href="/compliance">Mandatory Disclosures</FooterLink>
                <FooterLink href="/complaints">Grievance Redressal</FooterLink>
                <FooterLink href="/investor-charter">Investor Charter</FooterLink>
                <FooterLink href="/audit-report">Annual Audit Report</FooterLink>
                <FooterExternalLink href="/registration-certificate.pdf">Registration Certificate</FooterExternalLink>
                <FooterExternalLink href="/gst-certificate.pdf">GST Certificate</FooterExternalLink>
              </nav>
            </section>

            <section>
              <FooterHeading>Get In Touch</FooterHeading>
              <div className="mt-7 grid gap-5 text-sm font-medium leading-6 text-white/78">
                <a href={`tel:${raProfile.registeredOffice.telephone.replace(/\s/g, "")}`} className="flex items-center gap-4 hover:text-[#b7dddd]">
                  <ContactIcon>
                    <Phone size={21} strokeWidth={2.2} aria-hidden="true" />
                  </ContactIcon>
                  <span>{raProfile.registeredOffice.telephone}</span>
                </a>
                <a href={`mailto:${raProfile.registeredOffice.email}`} className="flex items-center gap-4 hover:text-[#b7dddd]">
                  <ContactIcon>
                    <Mail size={21} strokeWidth={2.1} aria-hidden="true" />
                  </ContactIcon>
                  <span className="break-all">{raProfile.registeredOffice.email}</span>
                </a>
                <div className="flex items-start gap-4">
                  <ContactIcon>
                    <MapPin size={21} strokeWidth={2.2} aria-hidden="true" />
                  </ContactIcon>
                  <address className="not-italic">{raProfile.registeredOffice.address}</address>
                </div>
              </div>

              <div className="mt-8 flex items-center gap-3">
                <Link href="/contact" aria-label="Vriksha on X" className="grid h-8 w-8 place-items-center rounded-full bg-[#b7dddd] text-pine transition hover:bg-white">
                  <X size={16} aria-hidden="true" />
                </Link>
                <Link href="/contact" aria-label="Vriksha on LinkedIn" className="grid h-8 w-8 place-items-center rounded-full bg-[#b7dddd] text-pine transition hover:bg-white">
                  <Linkedin size={16} aria-hidden="true" />
                </Link>
              </div>
            </section>
          </div>

          <div className="border-t border-white/10">
            <div className="container-page py-4 text-xs font-semibold text-white/55">
              <p>
                &copy; {new Date().getFullYear()} {raProfile.brandName} Research &middot; SEBI RA Registration No.{" "}
                {raProfile.sebiRegistrationNumber}
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
