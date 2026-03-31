import axios from "axios";
import { readAuthSession } from "../utils/auth";

const EMAIL_ENDPOINTS = [
  "http://localhost:4444/email/send",
  "http://localhost:4444/email/send-purchase",
  "http://localhost:4444/mail/send",
  "http://localhost:4444/mailer/send",
];

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
    throw lastError;
  }

  throw new Error("No email endpoint available");
};
