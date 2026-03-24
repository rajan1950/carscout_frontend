const BACKEND_ORIGIN = "http://localhost:4444";

const ABSOLUTE_URL_PATTERN = /^https?:\/\//i;

export const resolveCarImageUrl = (image) => {
  const value = String(image || "").trim();

  if (!value) {
    return "";
  }

  if (ABSOLUTE_URL_PATTERN.test(value) || value.startsWith("data:") || value.startsWith("blob:")) {
    return value;
  }

  if (value.startsWith("/")) {
    return `${BACKEND_ORIGIN}${value}`;
  }

  return `${BACKEND_ORIGIN}/${value}`;
};
