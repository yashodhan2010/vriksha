"use client";

import { useEffect, useState } from "react";
import { MailCheck } from "lucide-react";
import { authOtpExpirySeconds, formatOtpCountdown } from "@/lib/auth-otp";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function LoginForm({ redirectTo = "/dashboard" }: { redirectTo?: string }) {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpExpiresAt, setOtpExpiresAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "verifying" | "error">("idle");
  const [message, setMessage] = useState("");
  const remainingSeconds = otpExpiresAt
    ? Math.max(0, Math.ceil((otpExpiresAt - now) / 1000))
    : 0;
  const canResend = status === "sent" && otpExpiresAt !== null && remainingSeconds === 0;

  useEffect(() => {
    if (!otpExpiresAt || remainingSeconds === 0) return;

    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [otpExpiresAt, remainingSeconds]);

  async function sendOtp() {
    const response = await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        redirectTo
      })
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      throw new Error(payload?.error ?? "Could not send the login code.");
    }
  }

  async function verifyOtp() {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      throw new Error("Login is temporarily unavailable. Please try again later.");
    }

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "magiclink"
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (status === "sent" || otp) {
      setStatus("verifying");
      try {
        await verifyOtp();
        window.location.assign(redirectTo);
      } catch (error) {
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Could not verify the code.");
      }
      return;
    }

    setStatus("sending");
    try {
      await sendOtp();
      setOtpExpiresAt(Date.now() + authOtpExpirySeconds * 1000);
      setNow(Date.now());
      setStatus("sent");
      setMessage("Check your email for the login code from Vriksha Capital.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Could not send the login code.");
    }
  }

  return (
    <form className="mt-8 card p-6" onSubmit={handleSubmit}>
      <label className="block text-sm font-medium" htmlFor="email">Email</label>
      <input
        className="mt-2 w-full rounded border border-line bg-white px-3 py-2"
        id="email"
        name="email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        autoComplete="email"
        required
      />
      {(status === "sent" || status === "verifying" || otp) && (
        <div className="mt-4">
          <label className="block text-sm font-medium" htmlFor="otp">Login code</label>
          <input
            className="mt-2 w-full rounded border border-line bg-white px-3 py-2 text-center text-lg font-semibold tracking-[0.24em]"
            id="otp"
            name="otp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={otp}
            onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 8))}
            placeholder="00000000"
            required
          />
          <p className={`mt-2 text-xs ${remainingSeconds > 0 ? "text-ink/58" : "text-clay"}`}>
            {remainingSeconds > 0
              ? `Code expires in ${formatOtpCountdown(remainingSeconds)}`
              : "Code expired. Request a new code."}
          </p>
        </div>
      )}
      <button
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded bg-ink px-4 py-3 text-sm font-semibold text-white transition duration-180 hover:bg-pine disabled:cursor-not-allowed disabled:opacity-60"
        type="submit"
        disabled={status === "sending" || status === "verifying"}
      >
        <MailCheck size={16} aria-hidden="true" />
        {status === "sending"
          ? "Sending code"
          : status === "sent" || otp
            ? status === "verifying" ? "Verifying" : "Verify code"
            : "Send login code"}
      </button>
      {canResend && (
        <button
          className="mt-3 w-full text-sm font-medium text-pine hover:text-ink"
          type="button"
          onClick={async () => {
            setStatus("sending");
            setMessage("");
            try {
              await sendOtp();
              setOtpExpiresAt(Date.now() + authOtpExpirySeconds * 1000);
              setNow(Date.now());
              setStatus("sent");
              setMessage("We sent a fresh login code from Vriksha Capital.");
            } catch (error) {
              setStatus("error");
              setMessage(error instanceof Error ? error.message : "Could not resend the login code.");
            }
          }}
        >
          Resend code
        </button>
      )}
      {message && (
        <p className={`mt-4 text-sm leading-6 ${status === "error" ? "text-clay" : "text-pine"}`}>
          {message}
        </p>
      )}
    </form>
  );
}
