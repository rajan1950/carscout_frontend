const AUTH_STORAGE_KEY = "carscout_auth";
export const AUTH_SESSION_EVENT = "carscout-auth-session-updated";

export const normalizeRole = (role) => String(role || "").trim().toLowerCase();

const toTrimmed = (value) => String(value || "").trim();

const toDigits = (value) => String(value || "").replace(/\D/g, "");

const normalizeProfileFields = (details = {}) => ({
  name: toTrimmed(
    details.name || details.fullName || details.displayName || details.userName || details.username
  ),
  email: toTrimmed(details.email),
  profileImage: toTrimmed(
    details.profileImage || details.profilePicture || details.image || details.avatar || details.photo
  ),
  mobile: toDigits(details.mobile || details.phone || details.phoneNumber),
  address: toTrimmed(details.address || details.streetAddress),
  city: toTrimmed(details.city),
  area: toTrimmed(details.area || details.locality),
  pinCode: toDigits(details.pinCode || details.pincode || details.zipCode),
});

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

export const updateAuthProfile = (details = {}) => {
  const session = readAuthSession();

  if (!session?.role) {
    return null;
  }

  const currentUser = session.user || {};
  const patch = normalizeProfileFields(details);

  const mergedUser = {
    ...currentUser,
    ...patch,
  };

  const updatedSession = {
    ...session,
    user: mergedUser,
  };

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedSession));
  window.dispatchEvent(new Event(AUTH_SESSION_EVENT));
  return updatedSession;
};

export const getAuthProfile = () => {
  const session = readAuthSession();
  const user = session?.user || {};

  const role = normalizeRole(session?.role);
  const normalized = normalizeProfileFields(user);
  const name = normalized.name || user?.firstName || user?.email || "Profile";
  const email = normalized.email || "";
  const image = normalized.profileImage || "";

  return {
    role,
    name,
    email,
    image,
    mobile: normalized.mobile,
    address: normalized.address,
    city: normalized.city,
    area: normalized.area,
    pinCode: normalized.pinCode,
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
