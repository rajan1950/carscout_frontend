export const ADMIN_SETTINGS_STORAGE_KEY = "carscout_admin_settings";
export const ADMIN_SETTINGS_EVENT = "carscout-admin-settings-updated";

export const defaultAdminSettings = {
  compactSidebar: false,
  showDashboardCharts: true,
  defaultAdminRoute: "dashboard",
};

export const readAdminSettings = () => {
  try {
    const raw = localStorage.getItem(ADMIN_SETTINGS_STORAGE_KEY);
    if (!raw) {
      return defaultAdminSettings;
    }
    const parsed = JSON.parse(raw);
    return { ...defaultAdminSettings, ...parsed };
  } catch {
    return defaultAdminSettings;
  }
};

export const saveAdminSettings = (settings) => {
  const merged = { ...defaultAdminSettings, ...settings };
  localStorage.setItem(ADMIN_SETTINGS_STORAGE_KEY, JSON.stringify(merged));
  window.dispatchEvent(new Event(ADMIN_SETTINGS_EVENT));
  return merged;
};
