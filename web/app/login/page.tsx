import { LoginForm } from "@/components/login-form";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <main className="mx-auto max-w-md px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-sm uppercase tracking-[0.18em] text-clay">Account</p>
      <h1 className="mt-2 text-3xl font-semibold">Login</h1>
      <LoginForm redirectTo={next ?? "/dashboard"} />
    </main>
  );
}
