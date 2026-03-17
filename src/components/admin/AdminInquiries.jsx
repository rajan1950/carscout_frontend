import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const ADMIN_BASE_URL = "http://localhost:4444/admin";
const INQUIRY_BASE_URL = "http://localhost:4444/inquiry";

const initialForm = {
  name: "",
  email: "",
  message: "",
};

export const AdminInquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [form, setForm] = useState(initialForm);
  const [editingInquiryId, setEditingInquiryId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchInquiries = async () => {
    try {
      const res = await axios.get(`${ADMIN_BASE_URL}/inquiries`);
      setInquiries(Array.isArray(res.data) ? res.data : []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load inquiries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingInquiryId(null);
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) {
      return;
    }

    setSubmitting(true);
    try {
      if (editingInquiryId) {
        const res = await axios.put(
          `${INQUIRY_BASE_URL}/update/${editingInquiryId}`,
          form
        );
        const updatedInquiry = res.data;
        if (updatedInquiry?._id) {
          setInquiries((prev) =>
            prev.map((item) =>
              item._id === updatedInquiry._id ? updatedInquiry : item
            )
          );
        } else {
          fetchInquiries();
        }
        toast.success("Inquiry updated");
      } else {
        const res = await axios.post(`${INQUIRY_BASE_URL}/create`, form);
        const createdInquiry = res.data;
        if (createdInquiry?._id) {
          setInquiries((prev) => [createdInquiry, ...prev]);
        } else {
          fetchInquiries();
        }
        toast.success("Inquiry created");
      }

      resetForm();
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (inquiry) => {
    setEditingInquiryId(inquiry._id);
    setForm({
      name: inquiry.name || "",
      email: inquiry.email || "",
      message: inquiry.message || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${INQUIRY_BASE_URL}/delete/${id}`);
      setInquiries((prev) => prev.filter((item) => item._id !== id));
      toast.success("Inquiry deleted");
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filteredInquiries = inquiries.filter((inquiry) => {
    if (!normalizedSearch) {
      return true;
    }

    const name = (inquiry.name || "").toLowerCase();
    const email = (inquiry.email || "").toLowerCase();
    const message = (inquiry.message || "").toLowerCase();

    return (
      name.includes(normalizedSearch) ||
      email.includes(normalizedSearch) ||
      message.includes(normalizedSearch)
    );
  });

  return (
    <div>
      <h2 className="text-4xl font-bold text-slate-800 mb-8">Inquiry Management</h2>

      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 flex flex-col lg:flex-row gap-3 lg:items-center">
        <input
          type="text"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search inquiries..."
          className="w-full lg:flex-1 border border-gray-300 rounded-xl px-4 py-3 text-base outline-none focus:ring-2 focus:ring-indigo-300"
        />
        <button
          type="button"
          onClick={openCreateModal}
          className="w-full lg:w-auto bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-3 font-semibold"
        >
          + Add Inquiry
        </button>
      </div>

      {loading && <p className="text-gray-600">Loading inquiries...</p>}
      {error && <p className="text-red-600 mb-3">{error}</p>}

      {!loading && !error && (
        <div className="overflow-x-auto bg-white rounded-2xl border border-gray-200">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wider">
              <tr>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Message</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInquiries.map((inquiry, index) => (
                <tr key={inquiry._id || index} className="border-t border-gray-100">
                  <td className="px-4 py-4 font-semibold text-slate-800">{inquiry.name || "-"}</td>
                  <td className="px-4 py-4 text-gray-600">{inquiry.email || "-"}</td>
                  <td className="px-4 py-4 text-gray-700">{inquiry.message || "-"}</td>
                  <td className="px-4 py-3 flex gap-2">
                    <button
                      onClick={() => startEdit(inquiry)}
                      className="bg-slate-100 hover:bg-slate-200 text-indigo-700 px-3 py-2 rounded-lg"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(inquiry._id)}
                      className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filteredInquiries.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                    No inquiries found
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
                {editingInquiryId ? "Update Inquiry" : "Add Inquiry"}
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
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Name"
                required
                className="border border-gray-300 rounded-xl px-3 py-2"
              />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email"
                required
                className="border border-gray-300 rounded-xl px-3 py-2"
              />
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Message"
                required
                rows={4}
                className="md:col-span-2 border border-gray-300 rounded-xl px-3 py-2"
              />

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
                    : editingInquiryId
                    ? "Update Inquiry"
                    : "Create Inquiry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
