import { NavLink, Outlet, useNavigate } from "react-router-dom";

export const CustomerNavbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/");
  };

  const navStyle = ({ isActive }) =>
    isActive
      ? "text-blue-600 font-semibold border-b-2 border-blue-600"
      : "text-gray-600 hover:text-blue-500";

  return (
    <>
      <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">CarScout - Customer</h1>

        <div className="flex gap-6">
          <NavLink to="carlist" className={navStyle}>Car List</NavLink>
          <NavLink to="cardetails" className={navStyle}>Car Details</NavLink>
          <NavLink to="getapidemo" className={navStyle}>API Demo</NavLink>
          <NavLink to="useeffectdemo" className={navStyle}>UseEffect</NavLink>
        </div>

        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </nav>

      <div className="p-6">
        <Outlet />
      </div>
    </>
  );
};