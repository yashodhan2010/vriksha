"use client";

import { useEffect, useState } from "react";
import { LockKeyhole, MailCheck, UnlockKeyhole } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { authOtpExpirySeconds, formatOtpCountdown } from "@/lib/auth-otp";
import { standardMarketRiskWarning, standardSebiDisclaimer } from "@/lib/compliance";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const storageKeyPrefix = "vriksha-performance-acknowledged";

function LockedPerformancePreview({ compact }: { compact: boolean }) {
  const barHeights = ["42%", "68%", "54%", "78%", "47%", "62%", "72%", "58%"];

  return (
    <div className="pointer-events-none select-none space-y-5 opacity-80" aria-hidden="true">
      <div className={`grid gap-3 ${compact ? "grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-4"}`}>
        {["CAGR", "1Y return", "5Y return", "Max return"].map((label) => (
          <div className="rounded border border-line bg-white/85 p-4" key={label}>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink/48">{label}</span>
              <LockKeyhole size={12} className="text-pine" />
            </div>
            <div className="mt-4 h-7 w-24 rounded bg-pine/18" />
            <div className="mt-3 h-2 w-full rounded-full bg-line/80" />
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

function LockedGateShell({
  children,
  className,
  compact
}: {
  children: React.ReactNode;
  className: string;
  compact: boolean;
}) {
  return (
    <section className={`${className} overflow-hidden rounded border border-pine/25 bg-pine/[0.04] shadow-sm ${compact ? "p-3" : "p-4 sm:p-5"}`}>
      <div className={`rounded border border-line bg-white/95 shadow-sm ${compact ? "p-4" : "p-5"}`}>
        {children}
      </div>
      {!compact && (
        <div className="relative mt-5 overflow-hidden rounded border border-line bg-white/55 p-4">
          <LockedPerformancePreview compact={compact} />
          <div className="absolute inset-0 bg-white/52 backdrop-blur-[2px]" aria-hidden="true" />
        </div>
      )}
    </section>
  );
}

function LockedMetricTile({ label }: { label: string }) {
  return (
    <div className="rounded border border-pine/20 bg-white p-3 shadow-xs">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink/52">{label}</span>
        <span className="grid h-6 w-6 place-items-center rounded bg-pine text-white">
          <LockKeyhole size={13} aria-hidden="true" />
        </span>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <span className="h-7 w-16 rounded bg-pine/14" />
        <span className="h-2 flex-1 rounded-full bg-line" />
      </div>
    </div>
  );
}

function LockedValueSummary({ compact }: { compact: boolean }) {
  return (
    <div className="mt-4 overflow-hidden rounded border border-pine/25 bg-pine/[0.04]">
      <div className="border-b border-pine/15 bg-pine px-4 py-3 text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/72">Backtest results preview</p>
        <p className="mt-1 text-sm font-semibold">Returns, CAGR, benchmark comparison and risk context are locked.</p>
      </div>
      <div className="p-3">
        <div className={`grid gap-2 ${compact ? "grid-cols-2" : "sm:grid-cols-4"}`}>
          {["CAGR", "Max drawdown", "Volatility", "Sharpe / Sortino"].map((label) => (
            <LockedMetricTile label={label} key={label} />
          ))}
        </div>
        <div className={`mt-3 grid gap-3 ${compact ? "" : "lg:grid-cols-[1.15fr_0.85fr]"}`}>
          <div className="relative h-24 overflow-hidden rounded border border-line bg-white">
            <div className="absolute inset-x-4 top-1/2 border-t border-line" />
            <div className="absolute bottom-7 left-4 right-4 h-10 rounded-t-[70%] border-t-[3px] border-pine/70" />
            <div className="absolute bottom-4 left-4 right-4 h-8 rounded-t-[70%] border-t-[3px] border-clay/55" />
            <div className="absolute inset-0 grid place-items-center bg-white/30">
              <span className="inline-flex items-center gap-2 rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-white">
                <LockKeyhole size={13} aria-hidden="true" />
                Strategy vs benchmark growth
              </span>
            </div>
          </div>
          <div className="grid gap-2 text-xs font-medium text-ink/64">
            <span className="rounded border border-line bg-white px-3 py-2">Backtest period and assumptions</span>
            <span className="rounded border border-line bg-white px-3 py-2">Monthly backtest returns heatmap</span>
            <span className="rounded border border-line bg-white px-3 py-2">Drawdown and limitation context</span>
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
  acknowledgementKey = "default",
  analyticsStrategySlug,
  analyticsStrategyFamily,
  unlockFocusId = "backtest"
}: {
  children: React.ReactNode;
  compact?: boolean;
  className?: string;
  acknowledgementKey?: string;
  analyticsStrategySlug?: string;
  analyticsStrategyFamily?: string;
  unlockFocusId?: string;
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
  const canResend =
    Boolean(email.trim()) &&
    status !== "sending" &&
    status !== "verifying" &&
    (status === "error" || (otpExpiresAt !== null && remainingSeconds === 0));

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
    if (!ready || !acknowledged) return;
    trackEvent("backtest_viewed", {
      strategySlug: analyticsStrategySlug ?? strategySlug,
      strategyFamily: analyticsStrategyFamily
    });
  }, [acknowledged, analyticsStrategyFamily, analyticsStrategySlug, ready, strategySlug]);

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
      return false;
    }

    setStatus("sent");
    setOtpExpiresAt(Date.now() + authOtpExpirySeconds * 1000);
    setNow(Date.now());
    setMessage("Check your email for the login code from Vriksha Capital.");
    return true;
  }

  async function resendOtp() {
    setOtp("");
    const sent = await sendOtp();
    if (sent) {
      setMessage("We sent a fresh login code from Vriksha Capital.");
    }
  }

  async function verifyOtp() {
    setStatus("verifying");
    setMessage("");

    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setStatus("error");
      setMessage("Login is temporarily unavailable. Please try again later.");
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
    trackEvent("backtest_acknowledgement_started", {
      strategySlug: analyticsStrategySlug ?? strategySlug,
      strategyFamily: analyticsStrategyFamily
    });

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
    trackEvent("backtest_acknowledgement_completed", {
      strategySlug: analyticsStrategySlug ?? strategySlug,
      strategyFamily: analyticsStrategyFamily
    });
    window.setTimeout(() => {
      const target = document.getElementById(unlockFocusId);
      target?.setAttribute("tabindex", "-1");
      target?.focus({ preventScroll: true });
      target?.scrollIntoView({
        block: "start",
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
      });
    }, 50);
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
      <LockedGateShell className={className} compact={compact}>
        <div className={`flex items-start gap-4 ${compact ? "flex-col" : ""}`}>
          <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded bg-ink text-white">
            <LockKeyhole size={18} aria-hidden="true" />
          </span>
          <div className="w-full min-w-0">
            <h2 className={compact ? "text-base font-semibold" : "text-xl font-semibold"}>
              How has this strategy behaved historically?
            </h2>
            <p className="mt-2 text-sm leading-6 text-ink/70">
              Review simulated portfolio growth, benchmark comparison, drawdowns and risk-adjusted performance.
              Historical results are hypothetical and subject to the assumptions and limitations described below.
            </p>
            <LockedValueSummary compact={compact} />
            <form className="mt-4 grid gap-3" onSubmit={handleOtpSubmit}>
              <div className={`flex flex-col gap-3 ${compact ? "" : "sm:flex-row"}`}>
                <input
                  className="min-h-11 min-w-0 flex-1 rounded border border-line bg-white px-3 py-2 text-sm"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Email address"
                  autoComplete="email"
                  required
                />
                <button
                  className={`inline-flex min-h-11 items-center justify-center gap-2 rounded bg-ink px-4 py-2 text-sm font-semibold text-white transition duration-180 hover:bg-pine disabled:cursor-not-allowed disabled:opacity-60 ${compact ? "w-full" : ""}`}
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
                onClick={resendOtp}
              >
                {status === "error" ? "Send a fresh code" : "Resend code"}
              </button>
            )}
            {message && (
              <p className={`mt-3 text-sm ${status === "error" ? "text-clay" : "text-pine"}`}>
                {message}
              </p>
            )}
          </div>
        </div>
      </LockedGateShell>
    );
  }

  return (
    <LockedGateShell className={className} compact={compact}>
      <div className={`flex items-start gap-4 ${compact ? "flex-col" : ""}`}>
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
        <div className="min-w-0">
          <h2 className={compact ? "text-base font-semibold" : "text-xl font-semibold"}>
            How has this strategy behaved historically?
          </h2>
          <p className="mt-2 text-sm leading-6 text-ink/70">
            Review simulated portfolio growth, benchmark comparison, drawdowns and risk-adjusted performance.
            Historical results are hypothetical and subject to the assumptions and limitations described below.
          </p>
          <LockedValueSummary compact={compact} />
          <div className="mt-4 rounded border border-line bg-white p-3 text-sm leading-6 text-ink/72">
            <p>
              I understand that {standardMarketRiskWarning.toLowerCase()} {standardSebiDisclaimer}
              {" "}Past or backtested performance does not guarantee future returns.
            </p>
            <button
              className="mt-3 inline-flex min-h-11 items-center justify-center rounded bg-pine px-4 py-3 text-sm font-semibold text-white transition duration-180 hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60"
              type="button"
              onClick={accept}
              disabled={status === "logging"}
            >
              {status === "logging" ? "Recording acknowledgement" : "Acknowledge risks and view backtest"}
            </button>
          </div>
          {message && (
            <p className={`mt-3 text-sm ${status === "error" ? "text-clay" : "text-pine"}`}>
              {message}
            </p>
          )}
        </div>
      </div>
    </LockedGateShell>
  );
}
