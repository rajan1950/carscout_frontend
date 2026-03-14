import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  FaSearch,
  FaTags,
  FaShieldAlt,
  FaCarSide,
  FaUsers,
  FaEnvelope,
  FaStar,
  FaTools,
  FaClipboardCheck,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from "axios";
import UserNavbar from "../../components/UserNavbar";

const Home = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [fuelFilter, setFuelFilter] = useState("all");
  const [priceSort, setPriceSort] = useState("default");
  const [platformStats, setPlatformStats] = useState({
    users: 0,
    cars: 0,
    inquiries: 0,
    messages: 0,
    reviews: 0,
    testDrives: 0,
  });

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [carsRes, summaryRes, messageRes, reviewRes, testDriveRes] =
          await Promise.allSettled([
            axios.get("http://localhost:4444/car/all"),
            axios.get("http://localhost:4444/admin/dashboard"),
            axios.get("http://localhost:4444/message/all"),
            axios.get("http://localhost:4444/reviews/all"),
            axios.get("http://localhost:4444/testdrive/all"),
          ]);

        if (carsRes.status === "fulfilled") {
          setCars(Array.isArray(carsRes.value.data) ? carsRes.value.data : []);
        } else {
          setError("Unable to load cars right now");
        }

        const summaryData =
          summaryRes.status === "fulfilled" ? summaryRes.value.data : {};

        const messages =
          messageRes.status === "fulfilled" && Array.isArray(messageRes.value.data)
            ? messageRes.value.data.length
            : 0;

        const reviews =
          reviewRes.status === "fulfilled" && Array.isArray(reviewRes.value.data)
            ? reviewRes.value.data.length
            : 0;

        const testDrives =
          testDriveRes.status === "fulfilled" && Array.isArray(testDriveRes.value.data)
            ? testDriveRes.value.data.length
            : 0;

        setPlatformStats({
          users: summaryData.users || 0,
          cars: summaryData.cars || 0,
          inquiries: summaryData.inquiries || 0,
          messages,
          reviews,
          testDrives,
        });
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load cars right now");
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const visibleCars = useMemo(() => {
    let items = [...cars];

    if (query.trim()) {
      const q = query.toLowerCase();
      items = items.filter(
        (car) =>
          `${car.brand || ""} ${car.model || ""}`.toLowerCase().includes(q)
      );
    }

    if (fuelFilter !== "all") {
      items = items.filter(
        (car) => (car.fuelType || "").toLowerCase() === fuelFilter
      );
    }

    if (priceSort === "low") {
      items.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    }

    if (priceSort === "high") {
      items.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    }

    return items;
  }, [cars, query, fuelFilter, priceSort]);

  const formatPrice = (price) => {
    const numeric = Number(price || 0);
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(numeric);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#d6f6ff,_#f8fbff_45%,_#eef6ff)] text-slate-900">
      <UserNavbar />

      <section className="relative overflow-hidden py-20">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-cyan-300/40 blur-3xl" />
        <div className="absolute -bottom-20 -right-16 h-72 w-72 rounded-full bg-orange-300/40 blur-3xl" />
        <div className="max-w-7xl mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-10 items-center">
          <div className="text-center lg:text-left">
            <motion.h1
              initial={{ opacity: 0, y: -40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-6xl font-black tracking-tight mb-5 text-cyan-900"
            >
              Smart Car Marketplace Powered By Car Scout
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-base md:text-lg mb-8 text-slate-700 max-w-2xl"
            >
              Buy and sell cars with a complete platform that includes inquiry handling,
              reviews, test-drive tracking, message flow, and admin-level management.
            </motion.p>

            <div className="flex flex-wrap items-center gap-3 justify-center lg:justify-start">
              <Link
                to="/sellcar"
                className="bg-cyan-700 hover:bg-cyan-800 text-white px-6 py-3 rounded-full text-sm font-semibold"
              >
                Start Selling
              </Link>
              <a
                href="#featured-cars"
                className="border border-cyan-300 hover:border-cyan-700 px-6 py-3 rounded-full text-sm font-semibold text-cyan-900"
              >
                Browse Cars
              </a>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid md:grid-cols-4 gap-3 bg-white/95 border border-cyan-100 rounded-2xl p-4 shadow-xl"
          >
            <div className="md:col-span-2 flex bg-white rounded-xl overflow-hidden border border-slate-200">
              <input
                type="text"
                placeholder="Search by brand, model..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 px-4 py-3 text-slate-700 outline-none"
              />
              <button
                type="button"
                className="bg-cyan-700 hover:bg-cyan-800 px-6 flex items-center text-white"
              >
                <FaSearch />
              </button>
            </div>

            <select
              value={fuelFilter}
              onChange={(e) => setFuelFilter(e.target.value)}
              className="px-4 py-3 rounded-xl border border-slate-200 bg-white outline-none"
            >
              <option value="all">All Fuel</option>
              <option value="petrol">Petrol</option>
              <option value="diesel">Diesel</option>
              <option value="electric">Electric</option>
            </select>

            <select
              value={priceSort}
              onChange={(e) => setPriceSort(e.target.value)}
              className="px-4 py-3 rounded-xl border border-slate-200 bg-white outline-none"
            >
              <option value="default">Sort Price</option>
              <option value="low">Low to High</option>
              <option value="high">High to Low</option>
            </select>

            <div className="md:col-span-4 flex flex-wrap items-center justify-between gap-3 mt-1">
              <span className="bg-cyan-100 text-cyan-900 px-4 py-2 rounded-full text-sm font-medium">
                {visibleCars.length} cars found
              </span>
              <Link
                to="/adminpanel/dashboard"
                className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-full text-sm font-semibold"
              >
                Open Admin Dashboard
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-10">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-white border border-cyan-100 shadow-sm p-5">
            <FaCarSide className="text-2xl text-cyan-700 mb-3" />
            <h3 className="font-bold text-lg">Huge Car Inventory</h3>
            <p className="text-sm text-slate-600 mt-1">Browse latest and pre-owned vehicles in one place.</p>
          </div>
          <div className="rounded-2xl bg-white border border-cyan-100 shadow-sm p-5">
            <FaTags className="text-2xl text-orange-500 mb-3" />
            <h3 className="font-bold text-lg">Competitive Prices</h3>
            <p className="text-sm text-slate-600 mt-1">Transparent deals with no hidden surprises.</p>
          </div>
          <div className="rounded-2xl bg-white border border-cyan-100 shadow-sm p-5">
            <FaShieldAlt className="text-2xl text-emerald-600 mb-3" />
            <h3 className="font-bold text-lg">Trusted Listings</h3>
            <p className="text-sm text-slate-600 mt-1">Reliable sellers and quality-first marketplace.</p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-10">
        <div className="rounded-3xl bg-white border border-slate-200 shadow p-6">
          <h2 className="text-2xl font-black text-slate-900 mb-4">Platform Functionality Snapshot</h2>
          <p className="text-slate-600 mb-6">
            Home is now aligned with admin panel capabilities so users can understand the full system flow.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 text-center">
              <p className="text-xs uppercase text-blue-700 font-semibold">Users</p>
              <p className="text-2xl font-black text-blue-900">{platformStats.users}</p>
            </div>
            <div className="rounded-xl bg-green-50 border border-green-100 p-4 text-center">
              <p className="text-xs uppercase text-green-700 font-semibold">Cars</p>
              <p className="text-2xl font-black text-green-900">{platformStats.cars}</p>
            </div>
            <div className="rounded-xl bg-purple-50 border border-purple-100 p-4 text-center">
              <p className="text-xs uppercase text-purple-700 font-semibold">Inquiries</p>
              <p className="text-2xl font-black text-purple-900">{platformStats.inquiries}</p>
            </div>
            <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-4 text-center">
              <p className="text-xs uppercase text-indigo-700 font-semibold">Messages</p>
              <p className="text-2xl font-black text-indigo-900">{platformStats.messages}</p>
            </div>
            <div className="rounded-xl bg-amber-50 border border-amber-100 p-4 text-center">
              <p className="text-xs uppercase text-amber-700 font-semibold">Reviews</p>
              <p className="text-2xl font-black text-amber-900">{platformStats.reviews}</p>
            </div>
            <div className="rounded-xl bg-rose-50 border border-rose-100 p-4 text-center">
              <p className="text-xs uppercase text-rose-700 font-semibold">Test Drives</p>
              <p className="text-2xl font-black text-rose-900">{platformStats.testDrives}</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
              <FaUsers className="text-blue-600 mb-2" />
              <h3 className="font-bold">User and Role Control</h3>
              <p className="text-sm text-slate-600 mt-1">Admin manages buyers, sellers, and statuses in one dashboard.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
              <FaEnvelope className="text-indigo-600 mb-2" />
              <h3 className="font-bold">Inquiry and Messaging</h3>
              <p className="text-sm text-slate-600 mt-1">User communication is tracked through inquiry and message modules.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
              <FaStar className="text-amber-500 mb-2" />
              <h3 className="font-bold">Reviews and Trust</h3>
              <p className="text-sm text-slate-600 mt-1">Rating and comments help buyers choose with confidence.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
              <FaClipboardCheck className="text-rose-600 mb-2" />
              <h3 className="font-bold">Test Drive Scheduling</h3>
              <p className="text-sm text-slate-600 mt-1">Bookings are managed with date, location, and status workflow.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
              <FaTools className="text-slate-700 mb-2" />
              <h3 className="font-bold">Configurable Settings</h3>
              <p className="text-sm text-slate-600 mt-1">Admin settings control dashboard experience and defaults.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
              <FaCarSide className="text-cyan-700 mb-2" />
              <h3 className="font-bold">Inventory Operations</h3>
              <p className="text-sm text-slate-600 mt-1">Cars can be created, updated, filtered, and showcased quickly.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="featured-cars" className="max-w-7xl mx-auto px-6 py-16">

        <h2 className="text-3xl font-black text-center mb-12 text-slate-900">Featured Cars</h2>

        {loading && <p className="text-center text-slate-600">Loading cars...</p>}
        {error && <p className="text-center text-red-600">{error}</p>}

        {!loading && !error && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {visibleCars.slice(0, 9).map((car) => (
              <motion.div
                whileHover={{ y: -6 }}
                key={car._id}
                className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden"
              >
                <img
                  src="https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=900&q=80"
                  alt={`${car.brand || "Car"} ${car.model || ""}`}
                  className="h-48 w-full object-cover"
                />

                <div className="p-4">
                  <h3 className="text-xl font-bold text-slate-900">
                    {car.brand || "Unknown"} {car.model || "Model"}
                  </h3>

                  <p className="text-slate-500">
                    {car.year || "N/A"} • {car.fuelType || "N/A"} • {car.transmission || "N/A"}
                  </p>

                  <p className="text-cyan-700 font-bold mt-2 text-lg">{formatPrice(car.price)}</p>

                  <p className="text-sm text-slate-600 mt-1">Mileage: {car.mileage || "N/A"} km</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && !error && visibleCars.length === 0 && (
          <p className="text-center text-slate-500">No matching cars found. Try another search.</p>
        )}
      </section>

      <section className="bg-gradient-to-r from-cyan-700 to-sky-600 text-white py-16 text-center">

        <h2 className="text-3xl font-bold mb-4">
          Ready to Sell Your Car?
        </h2>

        <p className="mb-6">
          List your car and reach thousands of buyers instantly.
        </p>

        <Link to="/sellcar">
          <button className="bg-white text-cyan-700 px-8 py-3 rounded-lg font-semibold hover:scale-105 transition">
            Sell Your Car
          </button>
        </Link>

      </section>

    </div>
  );
};

export default Home;