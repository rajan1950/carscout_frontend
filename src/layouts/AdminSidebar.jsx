import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import GroupIcon from '@mui/icons-material/Group';
import DirectionsCarFilledIcon from '@mui/icons-material/DirectionsCarFilled';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import ReviewsIcon from '@mui/icons-material/Reviews';
import ReportGmailerrorredIcon from '@mui/icons-material/ReportGmailerrorred';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import SettingsIcon from '@mui/icons-material/Settings';
import { ADMIN_SETTINGS_EVENT, readAdminSettings } from "../components/admin/adminPanelSettings";
import { AUTH_SESSION_EVENT, clearAuthSession, getAuthProfile } from "../utils/auth";
import { LogoutConfirmModal } from "../components/common/LogoutConfirmModal";

export const AdminSidebar = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(true);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 1024 : false
  );
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [adminProfile, setAdminProfile] = useState(() => getAuthProfile());
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  const navSections = [
    {
      title: "Overview",
      items: [{ to: "dashboard", label: "Dashboard", icon: DashboardIcon }],
    },
    {
      title: "Management",
      items: [
        { to: "users", label: "Users", icon: GroupIcon },
        { to: "cars", label: "Cars", icon: DirectionsCarFilledIcon },
        { to: "testdrives", label: "Test Drives", icon: EventAvailableIcon },
        { to: "wishlists", label: "Wishlists", icon: FavoriteBorderIcon },
        { to: "purchases", label: "Purchases", icon: ReceiptLongIcon },
        { to: "offers", label: "Offers", icon: LocalOfferIcon },
        { to: "settings", label: "Settings", icon: SettingsIcon },
      ],
    },
    {
      title: "Communication",
      items: [
        { to: "inquiries", label: "Inquiries", icon: ContactSupportIcon },
        { to: "messages", label: "Messages", icon: MailOutlineIcon },
        { to: "reviews", label: "Reviews", icon: ReviewsIcon },
        { to: "reports", label: "Reports", icon: ReportGmailerrorredIcon },
      ],
    },
  ];

  useEffect(() => {
    const applySettings = () => {
      const settings = readAdminSettings();
      setCollapsed(Boolean(settings.compactSidebar));
    };

    applySettings();
    window.addEventListener(ADMIN_SETTINGS_EVENT, applySettings);

    return () => {
      window.removeEventListener(ADMIN_SETTINGS_EVENT, applySettings);
    };
  }, []);

  useEffect(() => {
    const syncProfile = () => {
      setAdminProfile(getAuthProfile());
    };

    syncProfile();
    window.addEventListener(AUTH_SESSION_EVENT, syncProfile);

    return () => {
      window.removeEventListener(AUTH_SESSION_EVENT, syncProfile);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);

      if (!mobile) {
        setMobileSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = ({ reason, details }) => {
    try {
      window.localStorage.setItem(
        "carscout.lastLogoutMeta",
        JSON.stringify({ reason, details, at: new Date().toISOString() })
      );
    } catch {
      // Ignore non-critical local storage failures.
    }

    clearAuthSession();
    setLogoutModalOpen(false);
    setMobileSidebarOpen(false);
    navigate("/");
  };

  const navStyle = ({ isActive }) =>
    isActive
      ? "bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white shadow-lg shadow-fuchsia-900/30"
      : "text-slate-300 hover:bg-slate-800 hover:text-white";

  const filteredSections = navSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) =>
        item.label.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }))
    .filter((section) => section.items.length > 0);

  const adminName = adminProfile?.name || "Admin User";
  const adminEmail = adminProfile?.email || "admin@carscout.com";
  const adminImage = adminProfile?.image || "";
  const adminRoleLabel = adminProfile?.role ? String(adminProfile.role).toUpperCase() : "ADMIN";

  const adminInitials = adminName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "A";

  const isSidebarCollapsed = isMobile ? false : collapsed;

  return (
    <div className="relative flex min-h-screen bg-gray-100">

      {isMobile && mobileSidebarOpen ? (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          className="fixed inset-0 z-30 bg-black/40"
          onClick={() => setMobileSidebarOpen(false)}
        />
      ) : null}

      {/* Sidebar */}
      <div
        className={`${
          isSidebarCollapsed ? "lg:w-20" : "lg:w-72"
        } ${
          isMobile
            ? `fixed inset-y-0 left-0 z-40 w-72 transform ${
                mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
              }`
            : "relative"
        } bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white transition-all duration-300 flex flex-col border-r border-slate-800`}
      >
        {/* Top Header + Profile */}
        <div className="border-b border-slate-800 p-4">
          <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} h-12`}>
            {!isSidebarCollapsed && (
              <Link
                to="dashboard"
                onClick={() => setMobileSidebarOpen(false)}
                className="flex items-center gap-2"
                title="Go to dashboard"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-fuchsia-600/20 text-fuchsia-300 text-sm font-bold border border-fuchsia-500/30">
                  AP
                </span>
                <span>
                  <span className="block text-lg font-bold tracking-wide text-fuchsia-300">Admin Panel</span>
                  <span className="block text-[10px] uppercase tracking-[0.22em] text-slate-500">Control Center</span>
                </span>
              </Link>
            )}
            <button
              onClick={() => {
                if (isMobile) {
                  setMobileSidebarOpen(false);
                  return;
                }

                setCollapsed(!collapsed);
              }}
              className="w-10 h-10 bg-slate-800 rounded-full hover:bg-slate-700 flex items-center justify-center border border-slate-700"
              title={isMobile ? "Close sidebar" : collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <span>{isMobile ? "X" : "☰"}</span>
            </button>
          </div>

          {!isSidebarCollapsed ? (
            <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-900/80 p-2.5 sm:p-3.5 shadow-inner shadow-black/20">
              <div className="flex items-center gap-2 sm:gap-3">
                {adminImage ? (
                  <img
                    src={adminImage}
                    alt="Admin profile"
                    className="h-8 sm:h-11 w-8 sm:w-11 rounded-full object-cover border border-slate-600 flex-shrink-0"
                  />
                ) : (
                  <div className="h-8 sm:h-11 w-8 sm:w-11 rounded-full bg-gradient-to-br from-fuchsia-600 to-violet-600 text-white flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0">
                    {adminInitials}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-semibold text-white truncate leading-tight">{adminName}</p>
                  <p className="text-[10px] sm:text-xs text-slate-400 truncate mt-0.5">{adminEmail}</p>
                </div>
              </div>

              <div className="mt-2.5 sm:mt-3 flex items-center justify-between">
                <p className="inline-flex rounded-md bg-fuchsia-500/20 px-2 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-semibold tracking-wide text-fuchsia-300 border border-fuchsia-500/30">
                  {adminRoleLabel}
                </p>
                <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Online
                </span>
              </div>
            </div>
          ) : (
            <div className="mt-3 flex justify-center">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-fuchsia-600 to-violet-600 text-white flex items-center justify-center text-xs font-bold">
                {adminInitials}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          {!isSidebarCollapsed && (
            <div className="mb-4">
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search admin modules"
                className="w-full rounded-xl border border-slate-700 bg-slate-800/90 px-3 py-2 text-sm text-slate-100 outline-none focus:border-fuchsia-500"
              />
            </div>
          )}

          {filteredSections.map((section) => (
            <div key={section.title} className="mb-4 last:mb-0">
              {!isSidebarCollapsed && (
                <p className="px-2 mb-2 text-[11px] font-semibold tracking-wider uppercase text-slate-500">
                  {section.title}
                </p>
              )}

              <div className="space-y-2">
                {section.items.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileSidebarOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'} px-4 py-2.5 rounded-xl transition ${navStyle({ isActive })}`
                      }
                      title={item.label}
                    >
                      <Icon fontSize="small" />
                      {!isSidebarCollapsed && <span>{item.label}</span>}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}

          {!isSidebarCollapsed && filteredSections.length === 0 && (
            <p className="px-2 text-sm text-slate-400">No modules found for this search.</p>
          )}
        </nav>

        {/* Bottom Controls */}
        <div className="p-4 border-t border-slate-800 space-y-2.5">
          <button
            onClick={() => {
              setMobileSidebarOpen(false);
              navigate("/");
            }}
            className={`w-full bg-slate-800 py-2.5 rounded-xl hover:bg-slate-700 border border-slate-700 flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-center gap-2'}`}
          >
            {!isSidebarCollapsed && <span>Go to Website</span>}
            {isSidebarCollapsed && <span>🏠</span>}
          </button>
          <button
            onClick={() => setLogoutModalOpen(true)}
            className={`w-full bg-red-600 py-2.5 rounded-xl hover:bg-red-700 flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-center gap-2'}`}
          >
            <LogoutIcon fontSize="small" />
            {!isSidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-800"
          >
            Menu
          </button>
          <p className="truncate text-sm font-semibold text-slate-700">Admin Panel</p>
        </div>

        <div className="p-4 sm:p-5 lg:p-6">
        <Outlet />
        </div>
      </div>

      <LogoutConfirmModal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
};