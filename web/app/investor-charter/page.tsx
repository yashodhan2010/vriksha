import { investorCharterItems, sebiContacts } from "@/lib/compliance";

export default function InvestorCharterPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-sm uppercase tracking-[0.18em] text-clay">Investor Charter</p>
      <h1 className="mt-2 text-3xl font-semibold">Investor Charter For Research Analyst Services</h1>
      <p className="mt-4 text-sm leading-6 text-ink/68">
        This page summarizes the investor-facing charter for Research Analyst services. The final
        production version should be reviewed against the latest SEBI circular and the RA compliance
        records before launch.
      </p>
      <section className="mt-8 rounded border border-line bg-[#fffaf4] p-6">
        <h2 className="text-xl font-semibold">Investor Rights And Services</h2>
        <ul className="mt-4 space-y-3 text-sm leading-6 text-ink/70">
          {investorCharterItems.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>
      <section className="mt-6 rounded border border-line bg-[#fffaf4] p-6 text-sm leading-6 text-ink/70">
        <h2 className="text-xl font-semibold text-ink">Grievance Route</h2>
        <p className="mt-3">
          Investors should first approach the Research Analyst grievance officer. If unresolved,
          investors may use SEBI SCORES at <a className="font-medium text-pine" href={sebiContacts.scores.website}>{sebiContacts.scores.website}</a>.
          If still dissatisfied, investors may use SMART ODR at <a className="font-medium text-pine" href={sebiContacts.odr.website}>{sebiContacts.odr.website}</a>.
        </p>
      </section>
    </main>
  );
}
