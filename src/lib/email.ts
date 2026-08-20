import "server-only";
import { Resend } from "resend";
import { formatPrice } from "@/lib/format";

export type ConfirmationEmailParams = {
  to: string;
  studentFirstName: string;
  studentLastName: string;
  className: string;
  amountCents: number;
};

// Sends the enrollment confirmation email. Best-effort: if Resend isn't
// configured or the send fails, we log and return false rather than throwing,
// so a payment is never lost just because an email couldn't be sent.
export async function sendConfirmationEmail(
  params: ConfirmationEmailParams,
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY not set — skipping confirmation email.");
    return false;
  }

  const from = process.env.EMAIL_FROM ?? "101Discoveries <onboarding@resend.dev>";
  const resend = new Resend(apiKey);

  const subject = `You're enrolled: ${params.className}`;

  try {
    const { error } = await resend.emails.send({
      from,
      to: params.to,
      subject,
      html: buildHtml(params),
    });
    if (error) {
      console.error("Resend returned an error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Failed to send confirmation email:", err);
    return false;
  }
}

function buildHtml(params: ConfirmationEmailParams): string {
  const studentName = `${params.studentFirstName} ${params.studentLastName}`;
  return `
  <div style="font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #18181b;">
    <h1 style="font-size: 20px; margin: 0 0 8px;">You're all set! 🎉</h1>
    <p style="font-size: 15px; line-height: 1.6; color: #3f3f46;">
      We've confirmed <strong>${escapeHtml(studentName)}</strong>'s enrollment and received your payment.
    </p>
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
      <tr>
        <td style="padding: 8px 0; color: #71717a;">Student</td>
        <td style="padding: 8px 0; text-align: right; font-weight: 600;">${escapeHtml(studentName)}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #71717a; border-top: 1px solid #e4e4e7;">Class</td>
        <td style="padding: 8px 0; text-align: right; font-weight: 600; border-top: 1px solid #e4e4e7;">${escapeHtml(params.className)}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #71717a; border-top: 1px solid #e4e4e7;">Amount paid</td>
        <td style="padding: 8px 0; text-align: right; font-weight: 600; border-top: 1px solid #e4e4e7;">${formatPrice(params.amountCents)}</td>
      </tr>
    </table>
    <p style="font-size: 14px; line-height: 1.6; color: #3f3f46;">
      We'll be in touch with class details before the term begins. If you have any
      questions, just reply to this email.
    </p>
    <p style="font-size: 13px; color: #a1a1aa; margin-top: 24px;">— 101Discoveries</p>
  </div>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
