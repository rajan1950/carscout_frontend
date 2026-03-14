import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FaSearch, FaTags, FaShieldAlt, FaCarSide } from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from "axios";

const Home = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [fuelFilter, setFuelFilter] = useState("all");
  const [priceSort, setPriceSort] = useState("default");

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const res = await axios.get("http://localhost:4444/car/all");
        setCars(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load cars right now");
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
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

      {/* HERO SECTION */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-cyan-300/40 blur-3xl" />
        <div className="absolute -bottom-20 -right-16 h-72 w-72 rounded-full bg-orange-300/40 blur-3xl" />
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">

          <motion.h1
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-black tracking-tight mb-5 text-cyan-900"
          >
            Find Your Dream Ride With Car Scout
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-base md:text-lg mb-8 text-slate-700 max-w-3xl mx-auto"
          >
            Buy and sell trusted cars with transparent pricing, verified sellers,
            and a faster search experience.
          </motion.p>

          {/* SEARCH BAR */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid md:grid-cols-4 gap-3 bg-white/90 border border-cyan-100 rounded-2xl p-3 shadow-xl max-w-5xl mx-auto"
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
          </motion.div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <span className="bg-cyan-100 text-cyan-900 px-4 py-2 rounded-full text-sm font-medium">
              {visibleCars.length} cars found
            </span>
            <Link
              to="/sellcar"
              className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-full text-sm font-semibold"
            >
              List Your Car
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURE CARDS */}
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

      {/* FEATURED CARS */}
      <section className="max-w-7xl mx-auto px-6 py-16">

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

      {/* CTA SECTION */}
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