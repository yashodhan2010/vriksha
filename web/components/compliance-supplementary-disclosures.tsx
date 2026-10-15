import { Download } from "lucide-react";
import { complaintsDisclosure, investorCharterItems, sebiContacts } from "@/lib/compliance";

type DisclosureProps = { showDownloads?: boolean };

export function InvestorCharterContent({ showDownloads = true }: DisclosureProps) {
  const services = investorCharterItems.filter((item) => !item.startsWith("Vision:") && !item.startsWith("Mission:"));

  return (
    <section id="investor-charter" className="mt-8 scroll-mt-24">
      <p className="text-sm uppercase tracking-[0.18em] text-clay-700">Investor Charter</p>
      <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div><h2 className="text-2xl font-semibold">Investor Charter For Research Analyst Services</h2><p className="mt-4 max-w-3xl text-sm leading-6 text-ink/68">Vision, mission, services, investor rights and responsibilities for Research Analyst services.</p></div>
        {showDownloads && <a href="/disclosures/annexure-a-investor-charter.docx" download className="btn-secondary shrink-0"><Download size={16} aria-hidden="true" />Download Annexure A</a>}
      </div>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="card-accent-pine p-6"><h3 className="text-xl font-semibold">Vision</h3><p className="mt-3 text-sm leading-6 text-ink/70">Invest with knowledge and safety.</p></div>
        <div className="card-accent-pine p-6"><h3 className="text-xl font-semibold">Mission</h3><p className="mt-3 text-sm leading-6 text-ink/70">Help every investor select suitable products, monitor investments, access reports, and pursue financial wellness.</p></div>
      </div>
      <div className="mt-6 card-accent-pine p-6"><h3 className="text-xl font-semibold">Business And Services</h3><ul className="mt-4 space-y-3 text-sm leading-6 text-ink/70">{services.map((item) => <li key={item}>{item}</li>)}</ul></div>
      <div className="mt-6 card-accent-pine p-6 text-sm leading-6 text-ink/70"><h3 className="text-xl font-semibold text-ink">Grievance Route</h3><p className="mt-3">Contact the Research Analyst grievance officer first. Unresolved matters may be raised through <a className="font-medium text-pine" href={sebiContacts.scores.website}>SEBI SCORES</a>, followed by <a className="font-medium text-pine" href={sebiContacts.odr.website}>SMART ODR</a>.</p></div>
    </section>
  );
}

export function ComplaintsContent({ showDownloads = true }: DisclosureProps) {
  const latest = complaintsDisclosure[0];
  const rows = [["Directly from Investors", 0, 0, 0, 0], ["SEBI (SCORES)", 0, 0, 0, 0], ["Other Sources", 0, 0, 0, 0], ["Grand Total", 0, 0, 0, 0]];

  return (
    <section id="complaints-disclosure" className="mt-8 scroll-mt-24">
      <p className="text-sm uppercase tracking-[0.18em] text-clay-700">Complaints</p>
      <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div><h2 className="text-2xl font-semibold">Complaints And SCORES Disclosure</h2><p className="mt-4 max-w-3xl text-sm leading-6 text-ink/68">Annexure B complaint data for {latest.month}.</p></div>
        {showDownloads && <a href="/disclosures/annexure-b-complaint-data.xlsx" download className="btn-secondary shrink-0"><Download size={16} aria-hidden="true" />Download Annexure B</a>}
      </div>
      <div className="mt-6 card-accent-pine p-6"><h3 className="text-xl font-semibold">Complaint Data</h3><div className="mt-4 overflow-x-auto focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine" tabIndex={0} role="region" aria-label="Complaints data table"><table className="w-full min-w-[720px] text-left text-sm"><thead className="text-ink/54"><tr>{["Received From", "Pending Last Month", "Received", "Resolved", "Total Pending"].map((title) => <th className="py-2" key={title}>{title}</th>)}</tr></thead><tbody>{rows.map((row) => <tr className="border-t border-line" key={row[0] as string}>{row.map((cell, index) => <td className={index === 0 ? "py-3 font-semibold" : ""} key={index}>{cell}</td>)}</tr>)}</tbody></table></div><p className="mt-4 text-sm text-ink/68">SCORES portal: <a className="font-medium text-pine" href={sebiContacts.scores.website}>{sebiContacts.scores.website}</a></p></div>
    </section>
  );
}

export function AuditReportContent() {
  return <section id="audit-report" className="mt-8 scroll-mt-24"><p className="text-sm uppercase tracking-[0.18em] text-clay-700">Audit</p><div className="mt-2 card-accent-pine p-6 text-sm leading-6 text-ink/70"><h2 className="text-2xl font-semibold text-ink">Research Analyst Audit Report</h2><p className="mt-3">The annual Research Analyst audit report will be made available here when applicable and after completion of the required compliance review.</p><p className="mt-4 rounded border border-line bg-white p-4 font-medium text-ink">Audit report: Not yet published.</p></div></section>;
}
