import { DashboardEventTracker } from "@/components/dashboard-analytics";
import {
  DashboardBackLink,
  DashboardLoginRequired,
  DashboardShell
} from "@/components/dashboard-workspace";
import { formatCurrencyFromPaise, formatDashboardDate, getDashboardData } from "@/lib/dashboard";

export default async function DashboardAccountPage() {
  const data = await getDashboardData();
  if (!data.user) return <DashboardLoginRequired />;

  return (
    <DashboardShell active="/dashboard/account" data={data} eyebrow="Account" title="Subscription & Access">
      <DashboardEventTracker event="subscription_details_opened" properties={{ source: "dashboard_account" }} />
      <div className="space-y-6">
        <DashboardBackLink />
        <section className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
          <div className="card p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">Subscriptions</p>
            <h2 className="mt-2 text-2xl font-semibold">Paid strategy access</h2>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="text-xs uppercase tracking-[0.14em] text-ink/44">
                  <tr>
                    <th className="py-2 font-medium">Strategy</th>
                    <th className="font-medium">Status</th>
                    <th className="font-medium">Source</th>
                    <th className="font-medium">Start</th>
                    <th className="font-medium">End</th>
                  </tr>
                </thead>
                <tbody>
                  {data.subscriptions.map((subscription) => (
                    <tr className="border-t border-line" key={`${subscription.strategy_slug}-${subscription.starts_at}`}>
                      <td className="py-3 font-semibold text-pine">{subscription.strategy_slug}</td>
                      <td>{subscription.status.replaceAll("_", " ")}</td>
                      <td>{subscription.source ?? "subscription"}</td>
                      <td>{formatDashboardDate(subscription.starts_at)}</td>
                      <td>{formatDashboardDate(subscription.ends_at) || "Open-ended"}</td>
                    </tr>
                  ))}
                  {data.subscriptions.length === 0 && (
                    <tr className="border-t border-line">
                      <td className="py-4 text-ink/64" colSpan={5}>
                        No paid subscription rows are visible for this account.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="card p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">Compliance profile</p>
            <h2 className="mt-2 text-2xl font-semibold">Account status</h2>
            <div className="mt-5 space-y-3 text-sm">
              <AccountLine label="Email" value={data.email} />
              <AccountLine label="Role" value={data.profileRole} />
              <AccountLine label="KYC status" value={data.kycStatus?.replaceAll("_", " ") ?? "not started"} />
              {data.kycVerifiedAt && <AccountLine label="KYC verified" value={formatDashboardDate(data.kycVerifiedAt)} />}
              {data.nearestRenewal && <AccountLine label="Nearest renewal" value={formatDashboardDate(data.nearestRenewal)} />}
            </div>
          </div>
        </section>
        <section className="grid gap-4 lg:grid-cols-2">
          <div className="card p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">Manual access grants</p>
            <div className="mt-4 space-y-3">
              {data.grants.map((grant) => (
                <div className="rounded border border-line bg-white p-4 text-sm" key={`${grant.strategy_slug}-${grant.starts_at}`}>
                  <p className="font-semibold text-pine">{grant.strategy_slug}</p>
                  <p className="mt-1 text-ink/64">
                    {formatDashboardDate(grant.starts_at)} to {formatDashboardDate(grant.ends_at) || "open-ended"}
                  </p>
                  {grant.reason && <p className="mt-1 text-ink/54">{grant.reason}</p>}
                </div>
              ))}
              {data.grants.length === 0 && <p className="text-sm text-ink/64">No active manual grants are visible.</p>}
            </div>
          </div>
          <div className="card p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">Payments</p>
            <div className="mt-4 space-y-3">
              {data.payments.map((payment) => (
                <div className="rounded border border-line bg-white p-4 text-sm" key={`${payment.provider}-${payment.created_at}-${payment.strategy_slug}`}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-pine">{payment.strategy_slug ?? "Strategy subscription"}</p>
                    <p className="font-semibold">{formatCurrencyFromPaise(payment.amount_in_paise, payment.currency ?? "INR")}</p>
                  </div>
                  <p className="mt-1 text-ink/64">
                    {payment.status} · {payment.provider ?? "provider"} · {formatDashboardDate(payment.created_at)}
                  </p>
                </div>
              ))}
              {data.payments.length === 0 && <p className="text-sm text-ink/64">No payment rows are visible for this account.</p>}
            </div>
          </div>
        </section>
        <section className="rounded border border-gold/35 bg-gold/10 p-4">
          <p className="text-sm leading-6 text-ink/72">
            Vriksha publishes research-led model portfolios. Subscription access does not mean Vriksha
            holds securities, manages your funds, places orders, or tracks your realised returns.
          </p>
        </section>
      </div>
    </DashboardShell>
  );
}

function AccountLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded border border-line bg-white p-3">
      <span className="text-ink/54">{label}</span>
      <span className="font-semibold text-ink">{value}</span>
    </div>
  );
}
