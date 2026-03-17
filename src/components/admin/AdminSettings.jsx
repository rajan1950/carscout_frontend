import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  defaultAdminSettings,
  readAdminSettings,
  saveAdminSettings,
} from "./adminPanelSettings";

export const AdminSettings = () => {
  const [settings, setSettings] = useState(defaultAdminSettings);

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
    </div>
  );
};
