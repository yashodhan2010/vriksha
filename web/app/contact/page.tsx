import { ContactMailForm } from "@/components/contact-mail-form";

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-sm uppercase tracking-[0.18em] text-clay">Contact</p>
      <h1 className="mt-2 text-3xl font-semibold">Research Desk</h1>
      <p className="mt-4 text-sm leading-6 text-ink/68">
        Use this page for subscriber support, institutional inquiries, compliance requests, and
        strategy onboarding.
      </p>
      <ContactMailForm />
    </main>
  );
}
