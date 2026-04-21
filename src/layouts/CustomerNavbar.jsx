import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { clearAuthSession, getAuthProfile } from "../utils/auth";
import { FaCarSide } from "react-icons/fa";
import { NotificationBell } from "../components/notifications/NotificationBell";
import { useEffect, useState } from "react";
import { LogoutConfirmModal } from "../components/common/LogoutConfirmModal";

export const CustomerNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const profile = getAuthProfile();
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    setMobileMenuOpen(false);
    navigate("/login");
  };

  const navBase = "rounded-full px-4 py-2 text-sm font-semibold transition border";

  const navStyle = ({ isActive }) =>
    `${navBase} ${
      isActive
        ? "text-cyan-800 bg-cyan-50 border-cyan-200"
        : "text-slate-600 border-transparent hover:text-cyan-700 hover:bg-cyan-50"
    }`;

  const isWishlistActive =
    location.pathname === "/customer" &&
    new URLSearchParams(location.search).get("view") === "wishlist";

  const wishlistStyle = `${navBase} ${
    isWishlistActive
      ? "text-cyan-800 bg-cyan-50 border-cyan-200"
      : "text-slate-600 border-transparent hover:text-cyan-700 hover:bg-cyan-50"
  }`;

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname, location.search]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#ecfeff,_#f8fafc_40%,_#f5f3ff)]">
      <nav className="sticky top-0 z-20 border-b border-cyan-100 bg-white/90 backdrop-blur px-4 sm:px-6 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex gap-3 justify-between items-center">
          <div className="inline-flex items-center gap-2 sm:gap-3 text-cyan-900 font-black text-lg sm:text-xl">
            <span className="truncate">Car Scout Buyer</span>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-700 to-sky-600 text-white">
              <FaCarSide className="text-sm" />
            </span>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="sm:hidden rounded-full border border-cyan-200 bg-white px-3 py-1.5 text-sm font-semibold text-cyan-900"
          >
            {mobileMenuOpen ? "Close" : "Menu"}
          </button>

          <div className="hidden sm:flex items-center gap-2">
            <NavLink
              to="/customer"
              end
              className={navStyle}
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/customer?view=wishlist"
              className={() => wishlistStyle}
            >
              Wishlist
            </NavLink>
            <NavLink to="/customer/compare" className={navStyle}>
              Compare
            </NavLink>
            <NavLink to="/customer/offers" className={navStyle}>
              Offers
            </NavLink>
            <NavLink to="/notifications" className={navStyle}>
              Notifications
            </NavLink>
            <NotificationBell />
            <div className="hidden sm:block rounded-full border border-cyan-200 px-3 py-1.5 text-sm text-slate-700 bg-cyan-50">
              {profile.name}
            </div>

            <button
              onClick={() => setLogoutModalOpen(true)}
              className="bg-rose-600 text-white px-4 py-2 rounded-full hover:bg-rose-700 text-sm font-semibold"
            >
              Logout
            </button>
          </div>
        </div>

        {mobileMenuOpen ? (
          <div className="sm:hidden mt-3 border-t border-cyan-100 pt-3">
            <div className="grid grid-cols-2 gap-2">
              <NavLink
                to="/customer"
                end
                onClick={() => setMobileMenuOpen(false)}
                className={navStyle}
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/customer?view=wishlist"
                onClick={() => setMobileMenuOpen(false)}
                className={() => wishlistStyle}
              >
                Wishlist
              </NavLink>
              <NavLink
                to="/customer/compare"
                onClick={() => setMobileMenuOpen(false)}
                className={navStyle}
              >
                Compare
              </NavLink>
              <NavLink
                to="/customer/offers"
                onClick={() => setMobileMenuOpen(false)}
                className={navStyle}
              >
                Offers
              </NavLink>
              <NavLink
                to="/notifications"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) => `${navStyle({ isActive })} col-span-2 text-center`}
              >
                Notifications
              </NavLink>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <div className="min-w-0 flex-1 rounded-full border border-cyan-200 px-3 py-1.5 text-sm text-slate-700 bg-cyan-50 truncate">
                {profile.name}
              </div>
              <NotificationBell />
              <button
                onClick={() => setLogoutModalOpen(true)}
                className="bg-rose-600 text-white px-4 py-2 rounded-full hover:bg-rose-700 text-sm font-semibold"
              >
                Logout
              </button>
            </div>
          </div>
        ) : null}
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <Outlet />
      </div>

      <LogoutConfirmModal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
};