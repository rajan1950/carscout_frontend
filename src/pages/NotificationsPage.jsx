import { useEffect, useMemo, useState } from "react";
import { FaCheck, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import UserNavbar from "../components/UserNavbar";
import { useNotifications } from "../hooks/useNotifications";

const PAGE_LIMIT = 20;

const formatTime = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const NotificationsPage = () => {
  const {
    list,
    unreadCount,
    loading,
    error,
    pagination,
    fetchNotifications,
    markOneAsRead,
    markAllAsRead,
    deleteOne,
    fetchUnreadCount,
  } = useNotifications();

  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchNotifications({ page: currentPage, limit: PAGE_LIMIT });
  }, [currentPage, fetchNotifications]);

  const filteredNotifications = useMemo(() => {
    if (filter === "unread") {
      return list.filter((item) => !item.isRead);
    }

    if (filter === "read") {
      return list.filter((item) => item.isRead);
    }

    return list;
  }, [filter, list]);

  const totalPages = Math.max(1, Math.ceil((pagination.total || 0) / PAGE_LIMIT));

  const onMarkRead = async (id) => {
    const result = await markOneAsRead(id);
    if (result) {
      toast.success("Notification marked as read");
      fetchUnreadCount();
    }
  };

  const onMarkAll = async () => {
    const result = await markAllAsRead();
    if (result) {
      toast.success("All notifications marked as read");
      fetchUnreadCount();
    }
  };

  const onDelete = async (id) => {
    const result = await deleteOne(id);
    if (result) {
      toast.success("Notification deleted");
      if (filteredNotifications.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      } else {
        fetchNotifications({ page: currentPage, limit: PAGE_LIMIT });
      }
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f6fbff,_#f8fafc_36%,_#eef6ff)]">
      <UserNavbar />

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <section className="rounded-3xl border border-cyan-100 bg-gradient-to-r from-slate-900 via-slate-800 to-cyan-800 p-5 text-white sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">Notification Center</p>
          <h1 className="mt-2 text-2xl font-black sm:text-4xl">Stay Updated On Your Activity</h1>
          <p className="mt-2 text-sm text-cyan-100 sm:text-base">
            Manage unread alerts, review activity updates, and clear notifications as you go.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-white/15 bg-white/10 p-3">
              <p className="text-xs uppercase text-cyan-200">Unread</p>
              <p className="text-2xl font-black">{unreadCount}</p>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/10 p-3">
              <p className="text-xs uppercase text-cyan-200">Current Page</p>
              <p className="text-2xl font-black">{pagination.page || currentPage}</p>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/10 p-3">
              <p className="text-xs uppercase text-cyan-200">Total</p>
              <p className="text-2xl font-black">{pagination.total || 0}</p>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/10 p-3">
              <p className="text-xs uppercase text-cyan-200">Per Page</p>
              <p className="text-2xl font-black">{PAGE_LIMIT}</p>
            </div>
          </div>
        </section>

        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-1">
              <button
                type="button"
                onClick={() => setFilter("all")}
                className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                  filter === "all" ? "bg-white text-slate-900 shadow" : "text-slate-600"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setFilter("unread")}
                className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                  filter === "unread" ? "bg-cyan-700 text-white" : "text-slate-600"
                }`}
              >
                Unread
              </button>
              <button
                type="button"
                onClick={() => setFilter("read")}
                className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                  filter === "read" ? "bg-emerald-700 text-white" : "text-slate-600"
                }`}
              >
                Read
              </button>
            </div>

            <button
              type="button"
              onClick={onMarkAll}
              disabled={loading || unreadCount === 0}
              className="rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-800 hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Mark all as read
            </button>
          </div>

          {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
          {loading && list.length === 0 ? <p className="mt-4 text-sm text-slate-500">Loading notifications...</p> : null}

          {!loading && filteredNotifications.length === 0 ? (
            <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              No notifications in this tab.
            </p>
          ) : null}

          <div className="mt-4 space-y-3">
            {filteredNotifications.map((item) => (
              <article
                key={item._id}
                className={`rounded-2xl border p-4 ${
                  item.isRead
                    ? "border-slate-200 bg-white"
                    : "border-cyan-200 bg-cyan-50"
                }`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-base font-bold text-slate-900">{item.title || "Notification"}</p>
                    <p className="mt-1 text-sm text-slate-700">{item.body || ""}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span>{formatTime(item.createdAt)}</span>
                      {!item.isRead ? (
                        <span className="rounded-full bg-cyan-100 px-2 py-0.5 font-semibold text-cyan-800">
                          Unread
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-semibold text-emerald-700">
                          Read
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!item.isRead ? (
                      <button
                        type="button"
                        onClick={() => onMarkRead(item._id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                      >
                        <FaCheck /> Mark read
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => onDelete(item._id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
            <p className="text-sm text-slate-600">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1 || loading}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage >= totalPages || loading}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default NotificationsPage;
