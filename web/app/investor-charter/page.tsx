import { Download } from "lucide-react";
import { investorCharterItems, sebiContacts } from "@/lib/compliance";

export default function InvestorCharterPage() {
  const charterServices = investorCharterItems.filter(
    (item) => !item.startsWith("Vision:") && !item.startsWith("Mission:")
  );

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-sm uppercase tracking-[0.18em] text-clay">Investor Charter</p>
      <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Investor Charter For Research Analyst Services</h1>
          <p className="mt-4 text-sm leading-6 text-ink/68">
            This page follows Annexure A for Research Analysts: vision, mission, business
            activities, services, disclosures, grievance redressal routes, investor rights, and
            investor responsibilities.
          </p>
        </div>
        <a
          href="/disclosures/annexure-a-investor-charter.docx"
          download
          className="btn-secondary shrink-0"
        >
          <Download size={16} aria-hidden="true" />
          Download Annexure A
        </a>
      </div>
      <section className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="card-accent-pine p-6">
          <h2 className="text-xl font-semibold">Vision</h2>
          <p className="mt-3 text-sm leading-6 text-ink/70">Invest with knowledge and safety.</p>
        </div>
        <div className="card-accent-pine p-6">
          <h2 className="text-xl font-semibold">Mission</h2>
          <p className="mt-3 text-sm leading-6 text-ink/70">
            Every investor should be able to invest in suitable investment products based on their
            needs, manage and monitor them to meet their goals, access reports, and enjoy financial
            wellness.
          </p>
        </div>
      </section>
      <section className="mt-8 card-accent-pine p-6">
        <h2 className="text-xl font-semibold">Business And Services</h2>
        <ul className="mt-4 space-y-3 text-sm leading-6 text-ink/70">
          {charterServices.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>
      <section className="mt-6 card-accent-pine p-6">
        <h2 className="text-xl font-semibold">Investor Rights</h2>
        <div className="mt-4 grid gap-3 text-sm leading-6 text-ink/70 sm:grid-cols-2">
          {[
            "Right to privacy and confidentiality.",
            "Right to transparent practices and fair treatment.",
            "Right to adequate information and continuing disclosures.",
            "Right to fair and true advertisement.",
            "Right to awareness about service parameters and turnaround times.",
            "Right to be heard and receive timely grievance redressal.",
            "Right to exit in accordance with agreed terms and conditions.",
            "Right to receive caution when dealing in complex or high-risk products."
          ].map((item) => <p key={item}>{item}</p>)}
        </div>
      </section>
      <section className="mt-6 card-accent-pine p-6">
        <h2 className="text-xl font-semibold">Investor Responsibilities</h2>
        <ul className="mt-4 space-y-3 text-sm leading-6 text-ink/70">
          {[
            "Deal only with SEBI registered Research Analysts and verify the registration certificate and registration number.",
            "Review all statutory and regulatory disclosures before investing.",
            "Pay Research Analyst fees only through banking channels and maintain signed payment receipts.",
            "Ask relevant questions and clear doubts before acting on any recommendation.",
            "Evaluate suitability, risk profile, and independent judgment before investing.",
            "Do not provide funds for investment to the Research Analyst.",
            "Do not share trading, demat, bank login credentials, or passwords with the Research Analyst.",
            "Inform SEBI about any Research Analyst offering assured or guaranteed returns."
          ].map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>
      <section className="mt-6 card-accent-pine p-6 text-sm leading-6 text-ink/70">
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
