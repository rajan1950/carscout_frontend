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
import SettingsIcon from '@mui/icons-material/Settings';
import { ADMIN_SETTINGS_EVENT, readAdminSettings } from "../components/admin/adminPanelSettings";
import { AUTH_SESSION_EVENT, clearAuthSession, getAuthProfile } from "../utils/auth";

export const AdminSidebar = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [adminProfile, setAdminProfile] = useState(() => getAuthProfile());

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

  const handleLogout = () => {
    clearAuthSession();
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

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <div
        className={`${
          collapsed ? "w-20" : "w-72"
        } bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white transition-all duration-300 flex flex-col border-r border-slate-800`}
      >
        {/* Top Header + Profile */}
        <div className="border-b border-slate-800 p-4">
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} h-12`}>
            {!collapsed && (
              <Link
                to="dashboard"
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
              onClick={() => setCollapsed(!collapsed)}
              className="w-10 h-10 bg-slate-800 rounded-full hover:bg-slate-700 flex items-center justify-center border border-slate-700"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <span>☰</span>
            </button>
          </div>

          {!collapsed ? (
            <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-900/80 p-3.5 shadow-inner shadow-black/20">
              <div className="flex items-center gap-3">
                {adminImage ? (
                  <img
                    src={adminImage}
                    alt="Admin profile"
                    className="h-11 w-11 rounded-full object-cover border border-slate-600"
                  />
                ) : (
                  <div className="h-11 w-11 rounded-full bg-gradient-to-br from-fuchsia-600 to-violet-600 text-white flex items-center justify-center text-sm font-bold">
                    {adminInitials}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate leading-tight">{adminName}</p>
                  <p className="text-xs text-slate-400 truncate mt-0.5">{adminEmail}</p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <p className="inline-flex rounded-md bg-fuchsia-500/20 px-2 py-1 text-[11px] font-semibold tracking-wide text-fuchsia-300 border border-fuchsia-500/30">
                  {adminRoleLabel}
                </p>
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-300">
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
          {!collapsed && (
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
              {!collapsed && (
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
                      className={({ isActive }) =>
                        `flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-4 py-2.5 rounded-xl transition ${navStyle({ isActive })}`
                      }
                      title={item.label}
                    >
                      <Icon fontSize="small" />
                      {!collapsed && <span>{item.label}</span>}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}

          {!collapsed && filteredSections.length === 0 && (
            <p className="px-2 text-sm text-slate-400">No modules found for this search.</p>
          )}
        </nav>

        {/* Bottom Controls */}
        <div className="p-4 border-t border-slate-800 space-y-2.5">
          <button
            onClick={() => navigate("/")}
            className={`w-full bg-slate-800 py-2.5 rounded-xl hover:bg-slate-700 border border-slate-700 flex items-center ${collapsed ? 'justify-center' : 'justify-center gap-2'}`}
          >
            {!collapsed && <span>Go to Website</span>}
            {collapsed && <span>🏠</span>}
          </button>
          <button
            onClick={handleLogout}
            className={`w-full bg-red-600 py-2.5 rounded-xl hover:bg-red-700 flex items-center ${collapsed ? 'justify-center' : 'justify-center gap-2'}`}
          >
            <LogoutIcon fontSize="small" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <Outlet />
      </div>
    </div>
  );
};