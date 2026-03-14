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
  const [form, setForm] = useState(initialForm);

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
    try {
      const res = await axios.post(`${MESSAGE_BASE_URL}/create`, form);
      const created = res.data?.data;
      if (created?._id) {
        setMessages((prev) => [created, ...prev]);
      } else {
        fetchMessages();
      }
      setForm(initialForm);
      toast.success("Message added");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create message");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-5">Messages</h2>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow border border-gray-100 p-4 mb-6 grid grid-cols-1 md:grid-cols-2 gap-3"
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
          name="subject"
          value={form.subject}
          onChange={handleChange}
          placeholder="Subject"
          className="border border-gray-300 rounded px-3 py-2 md:col-span-2"
        />
        <textarea
          name="message"
          value={form.message}
          onChange={handleChange}
          placeholder="Message"
          required
          className="border border-gray-300 rounded px-3 py-2 md:col-span-2"
          rows={4}
        />
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded md:w-fit"
        >
          Create Message
        </button>
      </form>

      {loading && <p className="text-gray-600">Loading messages...</p>}
      {error && <p className="text-red-600 mb-3">{error}</p>}

      {!loading && !error && (
        <div className="overflow-x-auto bg-white rounded-xl shadow border border-gray-100">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Subject</th>
                <th className="text-left px-4 py-3">Message</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((item) => (
                <tr key={item._id} className="border-t border-gray-100">
                  <td className="px-4 py-3">{item.name || "-"}</td>
                  <td className="px-4 py-3">{item.email || "-"}</td>
                  <td className="px-4 py-3">{item.subject || "-"}</td>
                  <td className="px-4 py-3">{item.message || "-"}</td>
                </tr>
              ))}
              {messages.length === 0 && (
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
    </div>
  );
};
