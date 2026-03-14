import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import LogoutIcon from '@mui/icons-material/Logout';

export const AdminSidebar = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    navigate("/");
  };

  const navStyle = ({ isActive }) =>
    isActive
      ? "bg-purple-600 text-white"
      : "text-gray-300 hover:bg-purple-500 hover:text-white";

  return (
    <div className="flex min-h-screen bg-gray-100">
      
      {/* Sidebar */}
      <div
        className={`${
          collapsed ? "w-20" : "w-64"
        } bg-gray-900 text-white transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className={`p-7 text-center border-b border-gray-700 flex items-center ${collapsed ? 'justify-center' : 'justify-between' } h-16`}>
          <h1 className="text-xl font-bold text-purple-400">
            {collapsed ? "" : "Admin Panel"}
          </h1>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-12 bg-gray-700 py-2 px-4 text-center rounded hover:bg-gray-600"
          >
            <p>☰</p>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <NavLink
            to="dashboard"
            className={({ isActive }) =>
              `block px-4 py-2 rounded ${navStyle({ isActive })}`
            }
          >
            Dashboard 
          </NavLink>
          <NavLink
            to="users"
            className={({ isActive }) =>
              `block px-4 py-2 rounded ${navStyle({ isActive })}`
            }
          >
            Users
          </NavLink>
          <NavLink
            to="cars"
            className={({ isActive }) =>
              `block px-4 py-2 rounded ${navStyle({ isActive })}`
            }
          >
            Cars
          </NavLink>
          <NavLink
            to="inquiries"
            className={({ isActive }) =>
              `block px-4 py-2 rounded ${navStyle({ isActive })}`
            }
          >
            Inquiries
          </NavLink>
        </nav>

        {/* Bottom Controls */}
        <div className="p-4 border-t border-gray-700 space-y-2">
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 py-2 rounded hover:bg-red-700"
          >
           {collapsed ? <LogoutIcon className="ml-2" /> : "Logout"} 
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