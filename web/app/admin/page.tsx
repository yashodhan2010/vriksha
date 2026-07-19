import { isAdmin } from "@/lib/access";

const tasks = [
  "Import approved strategy package",
  "Review generated model portfolio",
  "Publish rebalance after RA approval",
  "Grant manual strategy access",
  "Audit strategy version and disclosure changes"
];

export default function AdminPage() {
  const admin = isAdmin();

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-sm uppercase tracking-[0.18em] text-clay">Admin</p>
      <h1 className="mt-2 text-3xl font-semibold">Publishing Console</h1>
      {!admin && (
        <p className="mt-4 rounded border border-line bg-[#fffaf4] p-4 text-sm text-ink/68">
          Admin access will be enforced by Supabase roles. For local demo, set DEMO_ADMIN=true.
        </p>
      )}
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {tasks.map((task) => (
          <div className="rounded border border-line bg-[#fffaf4] p-5" key={task}>
            <p className="font-semibold">{task}</p>
            <p className="mt-2 text-sm leading-6 text-ink/66">
              This is a v1 shell for the operational workflow. The database schema and strategy
              package contract are included so this can be wired to real imports next.
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
