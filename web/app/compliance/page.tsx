import Link from "next/link";
import {
  complaintsDisclosure,
  escalationMatrix,
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

      <section className="mt-8 rounded border border-line bg-[#fffaf4] p-6">
        <h2 className="text-xl font-semibold">Standard Warning</h2>
        <p className="mt-3 text-[13px] font-semibold leading-6 text-ink">{standardMarketRiskWarning}</p>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded border border-line bg-[#fffaf4] p-6">
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

        <div className="rounded border border-line bg-[#fffaf4] p-6">
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

      <section className="mt-6 rounded border border-line bg-[#fffaf4] p-6">
        <h2 className="text-xl font-semibold">Grievance Redressal Process</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-6 text-ink/70">
          {grievanceSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <section className="mt-6 rounded border border-line bg-[#fffaf4] p-6">
        <h2 className="text-xl font-semibold">Escalation Matrix</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-ink/54">
              <tr><th className="py-2">Level</th><th>Owner</th><th>Contact</th><th>Purpose</th></tr>
            </thead>
            <tbody>
              {escalationMatrix.map((row) => (
                <tr className="border-t border-line" key={row.level}>
                  <td className="py-3 font-semibold">{row.level}</td>
                  <td>{row.owner}</td>
                  <td>{row.contact}</td>
                  <td>{row.timeline}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded border border-line bg-[#fffaf4] p-6">
          <h2 className="text-xl font-semibold">Disclaimers</h2>
          <p className="mt-3 text-sm font-semibold leading-6 text-ink">{standardSebiDisclaimer}</p>
          <ul className="mt-4 space-y-2 text-sm leading-6 text-ink/70">
            {generalDisclosures.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
        <div className="rounded border border-line bg-[#fffaf4] p-6">
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
          <Link className="rounded border border-line bg-[#fffaf4] p-6" href={item.href} key={item.href}>
            <h2 className="text-lg font-semibold">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-ink/68">{item.text}</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
