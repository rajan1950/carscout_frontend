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

const normalizePaymentMethod = (method) => {
  const raw = String(method || "").toLowerCase();

  if (raw === "emi") {
    return "EMI Plan";
  }
  if (raw === "loan") {
    return "Bank Loan";
  }
  if (raw === "full") {
    return "Full Payment";
  }

  return String(method || "N/A").toUpperCase();
};

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

const buildInfoRow = (label, value) => `
  <tr>
    <td style="padding: 10px 0; color: #8ea0bc !important; font-size: 13px; width: 42%; border-bottom: 1px solid #243248;">${escapeHtml(label)}</td>
    <td style="padding: 10px 0; color: #eaf1ff !important; font-size: 14px; font-weight: 700; border-bottom: 1px solid #243248;">${escapeHtml(value)}</td>
  </tr>
`;

const buildStepRow = (title, description) => `
  <tr>
    <td style="padding: 0 0 10px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" bgcolor="#111c2f" style="background: #111c2f; border: 1px solid #253751; border-radius: 10px;">
        <tr>
          <td style="padding: 10px 12px; font-family: Arial, Helvetica, sans-serif;">
            <p style="margin: 0; color: #d7e7ff !important; font-size: 13px; font-weight: 700;">${escapeHtml(title)}</p>
            <p style="margin: 5px 0 0; color: #a7bbd8 !important; font-size: 12px; line-height: 1.5;">${escapeHtml(description)}</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
`;

const buildPremiumMailShell = ({
  preheader,
  title,
  greeting,
  intro,
  orderId,
  carTitle,
  amount,
  statusBadge,
  paymentLabel,
  detailRows,
  nextStepsRows,
  footerNote,
}) => `
  <!doctype html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="color-scheme" content="light" />
      <meta name="supported-color-schemes" content="light" />
      <title>${escapeHtml(title)}</title>
    </head>
    <body style="margin: 0; padding: 0; background: #07101d;">
      <span style="display: none !important; mso-hide: all; font-size: 1px; line-height: 1px; max-height: 0; max-width: 0; opacity: 0; overflow: hidden; color: transparent; visibility: hidden;">${escapeHtml(preheader)}</span>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" bgcolor="#07101d" style="background: #07101d; padding: 28px 12px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" bgcolor="#0e1829" style="max-width: 700px; background: #0e1829; border: 1px solid #213149; border-radius: 18px; overflow: hidden;">
              <tr>
                <td bgcolor="#0f766e" style="padding: 22px 26px; background: linear-gradient(120deg, #0f766e 0%, #0f766e 35%, #0891b2 100%); color: #ffffff !important; font-family: Arial, Helvetica, sans-serif;">
                  <p style="margin: 0; color: #d5ffff !important; font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase;">Car Scout Purchase Desk</p>
                  <h1 style="margin: 9px 0 0; color: #ffffff !important; font-size: 30px; line-height: 1.2; font-family: Georgia, 'Times New Roman', serif;">${escapeHtml(title)}</h1>
                </td>
              </tr>

              <tr>
                <td bgcolor="#0e1829" style="padding: 16px 26px 0; background: #0e1829;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" bgcolor="#10233c" style="background: #10233c; border: 1px solid #274060; border-radius: 12px;">
                    <tr>
                      <td style="padding: 12px 14px; font-family: Arial, Helvetica, sans-serif;">
                        <p style="margin: 0; color: #b8d5ff !important; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em;">Order Snapshot</p>
                        <p style="margin: 7px 0 0; color: #f8fbff !important; font-size: 14px; font-weight: 700;">${escapeHtml(orderId)}</p>
                        <p style="margin: 4px 0 0; color: #d2e6ff !important; font-size: 13px;">${escapeHtml(carTitle)}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <tr>
                <td style="padding: 12px 26px 0; font-family: Arial, Helvetica, sans-serif;">
                  <p style="margin: 0; color: #f2f7ff !important; font-size: 17px; font-weight: 700;">${escapeHtml(greeting)}</p>
                  <p style="margin: 9px 0 0; color: #bbcbdf !important; font-size: 14px; line-height: 1.7;">${escapeHtml(intro)}</p>
                </td>
              </tr>

              <tr>
                <td style="padding: 16px 26px 0;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" bgcolor="#0e2435" style="border-collapse: separate; border-spacing: 0; border: 1px solid #24445f; border-radius: 12px; background: #0e2435;">
                    <tr>
                      <td style="padding: 12px 14px; font-family: Arial, Helvetica, sans-serif;">
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                          <tr>
                            <td style="vertical-align: top;">
                              <p style="margin: 0; color: #9cc8ee !important; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em;">Total Amount</p>
                              <p style="margin: 8px 0 0; color: #ffffff !important; font-size: 34px; line-height: 1.1; font-weight: 800; font-family: Georgia, 'Times New Roman', serif;">${escapeHtml(amount)}</p>
                              <p style="margin: 8px 0 0; color: #9dc3e6 !important; font-size: 12px;">${escapeHtml(paymentLabel)}</p>
                            </td>
                            <td align="right" style="vertical-align: top;">
                              <span style="display: inline-block; margin: 2px 0 0; background: #0f766e; border: 1px solid #34d399; border-radius: 999px; padding: 5px 10px; color: #e7fff8 !important; font-size: 11px; font-family: Arial, Helvetica, sans-serif; text-transform: uppercase; letter-spacing: 0.08em;">${escapeHtml(statusBadge)}</span>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <tr>
                <td style="padding: 16px 26px 0;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" bgcolor="#0f172a" style="border-collapse: collapse; background: #0f172a; border: 1px solid #23324a; border-radius: 12px;">
                    <tr>
                      <td style="padding: 12px 14px 2px; color: #9dc2e9 !important; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; font-family: Arial, Helvetica, sans-serif;">Transaction Details</td>
                    </tr>
                    <tr>
                      <td style="padding: 0 14px 4px;">
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" bgcolor="#0f172a" style="border-collapse: collapse; background: #0f172a;">
                          ${detailRows}
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <tr>
                <td style="padding: 16px 26px 0;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" bgcolor="#0f172a" style="border-collapse: collapse; background: #0f172a; border: 1px solid #23324a; border-radius: 12px;">
                    <tr>
                      <td style="padding: 12px 14px 2px; color: #9dc2e9 !important; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; font-family: Arial, Helvetica, sans-serif;">What Happens Next</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 14px 6px;">
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" bgcolor="#0f172a" style="border-collapse: collapse; background: #0f172a;">
                          ${nextStepsRows}
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <tr>
                <td bgcolor="#0e1829" style="padding: 18px 26px 26px; background: #0e1829; color: #c3d3ea !important; font-family: Arial, Helvetica, sans-serif;">
                  <p style="margin: 0; font-size: 13px; line-height: 1.7; color: #c3d3ea !important;">${escapeHtml(footerNote)}</p>
                  <p style="margin: 14px 0 0; color: #eaf2ff !important; font-size: 14px;">Regards,<br /><strong>Car Scout Team</strong></p>
                </td>
              </tr>

              <tr>
                <td bgcolor="#0a1322" style="padding: 12px 26px; border-top: 1px solid #1f2b3f; background: #0a1322; color: #7f93af !important; font-family: Arial, Helvetica, sans-serif; font-size: 11px;">
                  Car Scout Customer Support
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
`.trim();

const buildPurchaseNextSteps = () =>
  [
    buildStepRow("Verification Call", "A specialist will contact you to verify buyer and vehicle details."),
    buildStepRow("Invoice Finalization", "Your final payment schedule and invoice will be shared after verification."),
    buildStepRow("Delivery Coordination", "Our team will help you align registration and delivery timeline."),
  ].join("");

const buildStatusNextSteps = (safeStatus) =>
  [
    buildStepRow("Current Stage", `Your order is currently marked as ${safeStatus}.`),
    buildStepRow("Need Help", "Reply to this email for quick support from Car Scout operations."),
  ].join("");

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
  const safePaymentMethod = normalizePaymentMethod(paymentMethod);

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
      greeting: `Hello ${safeName},`,
      intro: "Your purchase request is confirmed and being processed by our team. Thank you for choosing Car Scout.",
      orderId: safeOrderId,
      carTitle: safeCarTitle,
      amount: formatCurrency(totalAmount),
      statusBadge: "Order Confirmed",
      paymentLabel: safePaymentMethod,
      detailRows: [
        buildInfoRow("Order ID", safeOrderId),
        buildInfoRow("Email", safeEmail),
        buildInfoRow("Car", safeCarTitle),
        buildInfoRow("Payment Method", safePaymentMethod),
        buildInfoRow("Down Payment", formatCurrency(downPayment)),
        buildInfoRow("Remaining Amount", formatCurrency(remainingAmount)),
      ].join(""),
      nextStepsRows: buildPurchaseNextSteps(),
      footerNote: "Our team will contact you shortly with verification and invoice details.",
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
      greeting: `Hello ${safeName},`,
      intro: "We have updated your purchase status. Please review the latest details below.",
      orderId: safeOrderId,
      carTitle: safeCarTitle,
      amount: formatCurrency(totalAmount),
      statusBadge: safeStatus,
      paymentLabel: "Status Notification",
      detailRows: [
        buildInfoRow("Order ID", safeOrderId),
        buildInfoRow("Email", safeEmail),
        buildInfoRow("Car", safeCarTitle),
        buildInfoRow("Current Status", safeStatus),
        buildInfoRow("Order Amount", formatCurrency(totalAmount)),
      ].join(""),
      nextStepsRows: buildStatusNextSteps(safeStatus),
      footerNote: "If you need assistance, reply to this email and our support team will help you right away.",
    })}
  `.trim();

  return {
    subject,
    text,
    html,
  };
};
