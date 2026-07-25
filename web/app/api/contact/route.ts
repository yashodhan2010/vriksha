import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const enquirySchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(240),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  subject: z.string().trim().max(160).optional().or(z.literal("")),
  message: z.string().trim().min(10).max(5000),
  sourcePath: z.string().trim().max(240).optional()
});

function textEmail(data: z.infer<typeof enquirySchema>) {
  return [
    "New enquiry from Vriksha website",
    "",
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    data.phone ? `Phone: ${data.phone}` : null,
    data.subject ? `Subject: ${data.subject}` : null,
    data.sourcePath ? `Source: ${data.sourcePath}` : null,
    "",
    "Message:",
    data.message
  ].filter(Boolean).join("\n");
}

export async function POST(request: Request) {
  const parsed = enquirySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the form and try again." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Contact storage is not configured." }, { status: 500 });
  }

  const headerStore = await headers();
  const forwardedFor = headerStore.get("x-forwarded-for");
  const ipAddress = forwardedFor?.split(",")[0]?.trim() ?? null;

  const { data: enquiry, error: insertError } = await supabase
    .from("contact_enquiries")
    .insert({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      subject: parsed.data.subject || null,
      message: parsed.data.message,
      source_path: parsed.data.sourcePath ?? null,
      user_agent: headerStore.get("user-agent"),
      ip_address: ipAddress
    })
    .select("id")
    .single();

  if (insertError || !enquiry) {
    return NextResponse.json({ error: "Could not save the enquiry." }, { status: 500 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL ?? "enquiry@vriksha-capital.com";
  const from = process.env.CONTACT_FROM_EMAIL ?? "Vriksha Capital <enquiry@vriksha-capital.com>";

  if (!apiKey) {
    return NextResponse.json({ ok: true, emailSent: false });
  }

  const resend = new Resend(apiKey);
  const subject = parsed.data.subject
    ? `Vriksha enquiry: ${parsed.data.subject}`
    : `Vriksha enquiry from ${parsed.data.name}`;

  const { error: emailError } = await resend.emails.send({
    from,
    to,
    replyTo: parsed.data.email,
    subject,
    text: textEmail(parsed.data)
  });

  await supabase
    .from("contact_enquiries")
    .update({
      email_sent_at: emailError ? null : new Date().toISOString(),
      email_error: emailError?.message ?? null
    })
    .eq("id", enquiry.id);

  if (emailError) {
    return NextResponse.json({ ok: true, emailSent: false });
  }

  return NextResponse.json({ ok: true, emailSent: true });
}

