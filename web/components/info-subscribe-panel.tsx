"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LockKeyhole, MailCheck } from "lucide-react";

export function InfoSubscribePanel({
  loggedIn,
  className = "",
  nextPath = "/blog"
}: {
  loggedIn: boolean;
  className?: string;
  nextPath?: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "subscribing" | "error">("idle");
  const [message, setMessage] = useState("");

  async function subscribe() {
    setStatus("subscribing");
    setMessage("");

    const response = await fetch("/api/info/subscribe", { method: "POST" });
    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setStatus("error");
      setMessage(payload?.error ?? "Could not activate free blog access.");
      return;
    }

    router.refresh();
  }

  return (
    <div className={`rounded border border-pine/25 bg-pine/[0.04] p-4 sm:p-5 ${className}`}>
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded bg-pine text-white">
          <LockKeyhole size={17} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-clay">Free information subscription</p>
          <h2 className="mt-1 text-xl font-semibold">Subscribe to read blogs and information media</h2>
          <p className="mt-2 text-sm leading-6 text-ink/70">
            This free subscription unlocks Vriksha blogs, PDFs, newsletters, and educational material only.
            It does not unlock paid strategy subscriptions, model portfolios, backtest sections, or CSV exports.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-ink/64">
            <span className="rounded border border-line bg-white px-3 py-2">Blogs and notes</span>
            <span className="rounded border border-line bg-white px-3 py-2">Uploaded PDFs</span>
            <span className="rounded border border-line bg-white px-3 py-2">Newsletter-style updates</span>
          </div>
          {loggedIn ? (
            <button
              className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded bg-ink px-4 py-2 text-sm font-semibold text-white transition duration-180 hover:bg-pine disabled:cursor-not-allowed disabled:opacity-60"
              type="button"
              onClick={subscribe}
              disabled={status === "subscribing"}
            >
              <MailCheck size={16} aria-hidden="true" />
              {status === "subscribing" ? "Activating access" : "Subscribe free"}
            </button>
          ) : (
            <Link
              className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded bg-ink px-4 py-2 text-sm font-semibold text-white transition duration-180 hover:bg-pine"
              href={`/login?next=${encodeURIComponent(nextPath)}`}
            >
              <MailCheck size={16} aria-hidden="true" />
              Login with email to subscribe
            </Link>
          )}
          {message && (
            <p className={`mt-3 text-sm ${status === "error" ? "text-clay" : "text-pine"}`}>
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
