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
    <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.5;">
      <h2 style="margin: 0 0 12px; color: #0369a1;">Purchase Confirmation</h2>
      <p>Hello ${safeName},</p>
      <p>Your car purchase request has been confirmed successfully.</p>
      <table style="border-collapse: collapse; width: 100%; margin: 12px 0;">
        <tr><td style="padding: 6px 0;"><strong>Order ID:</strong></td><td style="padding: 6px 0;">${safeOrderId}</td></tr>
        <tr><td style="padding: 6px 0;"><strong>Email:</strong></td><td style="padding: 6px 0;">${safeEmail}</td></tr>
        <tr><td style="padding: 6px 0;"><strong>Car:</strong></td><td style="padding: 6px 0;">${safeCarTitle}</td></tr>
        <tr><td style="padding: 6px 0;"><strong>Total Amount:</strong></td><td style="padding: 6px 0;">${formatCurrency(totalAmount)}</td></tr>
        <tr><td style="padding: 6px 0;"><strong>Payment Method:</strong></td><td style="padding: 6px 0;">${safePaymentMethod}</td></tr>
        <tr><td style="padding: 6px 0;"><strong>Down Payment:</strong></td><td style="padding: 6px 0;">${formatCurrency(downPayment)}</td></tr>
        <tr><td style="padding: 6px 0;"><strong>Remaining Amount:</strong></td><td style="padding: 6px 0;">${formatCurrency(remainingAmount)}</td></tr>
      </table>
      <p>Our team will contact you soon for the next steps.</p>
      <p style="margin-top: 16px;">Thanks,<br />Car Scout Team</p>
    </div>
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
    <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.5;">
      <h2 style="margin: 0 0 12px; color: #0369a1;">Purchase Status Updated</h2>
      <p>Hello ${safeName},</p>
      <p>Your purchase status has been updated.</p>
      <table style="border-collapse: collapse; width: 100%; margin: 12px 0;">
        <tr><td style="padding: 6px 0;"><strong>Order ID:</strong></td><td style="padding: 6px 0;">${safeOrderId}</td></tr>
        <tr><td style="padding: 6px 0;"><strong>Email:</strong></td><td style="padding: 6px 0;">${safeEmail}</td></tr>
        <tr><td style="padding: 6px 0;"><strong>Car:</strong></td><td style="padding: 6px 0;">${safeCarTitle}</td></tr>
        <tr><td style="padding: 6px 0;"><strong>Status:</strong></td><td style="padding: 6px 0;">${safeStatus}</td></tr>
        <tr><td style="padding: 6px 0;"><strong>Order Amount:</strong></td><td style="padding: 6px 0;">${formatCurrency(totalAmount)}</td></tr>
      </table>
      <p>For support, contact Car Scout support team.</p>
      <p style="margin-top: 16px;">Thanks,<br />Car Scout Team</p>
    </div>
  `.trim();

  return {
    subject,
    text,
    html,
  };
};
