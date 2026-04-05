import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { sendTransactionalEmailApi } from "../../services/emailService";
import {
  clearPendingSignupOtp,
  getPendingSignupOtp,
  getSignupOtpTimeLeftInSeconds,
  resendSignupOtp,
  verifySignupOtpCode,
} from "../../services/signupOtpService";
import { buildSignupOtpMailTemplate } from "../../utils/signupOtpTemplate";

const formatTimer = (seconds) => {
  const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
  const remainingSeconds = String(seconds % 60).padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
};

const maskEmail = (email) => {
  const safeEmail = String(email || "");
  const [name, domain] = safeEmail.split("@");

  if (!name || !domain) {
    return safeEmail;
  }

  if (name.length <= 2) {
    return `${name[0] || ""}***@${domain}`;
  }

  return `${name.slice(0, 2)}***${name.slice(-1)}@${domain}`;
};

export const SignupOtpVerify = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(getSignupOtpTimeLeftInSeconds());
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [serverMessage, setServerMessage] = useState("");
  const [isRedirectingAfterSuccess, setIsRedirectingAfterSuccess] = useState(false);

  const pending = getPendingSignupOtp();
  const emailFromState = location.state?.email;
  const email = pending?.email || emailFromState || "";

  const maskedEmail = useMemo(() => maskEmail(email), [email]);

  useEffect(() => {
    if (isRedirectingAfterSuccess) {
      return;
    }

    if (!pending?.signupData) {
      toast.error("Signup session not found. Please sign up again.");
      navigate("/signup", { replace: true });
      return;
    }

    const intervalId = setInterval(() => {
      setTimeLeft(getSignupOtpTimeLeftInSeconds());
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isRedirectingAfterSuccess, navigate, pending?.signupData]);

  const registerUser = async (signupData) => {
    const res = await axios.post("http://localhost:4444/user/register", {
      firstname: signupData.firstname,
      lastname: signupData.lastname,
      email: signupData.email,
      password: signupData.password,
      role: signupData.role,
    });

    return res;
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();

    if (!otp.trim()) {
      toast.error("Please enter OTP");
      return;
    }

    setIsVerifying(true);
    setServerMessage("");

    try {
      const verifyResult = verifySignupOtpCode(otp.trim());

      if (!verifyResult.success) {
        if (verifyResult.reason === "expired") {
          toast.error("OTP expired. Please sign up again.");
          navigate("/signup", { replace: true });
          return;
        }

        if (verifyResult.reason === "invalid") {
          toast.error("OTP verification failed. Please sign up again.");
          navigate("/signup", { replace: true });
          return;
        }

        if (verifyResult.reason === "max-attempts") {
          toast.error("OTP verification failed multiple times. Please sign up again.");
          navigate("/signup", { replace: true });
          return;
        }

        toast.error("OTP verification failed. Please sign up again.");
        navigate("/signup", { replace: true });
        return;
      }

      const res = await registerUser(verifyResult.signupData);

      if (res.status === 201) {
        setIsRedirectingAfterSuccess(true);
        clearPendingSignupOtp();
        toast.success("OTP verified successfully. Please login.");
        navigate("/login", { replace: true });
        return;
      }

      clearPendingSignupOtp();
      toast.error("Registration failed. Please sign up again.");
      navigate("/signup", { replace: true });
    } catch (error) {
      clearPendingSignupOtp();
      const apiMessage = error?.response?.data?.message || "OTP verified, but registration failed. Please sign up again.";
      setServerMessage(apiMessage);
      toast.error(apiMessage);
      navigate("/signup", { replace: true });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    setServerMessage("");

    try {
      const resendResult = resendSignupOtp();

      if (!resendResult.success) {
        toast.error("No active signup session found. Please sign up again.");
        navigate("/signup", { replace: true });
        return;
      }

      const pendingAfterResend = getPendingSignupOtp();
      const mailTemplate = buildSignupOtpMailTemplate({
        name: pendingAfterResend?.signupData?.firstname,
        otp: resendResult.otp,
        expiryMinutes: 5,
      });

      await sendTransactionalEmailApi({
        to: resendResult.email,
        subject: mailTemplate.subject,
        text: mailTemplate.text,
        html: mailTemplate.html,
        template: "signup-otp",
        metadata: {
          type: "signup-otp-resend",
        },
      });

      setTimeLeft(getSignupOtpTimeLeftInSeconds());
      toast.success("A new OTP has been sent to your email.");
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || "Failed to resend OTP";
      setServerMessage(message);
      toast.error(message);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-8">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-2000"></div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 p-8 backdrop-blur-sm">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Verify Email OTP</h1>
            <p className="text-slate-400">
              We sent a 6-digit OTP to <span className="text-slate-200">{maskedEmail || "your email"}</span>
            </p>
          </div>

          {serverMessage && (
            <div className="mb-5 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {serverMessage}
            </div>
          )}

          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Enter OTP</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 transition-all focus:outline-none text-white placeholder-slate-500 tracking-[0.35em] text-center font-semibold"
              />
              <p className="text-slate-400 text-xs mt-2">OTP expires in {formatTimer(timeLeft)}</p>
            </div>

            <button
              type="submit"
              disabled={isVerifying || timeLeft === 0}
              className="w-full from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isVerifying ? "Verifying..." : "Verify OTP"}
            </button>
          </form>

          <button
            type="button"
            disabled={isResending}
            onClick={handleResendOtp}
            className="w-full mt-4 border border-slate-600 text-slate-200 py-2.5 rounded-lg hover:bg-slate-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isResending ? "Resending OTP..." : "Resend OTP"}
          </button>

          <p className="text-center mt-6 text-slate-400 text-sm">
            Back to signup?{" "}
            <Link to="/signup" className="text-blue-500 hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
