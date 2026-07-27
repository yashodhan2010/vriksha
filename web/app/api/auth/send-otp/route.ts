import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import { authOtpExpirySeconds } from "@/lib/auth-otp";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const otpRequestSchema = z.object({
  email: z.string().trim().email().max(240),
  redirectTo: z.string().trim().max(240).optional()
});

function otpTextEmail(otp: string) {
  return [
    "Your Vriksha Capital login code",
    "",
    `Code: ${otp}`,
    "",
    `Enter this code on the Vriksha Capital website within ${authOtpExpirySeconds / 60} minutes to complete login.`,
    "If you did not request this, you can ignore this email."
  ].join("\n");
}

function otpHtmlEmail(otp: string) {
  return `
    <div style="font-family: Arial, sans-serif; color: #18211f; line-height: 1.6;">
      <p>Your Vriksha Capital login code is:</p>
      <p style="font-size: 28px; font-weight: 700; letter-spacing: 6px; margin: 18px 0;">${otp}</p>
      <p>Enter this code on the Vriksha Capital website within ${authOtpExpirySeconds / 60} minutes to complete login.</p>
      <p style="color: #6f7672; font-size: 13px;">If you did not request this, you can ignore this email.</p>
    </div>
  `;
}

export async function POST(request: Request) {
  const parsed = otpRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase auth is not configured." }, { status: 500 });
  }

  const { data, error } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email: parsed.data.email,
    options: parsed.data.redirectTo ? { redirectTo: parsed.data.redirectTo } : undefined
  });

  const otp = data.properties?.email_otp;
  if (error || !otp) {
    return NextResponse.json({ error: error?.message ?? "Could not generate login code." }, { status: 500 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Vriksha email delivery is not configured." }, { status: 500 });
  }

  const resend = new Resend(apiKey);
  const from = process.env.AUTH_FROM_EMAIL
    ?? process.env.CONTACT_FROM_EMAIL
    ?? "Vriksha Capital <enquiry@vriksha-capital.com>";

  const { error: emailError } = await resend.emails.send({
    from,
    to: parsed.data.email,
    subject: "Your Vriksha Capital login code",
    text: otpTextEmail(otp),
    html: otpHtmlEmail(otp)
  });

  if (emailError) {
    return NextResponse.json({ error: emailError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
