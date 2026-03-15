import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import GroupIcon from '@mui/icons-material/Group';
import DirectionsCarFilledIcon from '@mui/icons-material/DirectionsCarFilled';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import ReviewsIcon from '@mui/icons-material/Reviews';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import SettingsIcon from '@mui/icons-material/Settings';
import { ADMIN_SETTINGS_EVENT, readAdminSettings } from "./adminPanelSettings";
import { clearAuthSession } from "../../utils/auth";

export const AdminSidebar = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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
      ],
    },
    {
      title: "Communication",
      items: [
        { to: "inquiries", label: "Inquiries", icon: ContactSupportIcon },
        { to: "messages", label: "Messages", icon: MailOutlineIcon },
        { to: "reviews", label: "Reviews", icon: ReviewsIcon },
      ],
    },
    {
      title: "System",
      items: [{ to: "settings", label: "Settings", icon: SettingsIcon }],
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

  const handleLogout = () => {
    clearAuthSession();
    navigate("/");
  };

  const navStyle = ({ isActive }) =>
    isActive
      ? "bg-purple-600 text-white shadow"
      : "text-gray-300 hover:bg-purple-500 hover:text-white";

  const filteredSections = navSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) =>
        item.label.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <div className="flex min-h-screen bg-gray-100">
      
      {/* Sidebar */}
      <div
        className={`${
          collapsed ? "w-20" : "w-64"
        } bg-gray-900 text-white transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className={`p-4 border-b border-gray-700 flex items-center ${collapsed ? 'justify-center' : 'justify-between' } h-16`}>
          {!collapsed && (
            <Link
              to="dashboard"
              className="font-bold text-purple-400 tracking-wide text-xl"
              title="Go to dashboard"
            >
              Admin Panel
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-10 h-10 bg-gray-700 rounded-full hover:bg-gray-600 flex items-center justify-center"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <span>☰</span>
          </button>
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
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 outline-none focus:border-purple-500"
              />
            </div>
          )}

          {filteredSections.map((section) => (
            <div key={section.title} className="mb-4 last:mb-0">
              {!collapsed && (
                <p className="px-2 mb-2 text-[11px] font-semibold tracking-wider uppercase text-gray-500">
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
                        `flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-4 py-2 rounded ${navStyle({ isActive })}`
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
            <p className="px-2 text-sm text-gray-400">No modules found for this search.</p>
          )}
        </nav>

        {/* Bottom Controls */}
        <div className="p-4 border-t border-gray-700 space-y-2">
          <button
            onClick={() => navigate("/")}
            className={`w-full bg-gray-700 py-2 rounded hover:bg-gray-600 flex items-center ${collapsed ? 'justify-center' : 'justify-center gap-2'}`}
          >
            {!collapsed && <span>Go to Website</span>}
            {collapsed && <span>🏠</span>}
          </button>
          <button
            onClick={handleLogout}
            className={`w-full bg-red-600 py-2 rounded hover:bg-red-700 flex items-center ${collapsed ? 'justify-center' : 'justify-center gap-2'}`}
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