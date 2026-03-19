import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { createNotificationForUser } from "../../services/notificationService";
import {
  defaultAdminSettings,
  readAdminSettings,
  saveAdminSettings,
} from "./adminPanelSettings";

export const AdminSettings = () => {
  const [settings, setSettings] = useState(defaultAdminSettings);
  const [notificationForm, setNotificationForm] = useState({
    recipientId: "",
    title: "",
    body: "",
    type: "system",
    priority: "medium",
  });
  const [sendingNotification, setSendingNotification] = useState(false);

  useEffect(() => {
    setSettings(readAdminSettings());
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = () => {
    saveAdminSettings(settings);
    toast.success("Settings saved");
  };

  const handleReset = () => {
    setSettings(defaultAdminSettings);
    saveAdminSettings(defaultAdminSettings);
    toast.success("Settings reset to default");
  };

  const handleNotificationChange = (event) => {
    const { name, value } = event.target;
    setNotificationForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSendNotification = async (event) => {
    event.preventDefault();

    if (sendingNotification) {
      return;
    }

    if (!notificationForm.recipientId.trim()) {
      toast.error("Recipient user ID is required");
      return;
    }

    if (!notificationForm.title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (!notificationForm.body.trim()) {
      toast.error("Message body is required");
      return;
    }

    setSendingNotification(true);

    try {
      await createNotificationForUser({
        recipientId: notificationForm.recipientId.trim(),
        title: notificationForm.title.trim(),
        body: notificationForm.body.trim(),
        type: notificationForm.type,
        priority: notificationForm.priority,
      });

      toast.success("Notification sent successfully");
      setNotificationForm((prev) => ({
        ...prev,
        title: "",
        body: "",
      }));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to send notification");
    } finally {
      setSendingNotification(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-5">Admin Settings</h2>

      <div className="bg-white rounded-xl shadow border border-gray-100 p-5 space-y-4 max-w-2xl">
        <label className="flex items-center justify-between gap-3">
          <span className="text-gray-700 font-medium">Compact Sidebar</span>
          <input
            type="checkbox"
            name="compactSidebar"
            checked={settings.compactSidebar}
            onChange={handleChange}
            className="h-4 w-4"
          />
        </label>

        <label className="flex items-center justify-between gap-3">
          <span className="text-gray-700 font-medium">Show Dashboard Charts</span>
          <input
            type="checkbox"
            name="showDashboardCharts"
            checked={settings.showDashboardCharts}
            onChange={handleChange}
            className="h-4 w-4"
          />
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Default Admin Route</span>
          <select
            name="defaultAdminRoute"
            value={settings.defaultAdminRoute}
            onChange={handleChange}
            className="mt-2 w-full border border-gray-300 rounded px-3 py-2"
          >
            <option value="dashboard">Dashboard</option>
            <option value="users">Users</option>
            <option value="cars">Cars</option>
            <option value="testdrives">Test Drives</option>
            <option value="inquiries">Inquiries</option>
            <option value="messages">Messages</option>
            <option value="reviews">Reviews</option>
            <option value="settings">Settings</option>
          </select>
        </label>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSave}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
          >
            Save Settings
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
          >
            Reset Defaults
          </button>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-xl shadow border border-gray-100 p-5 max-w-2xl">
        <h3 className="text-lg font-semibold text-slate-800 mb-1">Send User Notification</h3>
        <p className="text-sm text-slate-600 mb-4">
          Send an in-app notification to a specific user by their user ID.
        </p>

        <form onSubmit={handleSendNotification} className="space-y-3">
          <label className="block">
            <span className="text-gray-700 font-medium">Recipient User ID</span>
            <input
              name="recipientId"
              value={notificationForm.recipientId}
              onChange={handleNotificationChange}
              placeholder="e.g. 67f1a4..."
              className="mt-2 w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </label>

          <label className="block">
            <span className="text-gray-700 font-medium">Title</span>
            <input
              name="title"
              value={notificationForm.title}
              onChange={handleNotificationChange}
              placeholder="Notification title"
              className="mt-2 w-full border border-gray-300 rounded px-3 py-2"
              maxLength={120}
              required
            />
          </label>

          <label className="block">
            <span className="text-gray-700 font-medium">Message</span>
            <textarea
              name="body"
              value={notificationForm.body}
              onChange={handleNotificationChange}
              placeholder="Write notification message"
              className="mt-2 w-full border border-gray-300 rounded px-3 py-2"
              rows={4}
              maxLength={1000}
              required
            />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-gray-700 font-medium">Type</span>
              <select
                name="type"
                value={notificationForm.type}
                onChange={handleNotificationChange}
                className="mt-2 w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="system">System</option>
                <option value="message">Message</option>
                <option value="inquiry">Inquiry</option>
                <option value="test_drive">Test Drive</option>
                <option value="review">Review</option>
              </select>
            </label>

            <label className="block">
              <span className="text-gray-700 font-medium">Priority</span>
              <select
                name="priority"
                value={notificationForm.priority}
                onChange={handleNotificationChange}
                className="mt-2 w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
          </div>

          <button
            type="submit"
            disabled={sendingNotification}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white px-4 py-2 rounded font-semibold"
          >
            {sendingNotification ? "Sending..." : "Send Notification"}
          </button>
        </form>
      </div>
    </div>
  );
};
