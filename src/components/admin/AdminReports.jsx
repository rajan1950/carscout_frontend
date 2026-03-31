import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  deleteReportApi,
  getAllReportsApi,
  updateReportStatusApi,
} from "../../services/reportService";

const VALID_STATUSES = ["pending", "resolved", "rejected"];

export const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [statusUpdatingId, setStatusUpdatingId] = useState("");

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await getAllReportsApi();
      const list = Array.isArray(response?.data) ? response.data : [];
      setReports(list);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const filteredReports = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return reports.filter((item) => {
      const userLabel = `${item?.userId?.firstname || ""} ${item?.userId?.lastname || ""}`
        .trim()
        .toLowerCase();
      const carLabel = `${item?.carId?.brand || ""} ${item?.carId?.model || ""}`
        .trim()
        .toLowerCase();
      const reason = String(item?.reason || "").toLowerCase();
      const description = String(item?.description || "").toLowerCase();
      const status = String(item?.status || "pending").toLowerCase();

      const matchesSearch =
        normalizedSearch.length === 0 ||
        userLabel.includes(normalizedSearch) ||
        carLabel.includes(normalizedSearch) ||
        reason.includes(normalizedSearch) ||
        description.includes(normalizedSearch);

      const matchesStatus = statusFilter === "all" || status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [reports, searchQuery, statusFilter]);

  const handleStatusChange = async (id, nextStatus) => {
    if (!VALID_STATUSES.includes(nextStatus)) {
      return;
    }

    setStatusUpdatingId(id);
    try {
      const response = await updateReportStatusApi(id, nextStatus);
      const updated = response?.data;

      if (updated?._id) {
        setReports((prev) => prev.map((item) => (item._id === id ? updated : item)));
      } else {
        setReports((prev) =>
          prev.map((item) => (item._id === id ? { ...item, status: nextStatus } : item))
        );
      }

      toast.success("Report status updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update report status");
    } finally {
      setStatusUpdatingId("");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteReportApi(id);
      setReports((prev) => prev.filter((item) => item._id !== id));
      toast.success("Report deleted");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete report");
    }
  };

  return (
    <div>
      <h2 className="text-4xl font-bold text-slate-800 mb-8">Reported Cars</h2>

      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 flex flex-col lg:flex-row gap-3 lg:items-center">
        <input
          type="text"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search by user, car, reason, description"
          className="w-full lg:flex-1 border border-gray-300 rounded-xl px-4 py-3 text-base outline-none focus:ring-2 focus:ring-indigo-300"
        />
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="w-full lg:w-52 border border-gray-300 rounded-xl px-4 py-3 text-base outline-none focus:ring-2 focus:ring-indigo-300"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="resolved">Resolved</option>
          <option value="rejected">Rejected</option>
        </select>
        <button
          type="button"
          onClick={fetchReports}
          className="w-full lg:w-auto bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-3 font-semibold"
        >
          Refresh
        </button>
      </div>

      {loading && <p className="text-gray-600">Loading reports...</p>}
      {error && <p className="text-red-600 mb-3">{error}</p>}

      {!loading && !error && (
        <div className="overflow-x-auto bg-white rounded-2xl border border-gray-200">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wider">
              <tr>
                <th className="text-left px-4 py-3">User</th>
                <th className="text-left px-4 py-3">Car</th>
                <th className="text-left px-4 py-3">Reason</th>
                <th className="text-left px-4 py-3">Description</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((item) => {
                const userLabel = `${item?.userId?.firstname || "-"} ${item?.userId?.lastname || ""}`.trim();
                const carLabel = `${item?.carId?.brand || "-"} ${item?.carId?.model || ""}`.trim();

                return (
                  <tr key={item._id} className="border-t border-gray-100 align-top">
                    <td className="px-4 py-4 font-semibold text-slate-800">{userLabel}</td>
                    <td className="px-4 py-4 text-gray-700">{carLabel}</td>
                    <td className="px-4 py-4 text-gray-700 font-medium">{item.reason || "-"}</td>
                    <td className="px-4 py-4 text-gray-600 max-w-xs whitespace-pre-wrap">{item.description || "-"}</td>
                    <td className="px-4 py-4">
                      <select
                        value={item.status || "pending"}
                        disabled={statusUpdatingId === item._id}
                        onChange={(event) => handleStatusChange(item._id, event.target.value)}
                        className="border border-gray-300 rounded-lg px-2 py-1 capitalize"
                      >
                        {VALID_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-4 text-gray-600">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredReports.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                    No reports found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
