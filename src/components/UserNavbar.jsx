import { useEffect, useMemo, useRef, useState } from "react";
import { FaCarSide, FaChevronDown, FaUserCircle } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import {
  AUTH_SESSION_EVENT,
  clearAuthSession,
  getAuthProfile,
} from "../utils/auth";

const navItems = [
  { label: "Browse Cars", href: "#featured-cars", type: "anchor" },
  { label: "Sell Car", to: "/sellcar", type: "route" },
  { label: "Login", to: "/login", type: "route" },
  { label: "Signup", to: "/signup", type: "route" },
  { label: "Admin", to: "/adminpanel", type: "route" },
];

const UserNavbar = () => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profile, setProfile] = useState(() => getAuthProfile());

  useEffect(() => {
    const syncProfile = () => {
      setProfile(getAuthProfile());
    };

    const closeOnOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    window.addEventListener(AUTH_SESSION_EVENT, syncProfile);
    window.addEventListener("storage", syncProfile);
    document.addEventListener("mousedown", closeOnOutsideClick);

    return () => {
      window.removeEventListener(AUTH_SESSION_EVENT, syncProfile);
      window.removeEventListener("storage", syncProfile);
      document.removeEventListener("mousedown", closeOnOutsideClick);
    };
  }, []);

  const visibleItems = navItems.filter((item) => {
    if (item.label === "Admin") {
      return profile.isAdmin;
    }

    if (profile.isLoggedIn) {
      return item.label !== "Login" && item.label !== "Signup";
    }

    return true;
  });

  const initials = useMemo(() => {
    const words = String(profile.name || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }

    if (words.length === 1) {
      return words[0].slice(0, 2).toUpperCase();
    }

    return "PR";
  }, [profile.name]);

  const handleLogout = () => {
    clearAuthSession();
    setOpen(false);
    setProfileOpen(false);
    navigate("/login");
  };

  const hasCompleteProfile =
    Boolean(profile.mobile) &&
    Boolean(profile.address) &&
    Boolean(profile.city) &&
    Boolean(profile.area) &&
    Boolean(profile.pinCode);

  const navButtonClass =
    "inline-flex items-center justify-center rounded-full border border-cyan-300 px-4 py-2 text-base font-semibold text-slate-700 transition hover:border-cyan-600 hover:text-cyan-700 hover:bg-cyan-50";

  return (
    <header className="sticky top-0 z-30 border-b border-cyan-100/80 bg-white/85 backdrop-blur shadow-sm bg-gradient-to-b from-white/95 to-white/80 text-slate-900">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-3">
        <Link
          to="/"
          className="group inline-flex items-center gap-3 text-xl md:text-2xl font-black tracking-tight text-cyan-900"
        >
          <span>Car Scout</span>
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-cyan-200 bg-gradient-to-br from-cyan-700 to-sky-600 text-white shadow-sm transition group-hover:scale-105 group-hover:shadow-md">
            <FaCarSide className="text-sm" />
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-2">
          <nav className="hidden md:flex items-center gap-3">
            {visibleItems.map((item) =>
              item.type === "anchor" ? (
                <a key={item.label} href={item.href} className={navButtonClass}>
                  {item.label}
                </a>
              ) : (
                <Link key={item.label} to={item.to} className={navButtonClass}>
                  {item.label}
                </Link>
              )
            )}
          </nav>

          {profile.isLoggedIn && (
            <div className="relative hidden md:block" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setProfileOpen((prev) => !prev)}
                className="inline-flex items-center gap-2 rounded-full border border-cyan-300 bg-white px-2 py-1 hover:border-cyan-600"
                aria-label="Open profile menu"
              >
                {profile.image ? (
                  <img
                    src={profile.image}
                    alt="Profile"
                    className="h-8 w-8 rounded-full border border-cyan-200 object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-700 text-xs font-bold text-white">
                    {initials}
                  </div>
                )}
                <span className="max-w-24 truncate text-sm font-semibold text-slate-700">
                  {profile.name}
                </span>
                <FaChevronDown className="text-xs text-slate-500" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-cyan-100 bg-white p-3 shadow-lg">
                  <div className="flex items-center gap-3 rounded-xl bg-cyan-50 p-3">
                    {profile.image ? (
                      <img
                        src={profile.image}
                        alt="Profile"
                        className="h-10 w-10 rounded-full border border-cyan-200 object-cover"
                      />
                    ) : (
                      <FaUserCircle className="h-10 w-10 text-cyan-700" />
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">{profile.name}</p>
                      <p className="truncate text-xs text-slate-500">{profile.email || "Signed in user"}</p>
                    </div>
                  </div>

                  <div className="mt-3 space-y-2">
                    <Link
                      to="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="block rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:border-cyan-300 hover:bg-cyan-50"
                    >
                      {hasCompleteProfile ? "Profile" : "Complete Profile"}
                    </Link>

                    <Link
                      to="/"
                      onClick={() => setProfileOpen(false)}
                      className="block rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:border-cyan-300 hover:bg-cyan-50"
                    >
                      Home
                    </Link>
                    {profile.isAdmin && (
                      <Link
                        to="/adminpanel"
                        onClick={() => setProfileOpen(false)}
                        className="block rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:border-cyan-300 hover:bg-cyan-50"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-700"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="md:hidden rounded-full border border-cyan-300 px-4 py-2 text-cyan-900 font-semibold"
            aria-label="Toggle menu"
          >
            {open ? "X" : "Menu"}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-cyan-100 bg-white/95 px-6 py-3">
          {profile.isLoggedIn && (
            <div className="mb-3 flex items-center gap-3 rounded-xl border border-cyan-100 bg-cyan-50 p-3">
              {profile.image ? (
                <img
                  src={profile.image}
                  alt="Profile"
                  className="h-10 w-10 rounded-full border border-cyan-200 object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-700 text-sm font-bold text-white">
                  {initials}
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800">{profile.name}</p>
                <p className="truncate text-xs text-slate-500">{profile.email || "Signed in user"}</p>
              </div>
            </div>
          )}

          <nav className="flex flex-col gap-3">
            {visibleItems.map((item) =>
              item.type === "anchor" ? (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={navButtonClass}
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={navButtonClass}
                >
                  {item.label}
                </Link>
              )
            )}

            {profile.isLoggedIn && (
              <Link
                to="/profile"
                onClick={() => setOpen(false)}
                className={navButtonClass}
              >
                {hasCompleteProfile ? "Profile" : "Complete Profile"}
              </Link>
            )}

            {profile.isLoggedIn && (
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center justify-center rounded-full bg-rose-600 px-4 py-2 text-base font-semibold text-white transition hover:bg-rose-700"
              >
                Logout
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default UserNavbar;
