import { Resend } from "resend";

type KycNotificationInput = {
  to: string;
  fullName: string;
  status: "auto_verified" | "verified" | "manual_review_required" | "needs_resubmission" | "rejected";
  note?: string | null;
};

const statusCopy: Record<KycNotificationInput["status"], { subject: string; body: string }> = {
  auto_verified: {
    subject: "Your Vriksha KYC is verified",
    body: "Your KYC has been automatically verified. You can now proceed to checkout for research subscriptions."
  },
  verified: {
    subject: "Your Vriksha KYC is verified",
    body: "Your KYC has been verified by the compliance team. You can now proceed to checkout for research subscriptions."
  },
  manual_review_required: {
    subject: "Your Vriksha KYC is under review",
    body: "Your KYC has been routed to compliance review. We will update you once the review is complete."
  },
  needs_resubmission: {
    subject: "Vriksha KYC resubmission required",
    body: "Your KYC requires resubmission. Please log in and upload clearer documents or correct the submitted details."
  },
  rejected: {
    subject: "Vriksha KYC could not be verified",
    body: "Your KYC could not be verified. Please contact support or submit KYC again with corrected details."
  }
};

export async function sendKycStatusEmail(input: KycNotificationInput) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { sent: false, reason: "RESEND_API_KEY missing" };

  const from = process.env.CONTACT_FROM_EMAIL ?? "Vriksha Capital <enquiry@vriksha-capital.com>";
  const resend = new Resend(apiKey);
  const copy = statusCopy[input.status];
  const note = input.note ? `\n\nReview note: ${input.note}` : "";
  const { error } = await resend.emails.send({
    from,
    to: input.to,
    subject: copy.subject,
    text: [`Hello ${input.fullName},`, "", copy.body, note, "", "Vriksha Capital"].join("\n")
  });

  return { sent: !error, reason: error?.message ?? null };
}

