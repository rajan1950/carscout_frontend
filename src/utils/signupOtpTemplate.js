const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const buildSignupOtpMailTemplate = ({ name, otp, expiryMinutes = 5 }) => {
  const safeName = name || "User";
  const safeOtp = String(otp || "").trim();
  const subject = "Car Scout OTP Verification";

  const text = [
    `Hello ${safeName},`,
    "",
    "Your OTP for Car Scout signup verification is:",
    safeOtp,
    "",
    `This OTP is valid for ${expiryMinutes} minutes.`,
    "If you did not request this, you can safely ignore this email.",
    "",
    "Thanks,",
    "Car Scout Team",
  ].join("\n");

  const html = `
    <!doctype html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>OTP Verification</title>
      </head>
      <body style="margin: 0; padding: 24px; background: #0b1220; color: #dbeafe; font-family: Arial, Helvetica, sans-serif;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 560px; margin: 0 auto; background: #111827; border: 1px solid #1f2937; border-radius: 14px; overflow: hidden;">
          <tr>
            <td style="padding: 22px; background: linear-gradient(90deg, #1d4ed8, #0ea5e9); color: #ffffff;">
              <h1 style="margin: 0; font-size: 22px;">Car Scout Email Verification</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 22px;">
              <p style="margin: 0 0 12px; color: #dbeafe;">Hello ${escapeHtml(safeName)},</p>
              <p style="margin: 0 0 14px; color: #cbd5e1; line-height: 1.6;">Use this OTP code to complete your signup:</p>
              <p style="margin: 0 0 18px; font-size: 34px; letter-spacing: 8px; font-weight: 700; color: #ffffff;">${escapeHtml(safeOtp)}</p>
              <p style="margin: 0 0 8px; color: #cbd5e1;">This code expires in ${escapeHtml(expiryMinutes)} minutes.</p>
              <p style="margin: 0; color: #94a3b8; font-size: 13px;">If you did not request this email, ignore it.</p>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `.trim();

  return { subject, text, html };
};
