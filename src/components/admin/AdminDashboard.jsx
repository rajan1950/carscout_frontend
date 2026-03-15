import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { ADMIN_SETTINGS_EVENT, readAdminSettings } from "./adminPanelSettings";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

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

  const fetchDashboard = async () => {
    setError("");
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

  useEffect(() => {
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
    { label: "Users", value: stats.users, color: "#2563eb" },
    { label: "Cars", value: stats.cars, color: "#16a34a" },
    { label: "Inquiries", value: stats.inquiries, color: "#9333ea" },
    { label: "Messages", value: stats.messages, color: "#4f46e5" },
    { label: "Reviews", value: stats.reviews, color: "#d97706" },
    { label: "Test Drives", value: stats.testDrives, color: "#e11d48" },
  ];

  const pieData = chartData.filter((item) => item.value > 0);

  const moduleRouteMap = {
    Users: "users",
    Cars: "cars",
    Inquiries: "inquiries",
    Messages: "messages",
    Reviews: "reviews",
    "Test Drives": "testdrives",
  };

  const busiest = [...chartData].sort((a, b) => b.value - a.value)[0];
  const busiestRoute = `/adminpanel/${moduleRouteMap[busiest?.label] || "dashboard"}`;

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
        <div className="mt-8 grid grid-cols-1 xl:grid-cols-2 gap-5">
          <div className="bg-white rounded-xl shadow border border-gray-100 p-5">
            <h3 className="text-lg font-semibold mb-4">Activity Comparison (Bar)</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} interval={0} angle={-20} textAnchor="end" height={60} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {chartData.map((entry) => (
                      <Cell key={entry.label} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow border border-gray-100 p-5">
            <h3 className="text-lg font-semibold mb-4">Distribution (Pie)</h3>
            <div className="h-72">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="label"
                      cx="50%"
                      cy="50%"
                      outerRadius={95}
                      label
                    >
                      {pieData.map((entry) => (
                        <Cell key={entry.label} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                  No data available yet for distribution chart.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 bg-white rounded-xl shadow border border-gray-100 p-5">
        <h3 className="text-lg font-semibold mb-4">Direct Management</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
            <p className="text-sm font-semibold text-blue-800 mb-3">Core Management</p>
            <div className="flex flex-wrap gap-2">
              <Link
                to="/adminpanel/users"
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm"
              >
                Users
              </Link>
              <Link
                to="/adminpanel/cars"
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm"
              >
                Cars
              </Link>
              <Link
                to="/adminpanel/testdrives"
                className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-2 rounded text-sm"
              >
                Test Drives
              </Link>
            </div>
          </div>

          <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-4">
            <p className="text-sm font-semibold text-indigo-800 mb-3">Communication</p>
            <div className="flex flex-wrap gap-2">
              <Link
                to="/adminpanel/inquiries"
                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded text-sm"
              >
                Inquiries
              </Link>
              <Link
                to="/adminpanel/messages"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded text-sm"
              >
                Messages
              </Link>
              <Link
                to="/adminpanel/reviews"
                className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-2 rounded text-sm"
              >
                Reviews
              </Link>
            </div>
          </div>

          <div className="rounded-lg border border-cyan-100 bg-cyan-50 p-4">
            <p className="text-sm font-semibold text-cyan-800 mb-3">Smart Actions (New)</p>
            <div className="flex flex-wrap gap-2">
              <Link
                to={busiestRoute}
                className="bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-2 rounded text-sm"
              >
                Open Busiest: {busiest?.label || "Dashboard"}
              </Link>
              <Link
                to="/adminpanel/settings"
                className="bg-slate-700 hover:bg-slate-800 text-white px-3 py-2 rounded text-sm"
              >
                Admin Settings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
