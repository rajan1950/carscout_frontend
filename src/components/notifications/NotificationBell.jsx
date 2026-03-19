import { useEffect, useMemo, useRef, useState } from "react";
import { FaBell, FaCheck, FaTrash, FaExternalLinkAlt } from "react-icons/fa";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useNotifications } from "../../hooks/useNotifications";

const formatTime = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const NotificationBell = ({ className = "" }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const {
    list,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markOneAsRead,
    markAllAsRead,
    deleteOne,
  } = useNotifications();

  const previewItems = useMemo(
    () =>
      [...list]
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        .slice(0, 10),
    [list]
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    fetchNotifications({ page: 1, limit: 20 });
  }, [open, fetchNotifications]);

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  const handleMarkOne = async (id) => {
    const result = await markOneAsRead(id);
    if (result) {
      toast.success("Notification marked as read");
    }
  };

  const handleMarkAll = async () => {
    const result = await markAllAsRead();
    if (result) {
      toast.success("All notifications marked as read");
    }
  };

  const handleDelete = async (id) => {
    const result = await deleteOne(id);
    if (result) {
      toast.success("Notification deleted");
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-cyan-300 bg-white text-cyan-900 hover:border-cyan-600"
        aria-label="Open notifications"
      >
        <FaBell className="text-sm" />
        {unreadCount > 0 ? (
          <span className="absolute -top-1 -right-1 min-w-5 rounded-full bg-rose-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 mt-2 w-[22rem] max-w-[90vw] rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h4 className="text-sm font-black text-slate-900">Notifications</h4>
            <button
              type="button"
              onClick={handleMarkAll}
              disabled={loading || unreadCount === 0}
              className="rounded-full border border-cyan-200 px-2.5 py-1 text-xs font-semibold text-cyan-700 hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Mark all
            </button>
          </div>

          {error ? <p className="mb-2 text-xs text-rose-600">{error}</p> : null}
          {loading && previewItems.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">Loading notifications...</p>
          ) : null}

          {!loading && previewItems.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">No notifications yet.</p>
          ) : null}

          <div className="max-h-96 space-y-2 overflow-y-auto pr-1">
            {previewItems.map((item) => (
              <article
                key={item._id}
                className={`rounded-xl border p-3 ${
                  item.isRead
                    ? "border-slate-200 bg-white"
                    : "border-cyan-200 bg-cyan-50"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.title || "Notification"}</p>
                    <p className="mt-0.5 text-xs text-slate-600">{item.body || ""}</p>
                    <p className="mt-1 text-[11px] text-slate-500">{formatTime(item.createdAt)}</p>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {!item.isRead ? (
                      <button
                        type="button"
                        onClick={() => handleMarkOne(item._id)}
                        className="inline-flex items-center justify-center rounded-md border border-emerald-200 bg-emerald-50 p-1.5 text-emerald-700 hover:bg-emerald-100"
                        aria-label="Mark as read"
                      >
                        <FaCheck className="text-xs" />
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => handleDelete(item._id)}
                      className="inline-flex items-center justify-center rounded-md border border-rose-200 bg-rose-50 p-1.5 text-rose-700 hover:bg-rose-100"
                      aria-label="Delete notification"
                    >
                      <FaTrash className="text-xs" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <Link
            to="/notifications"
            onClick={() => setOpen(false)}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black"
          >
            View all <FaExternalLinkAlt className="text-xs" />
          </Link>
        </div>
      ) : null}
    </div>
  );
};
