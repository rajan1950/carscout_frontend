import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { ADMIN_SETTINGS_EVENT, readAdminSettings } from "./adminPanelSettings";

const ADMIN_BASE_URL = "http://localhost:4444/admin";
const MESSAGE_BASE_URL = "http://localhost:4444/message";
const REVIEW_BASE_URL = "http://localhost:4444/reviews";
const TESTDRIVE_BASE_URL = "http://localhost:4444/testdrive";

export const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    cars: 0,
    inquiries: 0,
    messages: 0,
    reviews: 0,
    testDrives: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCharts, setShowCharts] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [summaryRes, messageRes, reviewRes, testDriveRes] = await Promise.all([
          axios.get(`${ADMIN_BASE_URL}/dashboard`),
          axios.get(`${MESSAGE_BASE_URL}/all`),
          axios.get(`${REVIEW_BASE_URL}/all`),
          axios.get(`${TESTDRIVE_BASE_URL}/all`),
        ]);

        const summary = summaryRes.data || { users: 0, cars: 0, inquiries: 0 };

        setStats({
          users: summary.users || 0,
          cars: summary.cars || 0,
          inquiries: summary.inquiries || 0,
          messages: Array.isArray(messageRes.data) ? messageRes.data.length : 0,
          reviews: Array.isArray(reviewRes.data) ? reviewRes.data.length : 0,
          testDrives: Array.isArray(testDriveRes.data) ? testDriveRes.data.length : 0,
        });
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard stats");
      } finally {
        setLoading(false);
      }
    };

    const applySettings = () => {
      const settings = readAdminSettings();
      setShowCharts(Boolean(settings.showDashboardCharts));
    };

    applySettings();
    window.addEventListener(ADMIN_SETTINGS_EVENT, applySettings);

    fetchDashboard();

    return () => {
      window.removeEventListener(ADMIN_SETTINGS_EVENT, applySettings);
    };
  }, []);

  const chartData = [
    { label: "Users", value: stats.users, color: "bg-blue-600" },
    { label: "Cars", value: stats.cars, color: "bg-green-600" },
    { label: "Inquiries", value: stats.inquiries, color: "bg-purple-600" },
    { label: "Messages", value: stats.messages, color: "bg-indigo-600" },
    { label: "Reviews", value: stats.reviews, color: "bg-amber-500" },
    { label: "Test Drives", value: stats.testDrives, color: "bg-rose-600" },
  ];

  const maxValue = Math.max(...chartData.map((item) => item.value), 1);

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

        <div className="bg-white rounded-xl shadow p-5 border border-gray-100">
          <p className="text-sm text-gray-500">Total Messages</p>
          <p className="text-3xl font-bold text-indigo-700 mt-2">{stats.messages}</p>
        </div>

        <div className="bg-white rounded-xl shadow p-5 border border-gray-100">
          <p className="text-sm text-gray-500">Total Reviews</p>
          <p className="text-3xl font-bold text-amber-600 mt-2">{stats.reviews}</p>
        </div>

        <div className="bg-white rounded-xl shadow p-5 border border-gray-100">
          <p className="text-sm text-gray-500">Total Test Drives</p>
          <p className="text-3xl font-bold text-rose-700 mt-2">{stats.testDrives}</p>
        </div>
      </div>

      {showCharts && (
        <div className="mt-8 bg-white rounded-xl shadow border border-gray-100 p-5">
          <h3 className="text-lg font-semibold mb-4">System Overview Chart</h3>
          <div className="space-y-3">
            {chartData.map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{item.label}</span>
                  <span className="text-gray-600">{item.value}</span>
                </div>
                <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className={`h-full ${item.color}`}
                    style={{ width: `${(item.value / maxValue) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 bg-white rounded-xl shadow border border-gray-100 p-5">
        <h3 className="text-lg font-semibold mb-4">Direct Management</h3>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/adminpanel/users"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Manage Users (Create/Edit/Delete)
          </Link>
          <Link
            to="/adminpanel/cars"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            Manage Cars (Create/Edit/Delete)
          </Link>
          <Link
            to="/adminpanel/inquiries"
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
          >
            Manage Inquiries (Create/Edit/Delete)
          </Link>
          <Link
            to="/adminpanel/messages"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
          >
            Manage Messages
          </Link>
          <Link
            to="/adminpanel/reviews"
            className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded"
          >
            Manage Reviews (Create/Edit/Delete)
          </Link>
          <Link
            to="/adminpanel/testdrives"
            className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded"
          >
            Manage Test Drives (Create/Edit/Delete)
          </Link>
          <Link
            to="/adminpanel/settings"
            className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded"
          >
            Admin Settings
          </Link>
        </div>
      </div>
    </div>
  );
};
