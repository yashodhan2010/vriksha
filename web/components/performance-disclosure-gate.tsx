"use client";

import { useEffect, useState } from "react";
import { LockKeyhole, MailCheck, UnlockKeyhole } from "lucide-react";
import { standardMarketRiskWarning, standardSebiDisclaimer } from "@/lib/compliance";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const storageKeyPrefix = "vriksha-performance-acknowledged";

export function PerformanceDisclosureGate({
  children,
  compact = false,
  className = "",
  acknowledgementKey = "default"
}: {
  children: React.ReactNode;
  compact?: boolean;
  className?: string;
  acknowledgementKey?: string;
}) {
  const [acknowledged, setAcknowledged] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "logging" | "error">("idle");
  const [message, setMessage] = useState("");
  const storageKey = `${storageKeyPrefix}:${acknowledgementKey}`;
  const strategySlug = acknowledgementKey.startsWith("strategy:")
    ? acknowledgementKey.replace("strategy:", "")
    : undefined;

  useEffect(() => {
    async function initialize() {
      const supabase = createSupabaseBrowserClient();
      if (!supabase) {
        setLoggedIn(true);
        setAcknowledged(window.sessionStorage.getItem(storageKey) === "true");
        setReady(true);
        return;
      }

      const {
        data: { user }
      } = await supabase.auth.getUser();
      setLoggedIn(Boolean(user));
      setAcknowledged(Boolean(user) && window.sessionStorage.getItem(storageKey) === "true");
      setReady(true);
    }

    initialize();
  }, [storageKey]);

  async function sendOtp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setMessage("");

    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setStatus("error");
      setMessage("Supabase is not configured yet.");
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(window.location.pathname)}`
      }
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    setStatus("sent");
    setMessage("Check your email, then return here after login.");
  }

  async function accept() {
    setStatus("logging");
    setMessage("");

    const response = await fetch("/api/performance-access", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        acknowledgementKey,
        strategySlug,
        disclaimerVersion: "v1"
      })
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setStatus("error");
      setMessage(payload?.error ?? "Could not record acknowledgement. Please try again.");
      return;
    }

    window.sessionStorage.setItem(storageKey, "true");
    setAcknowledged(true);
    setStatus("idle");
  }

  if (!ready) {
    return (
      <div className={`${className} card p-5`} aria-hidden="true">
        <div className="flex items-start gap-4">
          <div className="skeleton h-11 w-11 shrink-0" />
          <div className="flex-1 space-y-3 py-1">
            <div className="skeleton h-5 w-56" />
            <div className="skeleton h-4 w-full max-w-md" />
            <div className="skeleton h-11 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (acknowledged) {
    return <>{children}</>;
  }

  if (!loggedIn) {
    return (
      <section className={`${className} card group p-5 duration-250 hover:-translate-y-0.5 hover:border-gold/60 hover:bg-white hover:shadow-sm`}>
        <div className="flex items-start gap-4">
          <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded bg-ink text-white transition duration-250 group-hover:bg-pine">
            <LockKeyhole size={18} aria-hidden="true" />
          </span>
          <div className="w-full">
            <h2 className={compact ? "text-base font-semibold" : "text-xl font-semibold"}>
              Verify email to request performance
            </h2>
            <p className="mt-2 text-sm leading-6 text-ink/70">
              Performance details are shown only after a verified one-to-one request and explicit
              acknowledgement of the related risks and limitations.
            </p>
            <form className="mt-4 flex flex-col gap-3 sm:flex-row" onSubmit={sendOtp}>
              <input
                className="min-h-11 flex-1 rounded border border-line bg-white px-3 py-2 text-sm"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email address"
                autoComplete="email"
                required
              />
              <button
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded bg-ink px-4 py-2 text-sm font-semibold text-white transition duration-180 hover:bg-pine disabled:cursor-not-allowed disabled:opacity-60"
                type="submit"
                disabled={status === "sending"}
              >
                <MailCheck size={16} aria-hidden="true" />
                {status === "sending" ? "Sending" : "Send OTP link"}
              </button>
            </form>
            {message && (
              <p className={`mt-3 text-sm ${status === "error" ? "text-clay" : "text-pine"}`}>
                {message}
              </p>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`${className} card group p-5 duration-250 hover:-translate-y-0.5 hover:border-gold/60 hover:bg-white hover:shadow-sm`}>
      <div className="flex items-start gap-4">
        <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded bg-ink text-white transition duration-250 group-hover:bg-pine">
          <LockKeyhole
            className="absolute transition duration-250 group-hover:scale-75 group-hover:opacity-0"
            size={18}
            aria-hidden="true"
          />
          <UnlockKeyhole
            className="absolute scale-75 opacity-0 transition duration-250 group-hover:scale-100 group-hover:opacity-100"
            size={18}
            aria-hidden="true"
          />
        </span>
        <div>
          <h2 className={compact ? "text-base font-semibold" : "text-xl font-semibold"}>
            Performance details are hidden
          </h2>
          <p className="mt-2 text-sm leading-6 text-ink/70">
            Historical and backtested returns are shown only after you explicitly request to view
            them for this page and acknowledge the related risks and limitations.
          </p>
          <label className="mt-4 flex cursor-pointer items-start gap-3 rounded border border-line bg-white p-3 text-sm leading-6 text-ink/72 transition duration-250 hover:border-gold/60 hover:bg-paper">
            <input
              className="mt-1 h-4 w-4 accent-pine"
              type="checkbox"
              onChange={accept}
              disabled={status === "logging"}
            />
            <span>
              I understand that {standardMarketRiskWarning.toLowerCase()} {standardSebiDisclaimer}
              {" "}Past or backtested performance does not guarantee future returns.
            </span>
          </label>
          {message && (
            <p className={`mt-3 text-sm ${status === "error" ? "text-clay" : "text-pine"}`}>
              {message}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
