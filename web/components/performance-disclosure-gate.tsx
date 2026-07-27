"use client";

import { useEffect, useState } from "react";
import { LockKeyhole, MailCheck, UnlockKeyhole } from "lucide-react";
import { authOtpExpirySeconds, formatOtpCountdown } from "@/lib/auth-otp";
import { standardMarketRiskWarning, standardSebiDisclaimer } from "@/lib/compliance";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const storageKeyPrefix = "vriksha-performance-acknowledged";

function LockedPerformancePreview({ compact }: { compact: boolean }) {
  const barHeights = ["42%", "68%", "54%", "78%", "47%", "62%", "72%", "58%"];

  return (
    <div className="pointer-events-none select-none space-y-5 opacity-70 blur-[1.5px]" aria-hidden="true">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {["Return profile", "Drawdown", "Volatility", "Benchmark"].map((label) => (
          <div className="rounded border border-line bg-white/85 p-4" key={label}>
            <div className="h-3 w-24 rounded-full bg-ink/12" />
            <div className="mt-4 h-7 w-20 rounded bg-pine/22" />
            <div className="mt-3 h-2 w-full rounded-full bg-line" />
          </div>
        ))}
      </div>
      <div className={`grid gap-5 ${compact ? "" : "lg:grid-cols-2"}`}>
        <div className="rounded border border-line bg-white/85 p-4">
          <div className="mb-5 flex items-center justify-between">
            <div className="h-4 w-36 rounded-full bg-ink/14" />
            <div className="h-3 w-20 rounded-full bg-gold/35" />
          </div>
          <div className="relative h-52 overflow-hidden rounded bg-paper">
            <div className="absolute inset-x-4 bottom-8 top-8">
              <div className="absolute inset-x-0 top-1/4 border-t border-line" />
              <div className="absolute inset-x-0 top-1/2 border-t border-line" />
              <div className="absolute inset-x-0 top-3/4 border-t border-line" />
              <div className="absolute bottom-0 left-0 h-[36%] w-full rounded-t-[44%] border-t-4 border-pine/45" />
              <div className="absolute bottom-5 left-0 h-[50%] w-full rounded-t-[52%] border-t-4 border-clay/35" />
            </div>
          </div>
        </div>
        <div className="rounded border border-line bg-white/85 p-4">
          <div className="mb-5 flex items-center justify-between">
            <div className="h-4 w-40 rounded-full bg-ink/14" />
            <div className="h-3 w-24 rounded-full bg-pine/20" />
          </div>
          <div className="flex h-52 items-end gap-3 rounded bg-paper px-4 pb-5 pt-8">
            {barHeights.map((height, index) => (
              <div className="flex h-full flex-1 items-end gap-1.5" key={`${height}-${index}`}>
                <span className="block w-full rounded-t bg-pine/40" style={{ height }} />
                <span
                  className="block w-full rounded-t bg-clay/30"
                  style={{ height: index % 2 === 0 ? "48%" : "61%" }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

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
  const [otp, setOtp] = useState("");
  const [otpExpiresAt, setOtpExpiresAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "verifying" | "logging" | "error">("idle");
  const [message, setMessage] = useState("");
  const storageKey = `${storageKeyPrefix}:${acknowledgementKey}`;
  const strategySlug = acknowledgementKey.startsWith("strategy:")
    ? acknowledgementKey.replace("strategy:", "")
    : undefined;
  const remainingSeconds = otpExpiresAt
    ? Math.max(0, Math.ceil((otpExpiresAt - now) / 1000))
    : 0;
  const canResend = status === "sent" && otpExpiresAt !== null && remainingSeconds === 0;

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

  useEffect(() => {
    if (!otpExpiresAt || remainingSeconds === 0) return;

    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [otpExpiresAt, remainingSeconds]);

  async function sendOtp() {
    setStatus("sending");
    setMessage("");

    const response = await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        redirectTo: window.location.pathname
      })
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setStatus("error");
      setMessage(payload?.error ?? "Could not send the login code.");
      return;
    }

    setStatus("sent");
    setOtpExpiresAt(Date.now() + authOtpExpirySeconds * 1000);
    setNow(Date.now());
    setMessage("Check your email for the login code from Vriksha Capital.");
  }

  async function verifyOtp() {
    setStatus("verifying");
    setMessage("");

    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setStatus("error");
      setMessage("Supabase is not configured yet.");
      return;
    }

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "magiclink"
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    setLoggedIn(true);
    setStatus("idle");
    setMessage("");
  }

  async function handleOtpSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (status === "sent" || otp) {
      await verifyOtp();
      return;
    }

    await sendOtp();
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
      <section className={`${className} relative overflow-hidden rounded border border-line bg-paper/70 p-4 shadow-sm sm:p-5`}>
        <LockedPerformancePreview compact={compact} />
        <div className="absolute inset-0 bg-white/72 backdrop-blur-[2px]" aria-hidden="true" />
        <div className="relative mx-auto max-w-2xl rounded border border-line bg-white/92 p-5 shadow-sm transition duration-250 hover:border-gold/60">
          <div className="flex items-start gap-4">
            <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded bg-ink text-white">
              <LockKeyhole size={18} aria-hidden="true" />
            </span>
            <div className="w-full">
              <h2 className={compact ? "text-base font-semibold" : "text-xl font-semibold"}>
                Verify email to request performance
              </h2>
              <p className="mt-2 text-sm leading-6 text-ink/70">
                Unlock the performance section with return charts, benchmark comparisons, and risk
                context after a verified one-to-one request.
              </p>
              <form className="mt-4 grid gap-3" onSubmit={handleOtpSubmit}>
                <div className="flex flex-col gap-3 sm:flex-row">
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
                    disabled={status === "sending" || status === "verifying"}
                  >
                    <MailCheck size={16} aria-hidden="true" />
                    {status === "sending"
                      ? "Sending"
                      : status === "sent" || otp
                        ? status === "verifying" ? "Verifying" : "Verify code"
                        : "Send code"}
                  </button>
                </div>
                {(status === "sent" || status === "verifying" || otp) && (
                  <input
                    className="min-h-11 rounded border border-line bg-white px-3 py-2 text-center text-lg font-semibold tracking-[0.24em]"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={otp}
                    onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 8))}
                    placeholder="00000000"
                    aria-label="Login code"
                    required
                  />
                )}
                {(status === "sent" || status === "verifying" || otp) && (
                  <p className={`text-xs ${remainingSeconds > 0 ? "text-ink/58" : "text-clay"}`}>
                    {remainingSeconds > 0
                      ? `Code expires in ${formatOtpCountdown(remainingSeconds)}`
                      : "Code expired. Request a new code."}
                  </p>
                )}
              </form>
              {canResend && (
                <button
                  className="mt-3 text-sm font-medium text-pine hover:text-ink"
                  type="button"
                  onClick={sendOtp}
                >
                  Resend code
                </button>
              )}
              {message && (
                <p className={`mt-3 text-sm ${status === "error" ? "text-clay" : "text-pine"}`}>
                  {message}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`${className} relative overflow-hidden rounded border border-line bg-paper/70 p-4 shadow-sm sm:p-5`}>
      <LockedPerformancePreview compact={compact} />
      <div className="absolute inset-0 bg-white/72 backdrop-blur-[2px]" aria-hidden="true" />
      <div className="relative mx-auto max-w-2xl rounded border border-line bg-white/92 p-5 shadow-sm transition duration-250 hover:border-gold/60">
        <div className="flex items-start gap-4">
          <span className="group relative grid h-11 w-11 shrink-0 place-items-center rounded bg-ink text-white transition duration-250 hover:bg-pine">
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
              Unlock the performance section with return charts, benchmark comparisons, and risk
              context after acknowledging the related risks and limitations.
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
      </div>
    </section>
  );
}
