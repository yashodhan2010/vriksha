import { complaintsDisclosure, sebiContacts } from "@/lib/compliance";

export default function ComplaintsPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-sm uppercase tracking-[0.18em] text-clay">Complaints</p>
      <h1 className="mt-2 text-3xl font-semibold">Complaints And SCORES Disclosure</h1>
      <p className="mt-4 max-w-3xl text-sm leading-6 text-ink/68">
        Research Analyst complaint information is to be made available by the 7th of the succeeding
        month. This table should be updated monthly before production publication.
      </p>
      <section className="mt-8 card-accent-pine p-6">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="text-ink/54">
              <tr>
                <th className="py-2">Month</th>
                <th>Received</th>
                <th>Resolved</th>
                <th>Pending</th>
                <th>SCORES Received</th>
                <th>SCORES Resolved</th>
                <th>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {complaintsDisclosure.map((row) => (
                <tr className="border-t border-line" key={row.month}>
                  <td className="py-3 font-semibold">{row.month}</td>
                  <td>{row.received}</td>
                  <td>{row.resolved}</td>
                  <td>{row.pending}</td>
                  <td>{row.scoresReceived}</td>
                  <td>{row.scoresResolved}</td>
                  <td>{row.lastUpdated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-sm text-ink/68">
          SCORES portal: <a className="font-medium text-pine" href={sebiContacts.scores.website}>{sebiContacts.scores.website}</a>
        </p>
      </section>
    </main>
  );
}
