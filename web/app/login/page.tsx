export default function LoginPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-sm uppercase tracking-[0.18em] text-clay">Account</p>
      <h1 className="mt-2 text-3xl font-semibold">Login</h1>
      <form className="mt-8 rounded border border-line bg-[#fffaf4] p-6">
        <label className="block text-sm font-medium" htmlFor="email">Email</label>
        <input className="mt-2 w-full rounded border border-line bg-white px-3 py-2" id="email" name="email" type="email" />
        <label className="mt-4 block text-sm font-medium" htmlFor="password">Password</label>
        <input className="mt-2 w-full rounded border border-line bg-white px-3 py-2" id="password" name="password" type="password" />
        <button className="mt-6 w-full rounded bg-ink px-4 py-3 text-sm font-semibold text-white" type="button">
          Supabase auth placeholder
        </button>
      </form>
    </main>
  );
}
