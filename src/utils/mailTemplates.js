const formatCurrency = (value) => {
  const amount = Number(value || 0);

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const normalizeStatusLabel = (status) =>
  String(status || "order_placed")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

const buildInfoRow = (label, value) => `
  <tr>
    <td style="padding: 11px 0; color: #64748b; font-size: 13px; width: 42%; border-bottom: 1px solid #e2e8f0;">${escapeHtml(label)}</td>
    <td style="padding: 11px 0; color: #0f172a; font-size: 14px; font-weight: 600; border-bottom: 1px solid #e2e8f0;">${escapeHtml(value)}</td>
  </tr>
`;

const buildPremiumMailShell = ({
  preheader,
  title,
  badge,
  greeting,
  intro,
  highlightLabel,
  highlightValue,
  detailRows,
  footerNote,
}) => `
  <!doctype html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${escapeHtml(title)}</title>
    </head>
    <body style="margin: 0; padding: 0; background: #f1f5f9;">
      <span style="display: none; opacity: 0; color: transparent; height: 0; width: 0; overflow: hidden;">${escapeHtml(preheader)}</span>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: #f1f5f9; padding: 28px 12px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 680px; background: #ffffff; border: 1px solid #dbe2ea; border-radius: 18px; overflow: hidden;">
              <tr>
                <td style="padding: 24px 28px; background: linear-gradient(125deg, #0f172a 0%, #1d4ed8 56%, #0891b2 100%); color: #ffffff;">
                  <p style="margin: 0; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; opacity: 0.9; font-family: Arial, Helvetica, sans-serif;">Car Scout Premium</p>
                  <h1 style="margin: 10px 0 6px; font-size: 30px; line-height: 1.2; font-weight: 700; font-family: Georgia, 'Times New Roman', serif;">${escapeHtml(title)}</h1>
                  <span style="display: inline-block; margin-top: 8px; font-size: 12px; background: rgba(255,255,255,0.16); border: 1px solid rgba(255,255,255,0.38); border-radius: 999px; padding: 5px 12px; font-family: Arial, Helvetica, sans-serif;">${escapeHtml(badge)}</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 26px 28px 8px; color: #0f172a; font-family: Arial, Helvetica, sans-serif;">
                  <p style="margin: 0 0 10px; font-size: 17px; font-weight: 700;">${escapeHtml(greeting)}</p>
                  <p style="margin: 0; font-size: 14px; line-height: 1.7; color: #334155;">${escapeHtml(intro)}</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 28px 0;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: separate; border-spacing: 0; border: 1px solid #dbeafe; border-radius: 14px; background: linear-gradient(180deg, #eff6ff 0%, #f8fafc 100%);">
                    <tr>
                      <td style="padding: 14px 16px; color: #1e3a8a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; font-family: Arial, Helvetica, sans-serif;">${escapeHtml(highlightLabel)}</td>
                    </tr>
                    <tr>
                      <td style="padding: 0 16px 16px; color: #0f172a; font-size: 30px; font-weight: 800; line-height: 1.2; font-family: Georgia, 'Times New Roman', serif;">${escapeHtml(highlightValue)}</td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding: 18px 28px 0;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse; background: #ffffff;">
                    ${detailRows}
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding: 20px 28px 30px; color: #334155; font-family: Arial, Helvetica, sans-serif;">
                  <p style="margin: 0; font-size: 14px; line-height: 1.7;">${escapeHtml(footerNote)}</p>
                  <p style="margin: 16px 0 0; font-size: 14px;">Regards,<br /><strong>Car Scout Team</strong></p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
`.trim();

export const buildPurchaseSuccessMailTemplate = ({
  customerName,
  customerEmail,
  orderId,
  carTitle,
  totalAmount,
  paymentMethod,
  downPayment,
  remainingAmount,
}) => {
  const safeName = customerName || "Customer";
  const safeEmail = customerEmail || "-";
  const safeOrderId = orderId || "-";
  const safeCarTitle = carTitle || "Selected Car";
  const safePaymentMethod = String(paymentMethod || "N/A").toUpperCase();

  const subject = `Purchase Confirmed: ${safeOrderId}`;

  const text = [
    `Hello ${safeName},`,
    "",
    "Your car purchase request has been confirmed successfully.",
    "",
    `Order ID: ${safeOrderId}`,
    `Email: ${safeEmail}`,
    `Car: ${safeCarTitle}`,
    `Total Amount: ${formatCurrency(totalAmount)}`,
    `Payment Method: ${safePaymentMethod}`,
    `Down Payment: ${formatCurrency(downPayment)}`,
    `Remaining Amount: ${formatCurrency(remainingAmount)}`,
    "",
    "Our team will contact you soon for the next steps.",
    "",
    "Thanks,",
    "Car Scout Team",
  ].join("\n");

  const html = `
    ${buildPremiumMailShell({
      preheader: `Purchase confirmed for ${safeCarTitle} with order ${safeOrderId}`,
      title: "Purchase Confirmation",
      badge: "Order Locked In",
      greeting: `Hello ${safeName},`,
      intro: "Your car purchase request is confirmed. Thank you for choosing Car Scout for your premium buying experience.",
      highlightLabel: "Total Amount",
      highlightValue: formatCurrency(totalAmount),
      detailRows: [
        buildInfoRow("Order ID", safeOrderId),
        buildInfoRow("Email", safeEmail),
        buildInfoRow("Car", safeCarTitle),
        buildInfoRow("Payment Method", safePaymentMethod),
        buildInfoRow("Down Payment", formatCurrency(downPayment)),
        buildInfoRow("Remaining Amount", formatCurrency(remainingAmount)),
      ].join(""),
      footerNote: "Our concierge team will contact you shortly with final verification and invoice details.",
    })}
  `.trim();

  return {
    subject,
    text,
    html,
  };
};

export const buildPurchaseStatusMailTemplate = ({
  customerName,
  customerEmail,
  orderId,
  carTitle,
  status,
  totalAmount,
}) => {
  const safeName = customerName || "Customer";
  const safeEmail = customerEmail || "-";
  const safeOrderId = orderId || "-";
  const safeCarTitle = carTitle || "Selected Car";
  const safeStatus = normalizeStatusLabel(status);

  const subject = `Purchase Status Update: ${safeOrderId}`;

  const text = [
    `Hello ${safeName},`,
    "",
    "Your purchase status has been updated.",
    "",
    `Order ID: ${safeOrderId}`,
    `Email: ${safeEmail}`,
    `Car: ${safeCarTitle}`,
    `Current Status: ${safeStatus}`,
    `Order Amount: ${formatCurrency(totalAmount)}`,
    "",
    "For support, contact Car Scout support team.",
    "",
    "Thanks,",
    "Car Scout Team",
  ].join("\n");

  const html = `
    ${buildPremiumMailShell({
      preheader: `Status updated for order ${safeOrderId}`,
      title: "Purchase Status Updated",
      badge: "Live Status Update",
      greeting: `Hello ${safeName},`,
      intro: "We have updated your purchase status. Please review the latest details below.",
      highlightLabel: "Current Status",
      highlightValue: safeStatus,
      detailRows: [
        buildInfoRow("Order ID", safeOrderId),
        buildInfoRow("Email", safeEmail),
        buildInfoRow("Car", safeCarTitle),
        buildInfoRow("Order Amount", formatCurrency(totalAmount)),
      ].join(""),
      footerNote: "If you need assistance, reply to this email and our support team will help you right away.",
    })}
  `.trim();

  return {
    subject,
    text,
    html,
  };
};
