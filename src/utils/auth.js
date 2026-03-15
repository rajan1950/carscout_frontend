const AUTH_STORAGE_KEY = "carscout_auth";
export const AUTH_SESSION_EVENT = "carscout-auth-session-updated";

export const normalizeRole = (role) => String(role || "").trim().toLowerCase();

export const saveAuthSession = (payload) => {
  const role = normalizeRole(payload?.role);

  if (!role) {
    return;
  }

  const session = {
    role,
    token: payload?.token || payload?.accessToken || payload?.jwt || null,
    user: payload?.user || null,
  };

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event(AUTH_SESSION_EVENT));
  return session;
};

export const readAuthSession = () => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);

    if (!raw) {
      return null;
    }

    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const clearAuthSession = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  window.dispatchEvent(new Event(AUTH_SESSION_EVENT));
};

export const getAuthProfile = () => {
  const session = readAuthSession();
  const user = session?.user || {};

  const role = normalizeRole(session?.role);
  const name =
    user?.name ||
    user?.fullName ||
    user?.username ||
    user?.firstName ||
    user?.email ||
    "Profile";

  const email = user?.email || "";
  const image =
    user?.profileImage ||
    user?.profilePicture ||
    user?.avatar ||
    user?.photo ||
    "";

  return {
    role,
    name,
    email,
    image,
    isLoggedIn: Boolean(role),
    isAdmin: role === "admin",
  };
};

export const isAuthenticated = () => {
  const session = readAuthSession();
  return Boolean(session?.role);
};

export const isAdminAuthenticated = () => {
  const session = readAuthSession();
  return normalizeRole(session?.role) === "admin";
};
