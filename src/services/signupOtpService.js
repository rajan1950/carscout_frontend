const SIGNUP_OTP_STORAGE_KEY = "carscout_signup_pending_otp";
const OTP_LENGTH = 6;
const OTP_TTL_MS = 5 * 60 * 1000;
const MAX_VERIFY_ATTEMPTS = 3;

const readState = () => {
  try {
    const raw = sessionStorage.getItem(SIGNUP_OTP_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

const writeState = (state) => {
  sessionStorage.setItem(SIGNUP_OTP_STORAGE_KEY, JSON.stringify(state));
};

const generateOtp = () =>
  String(Math.floor(Math.random() * Math.pow(10, OTP_LENGTH))).padStart(OTP_LENGTH, "0");

export const clearPendingSignupOtp = () => {
  sessionStorage.removeItem(SIGNUP_OTP_STORAGE_KEY);
};

export const startSignupOtpFlow = (signupData) => {
  const otp = generateOtp();
  const state = {
    signupData,
    otp,
    createdAt: Date.now(),
    expiresAt: Date.now() + OTP_TTL_MS,
    attempts: 0,
  };

  writeState(state);

  return {
    otp,
    expiresAt: state.expiresAt,
    email: signupData?.email || "",
  };
};

export const getPendingSignupOtp = () => {
  const state = readState();
  if (!state) {
    return null;
  }

  return {
    email: state.signupData?.email || "",
    expiresAt: Number(state.expiresAt) || 0,
    attempts: Number(state.attempts) || 0,
    signupData: state.signupData || null,
  };
};

export const resendSignupOtp = () => {
  const currentState = readState();
  if (!currentState?.signupData) {
    return { success: false, reason: "missing" };
  }

  const otp = generateOtp();
  const nextState = {
    ...currentState,
    otp,
    createdAt: Date.now(),
    expiresAt: Date.now() + OTP_TTL_MS,
    attempts: 0,
  };

  writeState(nextState);

  return {
    success: true,
    otp,
    expiresAt: nextState.expiresAt,
    email: nextState.signupData?.email || "",
  };
};

export const verifySignupOtpCode = (enteredOtp) => {
  const state = readState();

  if (!state?.signupData || !state?.otp) {
    return { success: false, reason: "missing", redirectToSignup: true };
  }

  if (Number(state.expiresAt) <= Date.now()) {
    clearPendingSignupOtp();
    return { success: false, reason: "expired", redirectToSignup: true };
  }

  if (String(enteredOtp).trim() !== String(state.otp).trim()) {
    const nextAttempts = Number(state.attempts || 0) + 1;

    if (nextAttempts >= MAX_VERIFY_ATTEMPTS) {
      clearPendingSignupOtp();
      return {
        success: false,
        reason: "max-attempts",
        attemptsLeft: 0,
        redirectToSignup: true,
      };
    }

    writeState({
      ...state,
      attempts: nextAttempts,
    });

    return {
      success: false,
      reason: "invalid",
      attemptsLeft: MAX_VERIFY_ATTEMPTS - nextAttempts,
      redirectToSignup: true,
    };
  }

  return {
    success: true,
    signupData: state.signupData,
  };
};

export const getSignupOtpTimeLeftInSeconds = () => {
  const state = readState();
  if (!state?.expiresAt) {
    return 0;
  }

  return Math.max(0, Math.ceil((Number(state.expiresAt) - Date.now()) / 1000));
};
