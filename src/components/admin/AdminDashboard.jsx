import { useEffect, useState } from "react";
import axios from "axios";

const ADMIN_BASE_URL = "http://localhost:4444/admin";

export const AdminDashboard = () => {
  const [stats, setStats] = useState({ users: 0, cars: 0, inquiries: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axios.get(`${ADMIN_BASE_URL}/dashboard`);
        setStats(res.data || { users: 0, cars: 0, inquiries: 0 });
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard stats");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return <p className="text-gray-600">Loading dashboard...</p>;
  }

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-5">Admin Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow p-5 border border-gray-100">
          <p className="text-sm text-gray-500">Total Users</p>
          <p className="text-3xl font-bold text-blue-700 mt-2">{stats.users}</p>
        </div>

        <div className="bg-white rounded-xl shadow p-5 border border-gray-100">
          <p className="text-sm text-gray-500">Total Cars</p>
          <p className="text-3xl font-bold text-green-700 mt-2">{stats.cars}</p>
        </div>

        <div className="bg-white rounded-xl shadow p-5 border border-gray-100">
          <p className="text-sm text-gray-500">Total Inquiries</p>
          <p className="text-3xl font-bold text-purple-700 mt-2">{stats.inquiries}</p>
        </div>
      </div>
    </div>
  );
};
