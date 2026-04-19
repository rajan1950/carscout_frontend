const isLocalHost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

export const APP_CONFIG = {
  apiBaseUrl: "http://localhost:4444",
  email: {
    endpoints: [
      "http://localhost:4444/email/send",
      "http://localhost:4444/email/send-purchase",
      "http://localhost:4444/mail/send",
      "http://localhost:4444/mailer/send",
    ],
    emailJs: {
      serviceId: "",
      templateId: "",
      publicKey: "",
    },
  },
  logs: {
    enableProfileApiLogs: isLocalHost,
  },
};
