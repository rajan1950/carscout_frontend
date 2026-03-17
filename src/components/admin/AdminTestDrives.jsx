import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const TESTDRIVE_BASE_URL = "http://localhost:4444/testdrive";

const initialForm = {
  userId: "",
  carId: "",
  date: "",
  location: "",
  status: "pending",
};

export const AdminTestDrives = () => {
  const [testDrives, setTestDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchTestDrives = async () => {
    try {
      const res = await axios.get(`${TESTDRIVE_BASE_URL}/all`);
      setTestDrives(Array.isArray(res.data) ? res.data : []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load test drives");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestDrives();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (submitting) {
      return;
    }
    setIsModalOpen(false);
    resetForm();
  };

  const startEdit = (item) => {
    setEditingId(item._id);
    setForm({
      userId: item.userId?._id || item.userId || "",
      carId: item.carId?._id || item.carId || "",
      date: item.date ? String(item.date).slice(0, 10) : "",
      location: item.location || "",
      status: item.status || "pending",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) {
      return;
    }
    const payload = {
      userId: form.userId,
      carId: form.carId,
      date: form.date,
      location: form.location,
      status: form.status,
    };

    setSubmitting(true);
    try {
      if (editingId) {
        const res = await axios.put(`${TESTDRIVE_BASE_URL}/${editingId}`, payload);
        const updated = res.data;
        if (updated?._id) {
          setTestDrives((prev) =>
            prev.map((item) => (item._id === updated._id ? updated : item))
          );
        } else {
          fetchTestDrives();
        }
        toast.success("Test drive updated");
      } else {
        const res = await axios.post(`${TESTDRIVE_BASE_URL}/add`, payload);
        const created = res.data?.data;
        if (created?._id) {
          setTestDrives((prev) => [created, ...prev]);
        } else {
          fetchTestDrives();
        }
        toast.success("Test drive created");
      }
      resetForm();
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${TESTDRIVE_BASE_URL}/${id}`);
      setTestDrives((prev) => prev.filter((item) => item._id !== id));
      toast.success("Test drive deleted");
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filteredTestDrives = testDrives.filter((item) => {
    const userName = (item.userId?.firstname || item.userId || "").toString().toLowerCase();
    const carLabel = (item.carId?.brand || item.carId || "").toString().toLowerCase();
    const location = (item.location || "").toLowerCase();
    const status = (item.status || "pending").toLowerCase();

    const matchesSearch =
      normalizedSearch.length === 0 ||
      userName.includes(normalizedSearch) ||
      carLabel.includes(normalizedSearch) ||
      location.includes(normalizedSearch);

    const matchesStatus = statusFilter === "all" || status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <h2 className="text-4xl font-bold text-slate-800 mb-8">Test Drive Management</h2>

      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 flex flex-col lg:flex-row gap-3 lg:items-center">
        <input
          type="text"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search test drives..."
          className="w-full lg:flex-1 border border-gray-300 rounded-xl px-4 py-3 text-base outline-none focus:ring-2 focus:ring-indigo-300"
        />
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="w-full lg:w-48 border border-gray-300 rounded-xl px-4 py-3 text-base outline-none focus:ring-2 focus:ring-indigo-300"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button
          type="button"
          onClick={openCreateModal}
          className="w-full lg:w-auto bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-3 font-semibold"
        >
          + Add Test Drive
        </button>
      </div>

      {loading && <p className="text-gray-600">Loading test drives...</p>}
      {error && <p className="text-red-600 mb-3">{error}</p>}

      {!loading && !error && (
        <div className="overflow-x-auto bg-white rounded-2xl border border-gray-200">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wider">
              <tr>
                <th className="text-left px-4 py-3">User</th>
                <th className="text-left px-4 py-3">Car</th>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-left px-4 py-3">Location</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTestDrives.map((item) => (
                <tr key={item._id} className="border-t border-gray-100">
                  <td className="px-4 py-4 font-semibold text-slate-800">{item.userId?.firstname || item.userId || "-"}</td>
                  <td className="px-4 py-4 text-gray-700">{item.carId?.brand || item.carId || "-"}</td>
                  <td className="px-4 py-4 text-gray-600">{item.date ? new Date(item.date).toLocaleDateString() : "-"}</td>
                  <td className="px-4 py-4 text-gray-600">{item.location || "-"}</td>
                  <td className="px-4 py-4">
                    <span className="inline-block capitalize bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">
                      {item.status || "pending"}
                    </span>
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <button
                      onClick={() => startEdit(item)}
                      className="bg-slate-100 hover:bg-slate-200 text-indigo-700 px-3 py-2 rounded-lg"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filteredTestDrives.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                    No test drives found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-3xl bg-white rounded-2xl border border-gray-200 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-slate-800">
                {editingId ? "Update Test Drive" : "Add Test Drive"}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
                aria-label="Close"
              >
                x
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                name="userId"
                value={form.userId}
                onChange={handleChange}
                placeholder="User ID"
                required
                className="border border-gray-300 rounded-xl px-3 py-2"
              />
              <input
                name="carId"
                value={form.carId}
                onChange={handleChange}
                placeholder="Car ID"
                required
                className="border border-gray-300 rounded-xl px-3 py-2"
              />
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                required
                className="border border-gray-300 rounded-xl px-3 py-2"
              />
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="Location"
                required
                className="border border-gray-300 rounded-xl px-3 py-2"
              />
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="border border-gray-300 rounded-xl px-3 py-2 md:col-span-2"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
                >
                  {submitting
                    ? "Please wait..."
                    : editingId
                    ? "Update Test Drive"
                    : "Create Test Drive"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
