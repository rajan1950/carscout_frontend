import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { clearAuthSession, getAuthProfile } from "../../utils/auth";
import { FaCarSide } from "react-icons/fa";

export const CustomerNavbar = () => {
  const navigate = useNavigate();
  const profile = getAuthProfile();

  const handleLogout = () => {
    clearAuthSession();
    navigate("/login");
  };

  const navStyle = ({ isActive }) =>
    isActive
      ? "text-cyan-800 font-semibold bg-cyan-50 border border-cyan-200"
      : "text-slate-600 hover:text-cyan-700 border border-transparent hover:bg-cyan-50";

  const navBase = "rounded-full px-4 py-2 text-sm transition";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#ecfeff,_#f8fafc_40%,_#f5f3ff)]">
      <nav className="sticky top-0 z-20 border-b border-cyan-100 bg-white/90 backdrop-blur px-4 sm:px-6 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-wrap gap-3 justify-between items-center">
          <div className="inline-flex items-center gap-3 text-cyan-900 font-black text-xl">
            <span>Car Scout Buyer</span>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-700 to-sky-600 text-white">
              <FaCarSide className="text-sm" />
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* <NavLink to="/" className={(args) => `${navStyle(args)} ${navBase}`}>Home</NavLink>
            <NavLink to="/customer" className={(args) => `${navStyle(args)} ${navBase}`}>Buyer Dashboard</NavLink>
            <NavLink to="/sellcar" className={(args) => `${navStyle(args)} ${navBase}`}>Sell Car</NavLink> */}
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:block rounded-full border border-cyan-200 px-3 py-1.5 text-sm text-slate-700 bg-cyan-50">
              {profile.name}
            </div>
            <button
              onClick={handleLogout}
              className="bg-rose-600 text-white px-4 py-2 rounded-full hover:bg-rose-700 text-sm font-semibold"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <Outlet />
      </div>
    </div>
  );
};