const OWNER_COUNT_WORDS = {
  first: 1,
  second: 2,
  third: 3,
  fourth: 4,
  fifth: 5,
  sixth: 6,
  seventh: 7,
  eighth: 8,
  ninth: 9,
  tenth: 10,
};

const OWNER_SUFFIXES = ["th", "st", "nd", "rd"];

const toOrdinal = (count) => {
  const value = Number(count);
  if (!Number.isFinite(value) || value <= 0) {
    return "";
  }

  const mod100 = value % 100;
  const suffix =
    mod100 >= 11 && mod100 <= 13
      ? "th"
      : OWNER_SUFFIXES[Math.min(value % 10, 4)] || "th";

  return `${value}${suffix}`;
};

export const OWNER_OPTIONS = [
  "1st owner",
  "2nd owner",
  "3rd owner",
  "4th owner",
  "5th owner",
  "6th owner",
  "7th owner",
  "8th owner",
  "9th owner",
  "10+ owner",
];

export const normalizeOwnerForApi = (rawValue) => {
  const value = String(rawValue || "").trim();
  if (!value) {
    return "";
  }

  const lower = value.toLowerCase();
  if (lower === "10+ owner" || lower === "10 plus owner") {
    return "10+ owner";
  }

  const numberMatch = lower.match(/\d+/);
  if (numberMatch) {
    const count = Number(numberMatch[0]);
    if (count >= 10 || lower.includes("+")) {
      return "10+ owner";
    }

    const ordinal = toOrdinal(count);
    return ordinal ? `${ordinal} owner` : value;
  }

  for (const [word, number] of Object.entries(OWNER_COUNT_WORDS)) {
    if (lower.includes(word)) {
      const ordinal = toOrdinal(number);
      return ordinal ? `${ordinal} owner` : value;
    }
  }

  return value;
};