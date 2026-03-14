import { useState } from "react";
import { Link } from "react-router-dom";

const navItems = [
  { label: "Browse Cars", href: "#featured-cars", type: "anchor" },
  { label: "Sell Car", to: "/sellcar", type: "route" },
  { label: "Login", to: "/login", type: "route" },
  { label: "Signup", to: "/signup", type: "route" },
  { label: "Admin", to: "/adminpanel", type: "route" },
];

const UserNavbar = () => {
  const [open, setOpen] = useState(false);
  const navButtonClass =
    "inline-flex items-center justify-center rounded-full border border-cyan-300 px-4 py-2 text-base font-semibold text-slate-700 transition hover:border-cyan-600 hover:text-cyan-700 hover:bg-cyan-50";

  return (
    <header className="sticky top-0 z-30 border-b border-cyan-100/80 bg-white/85 backdrop-blur shadow-sm gradient-to-b from-white/95 to-white/80 text-slate-900 ">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-3">
        <Link to="/" className="text-xl md:text-2xl font-black tracking-tight text-cyan-900">
          Car Scout
        </Link>

        <div className="ml-auto flex items-center gap-2">
          <nav className="hidden md:flex items-center gap-3">
            {navItems.map((item) =>
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
          <nav className="flex flex-col gap-3">
            {navItems.map((item) =>
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
          </nav>
        </div>
      )}
    </header>
  );
};

export default UserNavbar;
