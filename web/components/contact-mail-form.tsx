"use client";

import { useState } from "react";
import { Send } from "lucide-react";

const enquiryEmail = "enquiry@vriksha-capital.com";

export function ContactMailForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [notice, setNotice] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setNotice("");

    const response = await fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name,
        email,
        phone,
        subject,
        message,
        sourcePath: window.location.pathname
      })
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setStatus("error");
      setNotice(payload?.error ?? "Could not send the message. Please email us directly.");
      return;
    }

    const payload = (await response.json()) as { emailSent?: boolean };
    setStatus("sent");
    setNotice(
      payload.emailSent
        ? "Message sent. We will get back to you soon."
        : "Message received. We will get back to you soon."
    );
    setName("");
    setEmail("");
    setPhone("");
    setSubject("");
    setMessage("");
  }

  return (
    <form className="mt-8 grid gap-4 card p-6" onSubmit={submit}>
      <label className="grid gap-2 text-sm font-medium text-ink" htmlFor="contact-name">
        Name
        <input
          className="rounded border border-line bg-white px-3 py-2 font-normal"
          id="contact-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoComplete="name"
          required
        />
      </label>
      <label className="grid gap-2 text-sm font-medium text-ink" htmlFor="contact-email">
        Email
        <input
          className="rounded border border-line bg-white px-3 py-2 font-normal"
          id="contact-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />
      </label>
      <label className="grid gap-2 text-sm font-medium text-ink" htmlFor="contact-phone">
        Phone
        <input
          className="rounded border border-line bg-white px-3 py-2 font-normal"
          id="contact-phone"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          autoComplete="tel"
        />
      </label>
      <label className="grid gap-2 text-sm font-medium text-ink" htmlFor="contact-subject">
        Subject
        <input
          className="rounded border border-line bg-white px-3 py-2 font-normal"
          id="contact-subject"
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
        />
      </label>
      <label className="grid gap-2 text-sm font-medium text-ink" htmlFor="contact-message">
        Message
        <textarea
          className="min-h-32 rounded border border-line bg-white px-3 py-2 font-normal"
          id="contact-message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          required
        />
      </label>
      <button
        className="inline-flex w-fit items-center gap-2 rounded bg-pine px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        type="submit"
        disabled={status === "sending"}
      >
        <Send size={16} aria-hidden="true" />
        {status === "sending" ? "Sending" : "Send message"}
      </button>
      {notice && (
        <p className={`text-sm leading-6 ${status === "error" ? "text-clay" : "text-pine"}`}>
          {notice}
        </p>
      )}
      <p className="text-xs leading-5 text-ink/58">
        Messages are sent to {enquiryEmail} and stored for follow-up.
      </p>
    </form>
  );
}
