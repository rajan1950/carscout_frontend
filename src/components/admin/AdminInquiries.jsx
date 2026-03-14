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
  const [form, setForm] = useState(initialForm);
  const [editingInquiryId, setEditingInquiryId] = useState(null);

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

  const handleSubmit = async (event) => {
    event.preventDefault();

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
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    }
  };

  const startEdit = (inquiry) => {
    setEditingInquiryId(inquiry._id);
    setForm({
      name: inquiry.name || "",
      email: inquiry.email || "",
      message: inquiry.message || "",
    });
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

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-5">All Inquiries</h2>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow border border-gray-100 p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-3"
      >
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Name"
          required
          className="border border-gray-300 rounded px-3 py-2"
        />
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          required
          className="border border-gray-300 rounded px-3 py-2"
        />
        <input
          name="message"
          value={form.message}
          onChange={handleChange}
          placeholder="Message"
          required
          className="border border-gray-300 rounded px-3 py-2"
        />
        <div className="md:col-span-3 flex gap-2">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            {editingInquiryId ? "Update Inquiry" : "Create Inquiry"}
          </button>
          {editingInquiryId && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {loading && <p className="text-gray-600">Loading inquiries...</p>}
      {error && <p className="text-red-600 mb-3">{error}</p>}

      {!loading && !error && (
        <div className="overflow-x-auto bg-white rounded-xl shadow border border-gray-100">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Message</th>
                <th className="text-left px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.map((inquiry, index) => (
                <tr key={inquiry._id || index} className="border-t border-gray-100">
                  <td className="px-4 py-3">{inquiry.name || "-"}</td>
                  <td className="px-4 py-3">{inquiry.email || "-"}</td>
                  <td className="px-4 py-3">{inquiry.message || "-"}</td>
                  <td className="px-4 py-3 flex gap-2">
                    <button
                      onClick={() => startEdit(inquiry)}
                      className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(inquiry._id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {inquiries.length === 0 && (
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
    </div>
  );
};
