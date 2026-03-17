import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const MESSAGE_BASE_URL = "http://localhost:4444/message";

const initialForm = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

export const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [form, setForm] = useState(initialForm);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`${MESSAGE_BASE_URL}/all`);
      setMessages(Array.isArray(res.data) ? res.data : []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) {
      return;
    }

    setSubmitting(true);
    try {
      const res = await axios.post(`${MESSAGE_BASE_URL}/create`, form);
      const created = res.data?.data;
      if (created?._id) {
        setMessages((prev) => [created, ...prev]);
      } else {
        fetchMessages();
      }
      setForm(initialForm);
      setIsModalOpen(false);
      toast.success("Message added");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create message");
    } finally {
      setSubmitting(false);
    }
  };

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filteredMessages = messages.filter((item) => {
    if (!normalizedSearch) {
      return true;
    }

    const name = (item.name || "").toLowerCase();
    const email = (item.email || "").toLowerCase();
    const subject = (item.subject || "").toLowerCase();
    const message = (item.message || "").toLowerCase();

    return (
      name.includes(normalizedSearch) ||
      email.includes(normalizedSearch) ||
      subject.includes(normalizedSearch) ||
      message.includes(normalizedSearch)
    );
  });

  const openCreateModal = () => {
    setForm(initialForm);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (submitting) {
      return;
    }
    setIsModalOpen(false);
    setForm(initialForm);
  };

  return (
    <div>
      <h2 className="text-4xl font-bold text-slate-800 mb-8">Message Management</h2>

      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 flex flex-col lg:flex-row gap-3 lg:items-center">
        <input
          type="text"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search messages..."
          className="w-full lg:flex-1 border border-gray-300 rounded-xl px-4 py-3 text-base outline-none focus:ring-2 focus:ring-indigo-300"
        />
        <button
          type="button"
          onClick={openCreateModal}
          className="w-full lg:w-auto bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-3 font-semibold"
        >
          + Add Message
        </button>
      </div>

      {loading && <p className="text-gray-600">Loading messages...</p>}
      {error && <p className="text-red-600 mb-3">{error}</p>}

      {!loading && !error && (
        <div className="overflow-x-auto bg-white rounded-2xl border border-gray-200">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wider">
              <tr>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Subject</th>
                <th className="text-left px-4 py-3">Message</th>
              </tr>
            </thead>
            <tbody>
              {filteredMessages.map((item) => (
                <tr key={item._id} className="border-t border-gray-100">
                  <td className="px-4 py-4 font-semibold text-slate-800">{item.name || "-"}</td>
                  <td className="px-4 py-4 text-gray-600">{item.email || "-"}</td>
                  <td className="px-4 py-4 text-gray-700">{item.subject || "-"}</td>
                  <td className="px-4 py-4 text-gray-700">{item.message || "-"}</td>
                </tr>
              ))}
              {filteredMessages.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                    No messages found
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
              <h3 className="text-xl font-semibold text-slate-800">Add Message</h3>
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
              <input
                name="subject"
                value={form.subject}
                onChange={handleChange}
                placeholder="Subject"
                className="border border-gray-300 rounded-xl px-3 py-2 md:col-span-2"
              />
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Message"
                required
                rows={4}
                className="border border-gray-300 rounded-xl px-3 py-2 md:col-span-2"
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
                  {submitting ? "Please wait..." : "Create Message"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
