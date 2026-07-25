"use client";

import { useState } from "react";
import { Send } from "lucide-react";

const enquiryEmail = "enquiry@vriksha-capital.com";

export function ContactMailForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const subject = encodeURIComponent(`Vriksha enquiry from ${name || "website visitor"}`);
    const body = encodeURIComponent(
      [
        `Name: ${name}`,
        `Email: ${email}`,
        "",
        "Message:",
        message
      ].join("\n")
    );

    window.location.href = `mailto:${enquiryEmail}?subject=${subject}&body=${body}`;
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
      <button className="inline-flex w-fit items-center gap-2 rounded bg-pine px-5 py-3 text-sm font-semibold text-white" type="submit">
        <Send size={16} aria-hidden="true" />
        Send message
      </button>
      <p className="text-xs leading-5 text-ink/58">
        This opens your email app and sends the message to {enquiryEmail}.
      </p>
    </form>
  );
}

