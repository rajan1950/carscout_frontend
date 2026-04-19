import { useEffect, useState } from "react";
import { FaExclamationTriangle } from "react-icons/fa";

const LOGOUT_REASONS = [
  "Finished my work",
  "Using another account",
  "Privacy on shared device",
  "Session issue or bug",
  "Other",
];

export const LogoutConfirmModal = ({ isOpen, onClose, onConfirm }) => {
  const [reason, setReason] = useState(LOGOUT_REASONS[0]);
  const [details, setDetails] = useState("");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setReason(LOGOUT_REASONS[0]);
    setDetails("");
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onEscape);
    return () => {
      window.removeEventListener("keydown", onEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const confirmLogout = () => {
    onConfirm({ reason, details: details.trim() });
  };

  return (
    <div className="fixed inset-0 z-[200] grid place-items-center bg-slate-950/65 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
              <FaExclamationTriangle />
            </span>
            <div>
              <h3 className="text-xl font-black text-slate-900">Final Logout Confirmation</h3>
              <p className="text-sm text-slate-600">Are you sure you want to logout from this account?</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div>
            <p className="mb-2 block text-sm font-semibold text-slate-800">Choose reason for logout</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {LOGOUT_REASONS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setReason(item)}
                  className={`rounded-xl border px-3 py-2 text-sm text-left transition ${
                    reason === item
                      ? "border-cyan-500 bg-cyan-50 text-cyan-900"
                      : "border-slate-300 text-slate-700 hover:border-cyan-300 hover:bg-cyan-50/40"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-800">Additional note (optional)</label>
            <textarea
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              rows={3}
              placeholder="Add short note..."
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={confirmLogout}
            className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
          >
            Final Logout
          </button>
        </div>
      </div>
    </div>
  );
};
