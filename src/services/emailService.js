import axios from "axios";
import { readAuthSession } from "../utils/auth";
import { APP_CONFIG } from "../config/appConfig";

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

  const EMAIL_ENDPOINTS = APP_CONFIG.email.endpoints;
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
    const emailJsServiceId = APP_CONFIG.email.emailJs.serviceId;
    const emailJsTemplateId = APP_CONFIG.email.emailJs.templateId;
    const emailJsPublicKey = APP_CONFIG.email.emailJs.publicKey;

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
      "Email sending failed: backend route not found and EmailJS fallback is not configured in src/config/appConfig.js."
    );
  }

  throw new Error("No email endpoint available");
};
