"use client";

import { useState } from "react";
import { MailCheck } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function LoginForm({ redirectTo = "/dashboard" }: { redirectTo?: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function sendOtp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setMessage("");

    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setStatus("error");
      setMessage("Supabase is not configured yet. Add the public Supabase keys to web/.env.local.");
      return;
    }

    const origin = window.location.origin;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`
      }
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    setStatus("sent");
    setMessage("Check your email for the secure login link.");
  }

  return (
    <form className="mt-8 card p-6" onSubmit={sendOtp}>
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
      <button
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded bg-ink px-4 py-3 text-sm font-semibold text-white transition duration-180 hover:bg-pine disabled:cursor-not-allowed disabled:opacity-60"
        type="submit"
        disabled={status === "sending"}
      >
        <MailCheck size={16} aria-hidden="true" />
        {status === "sending" ? "Sending secure link" : "Send email OTP link"}
      </button>
      {message && (
        <p className={`mt-4 text-sm leading-6 ${status === "error" ? "text-clay" : "text-pine"}`}>
          {message}
        </p>
      )}
    </form>
  );
}

