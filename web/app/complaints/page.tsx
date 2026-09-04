import { Download } from "lucide-react";
import { complaintsDisclosure, sebiContacts } from "@/lib/compliance";

export default function ComplaintsPage() {
  const latest = complaintsDisclosure[0];

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-sm uppercase tracking-[0.18em] text-clay">Complaints</p>
      <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Complaints And SCORES Disclosure</h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-ink/68">
            Complaint data is displayed in the Annexure B format for Research Analysts and is to be
            made available by the 7th of the succeeding month.
          </p>
        </div>
        <a
          href="/disclosures/annexure-b-complaint-data.xlsx"
          download
          className="btn-secondary shrink-0"
        >
          <Download size={16} aria-hidden="true" />
          Download Annexure B
        </a>
      </div>
      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="card-accent-pine p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/52">Organisation</p>
          <p className="mt-2 text-sm font-semibold text-ink">Prathmesh Jaiprakash Gupta</p>
        </div>
        <div className="card-accent-pine p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/52">Status</p>
          <p className="mt-2 text-sm font-semibold text-ink">SEBI registered Individual Research Analyst</p>
        </div>
        <div className="card-accent-pine p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/52">Period</p>
          <p className="mt-2 text-sm font-semibold text-ink">{latest.month}</p>
        </div>
      </section>
      <section className="mt-8 card-accent-pine p-6">
        <h2 className="text-xl font-semibold">Complaint Data</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="text-ink/54">
              <tr>
                <th className="py-2">Received From</th>
                <th>Pending At End Of Last Month</th>
                <th>Received</th>
                <th>Resolved</th>
                <th>Total Pending</th>
                <th>Pending &gt; 3 Months</th>
                <th>Average Resolution Time</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Directly from Investors", "0", "0", "0", "0", "0", "-"],
                ["SEBI (SCORES)", "0", "0", "0", "0", "0", "-"],
                ["Other Sources", "0", "0", "0", "0", "0", "-"],
                ["Grand Total", "0", "0", "0", "0", "0", "-"]
              ].map((row) => (
                <tr className="border-t border-line" key={row[0]}>
                  {row.map((cell, index) => (
                    <td className={index === 0 ? "py-3 font-semibold" : ""} key={`${row[0]}-${cell}-${index}`}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-sm text-ink/68">
          SCORES portal: <a className="font-medium text-pine" href={sebiContacts.scores.website}>{sebiContacts.scores.website}</a>
        </p>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card-accent-pine p-6">
          <h2 className="text-xl font-semibold">Trend Of Monthly Disposal</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-ink/54">
                <tr><th className="py-2">Month</th><th>Carried Forward</th><th>Received</th><th>Resolved</th><th>Pending</th></tr>
              </thead>
              <tbody>
                <tr className="border-t border-line">
                  <td className="py-3 font-semibold">{latest.month}</td><td>0</td><td>0</td><td>0</td><td>0</td>
                </tr>
                <tr className="border-t border-line">
                  <td className="py-3 font-semibold">Grand Total</td><td>0</td><td>0</td><td>0</td><td>0</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="card-accent-pine p-6">
          <h2 className="text-xl font-semibold">Trend Of Annual Disposal</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-ink/54">
                <tr><th className="py-2">Year</th><th>Carried Forward</th><th>Received</th><th>Resolved</th><th>Pending</th></tr>
              </thead>
              <tbody>
                <tr className="border-t border-line">
                  <td className="py-3 font-semibold">2026</td><td>0</td><td>0</td><td>0</td><td>0</td>
                </tr>
                <tr className="border-t border-line">
                  <td className="py-3 font-semibold">Grand Total</td><td>0</td><td>0</td><td>0</td><td>0</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
