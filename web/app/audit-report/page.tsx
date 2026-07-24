export default function AuditReportPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-sm uppercase tracking-[0.18em] text-clay">Audit</p>
      <h1 className="mt-2 text-3xl font-semibold">Research Analyst Audit Report</h1>
      <section className="mt-8 card-accent-pine p-6 text-sm leading-6 text-ink/70">
        <h2 className="text-xl font-semibold text-ink">Publication Status</h2>
        <p className="mt-3">
          Annual audit report link or upload status should be published here before production launch.
          This placeholder exists so the website has a fixed public location for audit disclosure.
        </p>
        <p className="mt-4 rounded border border-line bg-white p-4 font-medium text-ink">
          Audit report: To be uploaded after final RA compliance review.
        </p>
      </section>
    </main>
  );
}
