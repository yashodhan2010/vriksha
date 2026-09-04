import Link from "next/link";
import { Download } from "lucide-react";
import { disclosureDocuments } from "@/lib/disclosure-documents";
import {
  complaintsDisclosure,
  generalDisclosures,
  grievanceSteps,
  raProfile,
  sebiContacts,
  standardMarketRiskWarning,
  standardSebiDisclaimer
} from "@/lib/compliance";

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <p className="flex flex-col gap-1 border-b border-line py-3 text-sm sm:flex-row sm:justify-between">
      <span className="text-ink/58">{label}</span>
      <strong className="font-medium text-ink">{value}</strong>
    </p>
  );
}

const escalationMatrixRows = [
  {
    designation: "Customer Care",
    contactPerson: "--",
    address: "--",
    contactNo: "--",
    email: "--",
    workingHours: "--"
  },
  {
    designation: "Head of Customer Care",
    contactPerson: "--",
    address: "--",
    contactNo: "--",
    email: "--",
    workingHours: "--"
  },
  {
    designation: "Compliance Officer",
    contactPerson: "Prathmesh Jaiprakash Gupta",
    address:
      "701 & 702, Floor-7, Sunset (Padmavati) CHS, Eknath Buwa Hatiskar Marg, Hatiskarwadi NR Tel Exchange, Prabhadevi, Mumbai Maharashtra, 400025",
    contactNo: "+91 9930521527",
    email: "gupta.prathmesh@yahoo.in",
    workingHours: "Mon-Fri | 09AM - 05 PM"
  },
  {
    designation: "CEO",
    contactPerson: "--",
    address: "--",
    contactNo: "--",
    email: "--",
    workingHours: "--"
  },
  {
    designation: "Principal Officer",
    contactPerson: "Prathmesh Jaiprakash Gupta",
    address:
      "701 & 702, Floor-7, Sunset (Padmavati) CHS, Eknath Buwa Hatiskar Marg, Hatiskarwadi NR Tel Exchange, Prabhadevi, Mumbai Maharashtra, 400025",
    contactNo: "+91 9930521527",
    email: "gupta.prathmesh@yahoo.in",
    workingHours: "Mon-Fri | 09AM - 05 PM"
  }
];

export default function CompliancePage() {
  const latestComplaint = complaintsDisclosure[0];

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-sm uppercase tracking-[0.18em] text-clay">Mandatory Disclosures</p>
      <h1 className="mt-2 text-3xl font-semibold">Research Analyst Compliance</h1>
      <p className="mt-4 max-w-3xl text-sm leading-6 text-ink/68">
        This page centralizes Research Analyst details, investor protection disclosures, grievance
        redressal information, SEBI contacts, complaints disclosure, disclaimers, and audit report
        access.
      </p>

      <section className="mt-8 card-accent-pine p-6">
        <h2 className="text-xl font-semibold">Standard Warning</h2>
        <p className="mt-3 text-[13px] font-semibold leading-6 text-ink">{standardMarketRiskWarning}</p>
      </section>

      <section className="mt-6 card-accent-pine p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Mandatory Disclosure Library</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-ink/68">
              The following public documents are available for download. Website disclaimers,
              required website matters, grievance process, and escalation details are displayed in
              the relevant sections below.
            </p>
          </div>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {disclosureDocuments.map((document) => (
            <article key={document.href} className="rounded border border-line bg-[#fffaf4] p-4">
              <h3 className="text-base font-semibold text-ink">{document.title}</h3>
              <p className="mt-2 text-sm leading-6 text-ink/66">{document.description}</p>
              <a
                href={document.href}
                download
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-pine underline-offset-4 hover:underline"
              >
                <Download size={15} aria-hidden="true" />
                Download
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card-accent-pine p-6">
          <h2 className="text-xl font-semibold">Research Analyst Details</h2>
          <div className="mt-4">
            <DetailRow label="Brand / Logo" value={raProfile.brandName} />
            <DetailRow label="Research Analyst(s)" value={raProfile.researchAnalysts.join(", ")} />
            <DetailRow label="SEBI Registration Number" value={raProfile.sebiRegistrationNumber} />
            <DetailRow label="Registered Office" value={raProfile.registeredOffice.address} />
            <DetailRow label="Telephone" value={raProfile.registeredOffice.telephone} />
            <DetailRow label="Email" value={raProfile.registeredOffice.email} />
          </div>
        </div>

        <div className="card-accent-pine p-6">
          <h2 className="text-xl font-semibold">Officers</h2>
          <div className="mt-4">
            <DetailRow label="Compliance Officer" value={raProfile.complianceOfficer.name} />
            <DetailRow label="Compliance Telephone" value={raProfile.complianceOfficer.telephone} />
            <DetailRow label="Compliance Email" value={raProfile.complianceOfficer.email} />
            <DetailRow label="Grievance Officer" value={raProfile.grievanceOfficer.name} />
            <DetailRow label="Grievance Telephone" value={raProfile.grievanceOfficer.telephone} />
            <DetailRow label="Grievance Email" value={raProfile.grievanceOfficer.email} />
          </div>
        </div>
      </section>

      <section className="mt-6 card-accent-pine p-6">
        <h2 className="text-xl font-semibold">Grievance Redressal / Escalation Matrix</h2>
        <p className="mt-3 text-sm leading-6 text-ink/68">
          If you have a grievance, you can reach out to our Support Team for assistance.
        </p>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-6 text-ink/70">
          {grievanceSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[1080px] text-left text-sm">
            <thead className="text-ink/54">
              <tr>
                <th className="py-2 pr-4">Details of designation</th>
                <th className="pr-4">Contact Person Name</th>
                <th className="pr-4">Address where the physical address location</th>
                <th className="pr-4">Contact No.</th>
                <th className="pr-4">Email-ID</th>
                <th>Working hours when complainant can call</th>
              </tr>
            </thead>
            <tbody>
              {escalationMatrixRows.map((row) => (
                <tr className="border-t border-line align-top" key={row.designation}>
                  <td className="py-3 pr-4 font-semibold text-ink">{row.designation}</td>
                  <td className="py-3 pr-4">{row.contactPerson}</td>
                  <td className="py-3 pr-4">{row.address}</td>
                  <td className="py-3 pr-4">{row.contactNo}</td>
                  <td className="py-3 pr-4">{row.email}</td>
                  <td className="py-3">{row.workingHours}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-5 space-y-3 text-sm leading-6 text-ink/70">
          <p>
            The abovementioned details would facilitate the complainants to approach the concerned
            RA before filing complaint to SEBI. For more details go to:{" "}
            <a className="font-medium text-pine" href="https://www.bseindia.com/markets/MarketInfo/DispNewNoticesCirculars.aspx?page=20241209-41">
              BSE notice circular
            </a>
            .
          </p>
          <p>We aim to resolve all grievances within 21 working days from the date of receipt.</p>
          <p>
            If your grievance is not resolved within this timeframe, you can escalate it to SEBI&apos;s
            SCORES Platform (SEBI Complaints Redress System).
          </p>
          <p>
            SCORES Portal:{" "}
            <a className="font-medium text-pine" href="https://scores.sebi.gov.in/">
              scores.sebi.gov.in
            </a>
            .
          </p>
          <p>
            In case you are unsatisfied with the resolution provided through our support or the
            SCORES platform, you can access the Online Dispute Resolution (ODR) Portal.
          </p>
          <p>
            ODR Portal:{" "}
            <a className="font-medium text-pine" href="https://smartodr.in/">
              smartodr.in
            </a>
            .
          </p>
        </div>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card-accent-pine p-6">
          <h2 className="text-xl font-semibold">Disclaimers</h2>
          <p className="mt-3 text-sm font-semibold leading-6 text-ink">{standardSebiDisclaimer}</p>
          <ul className="mt-4 space-y-2 text-sm leading-6 text-ink/70">
            {generalDisclosures.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
        <div className="card-accent-pine p-6">
          <h2 className="text-xl font-semibold">SEBI Office Details</h2>
          <div className="mt-4 space-y-4 text-sm leading-6 text-ink/70">
            <div>
              <h3 className="font-semibold text-ink">{sebiContacts.headOffice.name}</h3>
              <p>{sebiContacts.headOffice.address}</p>
              <p>{sebiContacts.headOffice.telephone}</p>
              <p>Investor helpline: {sebiContacts.headOffice.tollFreeInvestorHelpline}</p>
            </div>
            <div>
              <h3 className="font-semibold text-ink">Physical Complaints</h3>
              <p>{sebiContacts.physicalComplaints.name}</p>
              <p>{sebiContacts.physicalComplaints.address}</p>
            </div>
            <div>
              <h3 className="font-semibold text-ink">{sebiContacts.odr.name}</h3>
              <a className="font-medium text-pine" href={sebiContacts.odr.website}>{sebiContacts.odr.website}</a>
            </div>
            <div>
              <h3 className="font-semibold text-ink">{sebiContacts.localOffice.name}</h3>
              <p>{sebiContacts.localOffice.address}</p>
              <p>{sebiContacts.localOffice.telephone}</p>
            </div>
            <a className="font-medium text-pine" href={sebiContacts.headOffice.website}>SEBI contact page</a>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-3">
        {[
          { title: "Investor Charter", href: "/investor-charter", text: "Investor rights, services, obligations, and grievance routes." },
          { title: "Complaints Disclosure", href: "/complaints", text: `${latestComplaint.month}: ${latestComplaint.pending} pending complaint(s).` },
          { title: "Audit Report", href: "/audit-report", text: "Annual RA audit report access and publication status." }
        ].map((item) => (
          <Link className="card-interactive p-6" href={item.href} key={item.href}>
            <h2 className="text-lg font-semibold">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-ink/68">{item.text}</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
