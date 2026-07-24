export default function ContactPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-sm uppercase tracking-[0.18em] text-clay">Contact</p>
      <h1 className="mt-2 text-3xl font-semibold">Research Desk</h1>
      <p className="mt-4 text-sm leading-6 text-ink/68">
        Use this page for subscriber support, institutional inquiries, compliance requests, and
        strategy onboarding.
      </p>
      <form className="mt-8 grid gap-4 card p-6">
        <input className="rounded border border-line bg-white px-3 py-2" placeholder="Name" />
        <input className="rounded border border-line bg-white px-3 py-2" placeholder="Email" />
        <textarea className="min-h-32 rounded border border-line bg-white px-3 py-2" placeholder="Message" />
        <button className="w-fit rounded bg-pine px-5 py-3 text-sm font-semibold text-white" type="button">
          Send message
        </button>
      </form>
    </main>
  );
}
