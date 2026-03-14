import { useEffect, useState } from "react";
import axios from "axios";

const ADMIN_BASE_URL = "http://localhost:4444/admin";

export const AdminInquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        const res = await axios.get(`${ADMIN_BASE_URL}/inquiries`);
        setInquiries(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load inquiries");
      } finally {
        setLoading(false);
      }
    };

    fetchInquiries();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-5">All Inquiries</h2>

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
              </tr>
            </thead>
            <tbody>
              {inquiries.map((inquiry, index) => (
                <tr key={inquiry._id || index} className="border-t border-gray-100">
                  <td className="px-4 py-3">{inquiry.name || "-"}</td>
                  <td className="px-4 py-3">{inquiry.email || "-"}</td>
                  <td className="px-4 py-3">{inquiry.message || "-"}</td>
                </tr>
              ))}
              {inquiries.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-gray-500">
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
