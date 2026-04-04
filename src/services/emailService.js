import axios from "axios";
import { readAuthSession } from "../utils/auth";

const DEFAULT_EMAIL_ENDPOINTS = [
  "http://localhost:4444/email/send",
  "http://localhost:4444/email/send-purchase",
  "http://localhost:4444/mail/send",
  "http://localhost:4444/mailer/send",
];

const getEmailEndpoints = () => {
  const envEndpoints = String(import.meta.env.VITE_PURCHASE_EMAIL_ENDPOINTS || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (envEndpoints.length === 0) {
    return DEFAULT_EMAIL_ENDPOINTS;
  }

  return [...new Set([...envEndpoints, ...DEFAULT_EMAIL_ENDPOINTS])];
};

const getAuthHeaders = () => {
  const token = readAuthSession()?.token;

  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
};

export const sendTransactionalEmailApi = async (payload) => {
  const normalizedPayload = {
    to: payload?.to,
    email: payload?.to,
    subject: payload?.subject,
    text: payload?.text,
    html: payload?.html,
    template: payload?.template || "transactional",
    metadata: payload?.metadata || {},
  };

  const EMAIL_ENDPOINTS = getEmailEndpoints();
  let lastError = null;

  for (const endpoint of EMAIL_ENDPOINTS) {
    try {
      const response = await axios.post(endpoint, normalizedPayload, {
        headers: getAuthHeaders(),
      });

      return {
        success: true,
        endpoint,
        data: response.data,
      };
    } catch (err) {
      lastError = err;
    }
  }

  if (lastError) {
    const emailJsServiceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const emailJsTemplateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const emailJsPublicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    const hasEmailJsConfig = Boolean(emailJsServiceId && emailJsTemplateId && emailJsPublicKey);

    if (hasEmailJsConfig) {
      try {
        const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            service_id: emailJsServiceId,
            template_id: emailJsTemplateId,
            user_id: emailJsPublicKey,
            template_params: {
              to_email: normalizedPayload.to,
              subject: normalizedPayload.subject,
              message: normalizedPayload.text,
              html: normalizedPayload.html,
            },
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "EmailJS request failed");
        }

        return {
          success: true,
          endpoint: "emailjs",
          data: { provider: "emailjs" },
        };
      } catch (emailJsError) {
        throw new Error(
          `Backend email endpoints failed and EmailJS fallback failed: ${emailJsError.message || "Unknown error"}`
        );
      }
    }

    throw new Error(
      "Email sending failed: backend route not found and EmailJS is not configured. Set VITE_PURCHASE_EMAIL_ENDPOINTS or EmailJS env keys."
    );
  }

  throw new Error("No email endpoint available");
};
