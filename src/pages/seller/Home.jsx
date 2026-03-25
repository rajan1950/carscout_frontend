import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  FaSearch,
  FaArrowRight,
  FaCheckCircle,
  FaBolt,
  FaGasPump,
  FaRoad,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from "axios";
import UserNavbar from "../../components/UserNavbar";
import { isAdminAuthenticated } from "../../utils/auth";
import SellCarModel from "../../components/seller/SellCarModel";
import { CAR_IMAGE_FALLBACK, resolveCarImageFromCar } from "../../utils/carImage";

const Home = () => {
  const canOpenAdminPanel = isAdminAuthenticated();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [fuelFilter, setFuelFilter] = useState("all");
  const [priceSort, setPriceSort] = useState("default");
  const [savedCars, setSavedCars] = useState([]);
  const [isSellWizardOpen, setIsSellWizardOpen] = useState(false);
  const [platformStats, setPlatformStats] = useState({
    cars: 0,
    inquiries: 0,
    testDrives: 0,
  });

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [carsRes, summaryRes, testDriveRes] =
          await Promise.allSettled([
            axios.get("http://localhost:4444/car/all"),
            axios.get("http://localhost:4444/admin/dashboard"),
            axios.get("http://localhost:4444/testdrive/all"),
          ]);

        if (carsRes.status === "fulfilled") {
          setCars(Array.isArray(carsRes.value.data) ? carsRes.value.data : []);
        } else {
          setError("Unable to load cars right now");
        }

        const summaryData =
          summaryRes.status === "fulfilled" ? summaryRes.value.data : {};

        const testDrives =
          testDriveRes.status === "fulfilled" && Array.isArray(testDriveRes.value.data)
            ? testDriveRes.value.data.length
            : 0;

        setPlatformStats({
          cars: summaryData.cars || 0,
          inquiries: summaryData.inquiries || 0,
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

  const toggleSave = (carId) => {
    setSavedCars((prev) =>
      prev.includes(carId) ? prev.filter((id) => id !== carId) : [...prev, carId]
    );
  };

  const featuredCars = visibleCars.slice(0, 9);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f5f0e8_0%,_#f8f7f3_35%,_#eff3f4_100%)] text-slate-900">
      <UserNavbar />

      <section className="relative overflow-hidden py-16 md:py-20">
        <div className="absolute -top-24 -left-20 h-72 w-72 rounded-full bg-amber-300/30 blur-3xl" />
        <div className="absolute -bottom-16 -right-14 h-72 w-72 rounded-full bg-emerald-300/25 blur-3xl" />
        <div className="max-w-7xl mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="uppercase tracking-[0.2em] text-xs md:text-sm text-amber-700 font-semibold mb-4">
              Premium Automotive Marketplace
            </p>
            <motion.h1
              initial={{ opacity: 0, y: -40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-6xl font-black tracking-tight mb-5 text-slate-900"
            >
              Buy Smarter. Sell Faster. Trade With Confidence.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-base md:text-lg mb-8 text-slate-700 max-w-2xl leading-relaxed"
            >
              Car Scout is built for both sides of the market. Buyers get verified inventory,
              smart filtering, and quick actions. Sellers get faster listing flow, better visibility,
              and lead-ready inquiries.
            </motion.p>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/customer"
                className="inline-flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-full text-sm font-semibold"
              >
                Start Buying <FaArrowRight />
              </Link>
              <button
                type="button"
                onClick={() => setIsSellWizardOpen(true)}
                className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-full text-sm font-semibold"
              >
                Start Selling <FaArrowRight />
              </button>
              <a
                href="#featured-cars"
                className="border border-slate-300 hover:border-slate-700 px-6 py-3 rounded-full text-sm font-semibold text-slate-800"
              >
                Explore Inventory
              </a>
            </div>

            <div className="grid sm:grid-cols-3 gap-3 mt-8">
              <div className="rounded-xl bg-white/90 border border-slate-200 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">Available Cars</p>
                <p className="text-2xl font-black text-slate-900">{platformStats.cars}</p>
              </div>
              <div className="rounded-xl bg-white/90 border border-slate-200 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">Buyer Activity</p>
                <p className="text-2xl font-black text-slate-900">{platformStats.inquiries}</p>
              </div>
              <div className="rounded-xl bg-white/90 border border-slate-200 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">Test Drives</p>
                <p className="text-2xl font-black text-slate-900">{platformStats.testDrives}</p>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid md:grid-cols-4 gap-3 bg-white/95 border border-slate-200 rounded-2xl p-4 shadow-xl"
          >
            <div className="md:col-span-4 rounded-xl bg-gradient-to-r from-slate-900 to-slate-700 text-white p-4">
              <p className="text-xs uppercase tracking-wider text-slate-300">Deal Engine</p>
              <h3 className="text-lg font-bold">Buyer + Seller Functions In One Screen</h3>
              <p className="text-sm text-slate-200 mt-1">
                Search, compare, save favorites, and instantly move into buy or sell journeys.
              </p>
            </div>

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
                className="bg-slate-900 hover:bg-black px-6 flex items-center text-white"
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
              <span className="bg-amber-100 text-amber-900 px-4 py-2 rounded-full text-sm font-medium">
                {visibleCars.length} cars found
              </span>
              <div className="flex items-center gap-2">
                <Link
                  to="/customer"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-full text-sm font-semibold"
                >
                  Buy Cars
                </Link>
                <button
                  type="button"
                  onClick={() => setIsSellWizardOpen(true)}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-full text-sm font-semibold"
                >
                  Sell Car
                </button>
                {canOpenAdminPanel && (
                  <Link
                    to="/adminpanel/dashboard"
                    className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-full text-sm font-semibold"
                  >
                    Admin
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-10">
        <div className="grid lg:grid-cols-2 gap-5">
          <div className="rounded-3xl bg-white border border-emerald-100 shadow-sm p-6">
            <p className="text-xs uppercase tracking-widest text-emerald-700 font-semibold mb-2">Buyer Side</p>
            <h3 className="font-black text-2xl text-slate-900 mb-4">Find The Right Car, Faster</h3>
            <div className="space-y-3 text-sm text-slate-700">
              <p className="flex items-center gap-2"><FaCheckCircle className="text-emerald-600" /> Search by brand, model, fuel and price.</p>
              <p className="flex items-center gap-2"><FaCheckCircle className="text-emerald-600" /> Save shortlisted cars from featured inventory.</p>
              <p className="flex items-center gap-2"><FaCheckCircle className="text-emerald-600" /> Move directly into buyer flow and compare options.</p>
            </div>
            <Link
              to="/customer"
              className="inline-flex items-center gap-2 mt-5 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-full text-sm font-semibold"
            >
              Go To Buyer Dashboard <FaArrowRight />
            </Link>
          </div>

          <div className="rounded-3xl bg-white border border-amber-100 shadow-sm p-6">
            <p className="text-xs uppercase tracking-widest text-amber-700 font-semibold mb-2">Seller Side</p>
            <h3 className="font-black text-2xl text-slate-900 mb-4">List, Manage, And Close More Deals</h3>
            <div className="space-y-3 text-sm text-slate-700">
              <p className="flex items-center gap-2"><FaCheckCircle className="text-amber-600" /> Add car details with pricing and vehicle specs.</p>
              <p className="flex items-center gap-2"><FaCheckCircle className="text-amber-600" /> Get buyer inquiries, messages, and review activity.</p>
              <p className="flex items-center gap-2"><FaCheckCircle className="text-amber-600" /> Convert leads with test-drive scheduling flow.</p>
            </div>
            <button
              type="button"
              onClick={() => setIsSellWizardOpen(true)}
              className="inline-flex items-center gap-2 mt-5 bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-full text-sm font-semibold"
            >
              Go To Sell Car Form <FaArrowRight />
            </button>
          </div>
        </div>
      </section>

      <section id="featured-cars" className="max-w-7xl mx-auto px-6 py-16">

        <h2 className="text-3xl font-black text-center mb-12 text-slate-900">Featured Cars To Buy</h2>

        {loading && <p className="text-center text-slate-600">Loading cars...</p>}
        {error && <p className="text-center text-red-600">{error}</p>}

        {!loading && !error && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCars.map((car) => (
              <motion.div
                whileHover={{ y: -6 }}
                key={car._id}
                className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden"
              >
                <img
                  src={resolveCarImageFromCar(car) || CAR_IMAGE_FALLBACK}
                  alt={`${car.brand || "Car"} ${car.model || ""}`}
                  className="h-48 w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = CAR_IMAGE_FALLBACK;
                  }}
                />

                <div className="p-4">
                  <h3 className="text-xl font-bold text-slate-900">
                    {car.brand || "Unknown"} {car.model || "Model"}
                  </h3>

                  <p className="text-slate-500 flex flex-wrap gap-3 text-sm mt-1">
                    <span className="inline-flex items-center gap-1"><FaRoad className="text-slate-400" /> {car.year || "N/A"}</span>
                    <span className="inline-flex items-center gap-1"><FaGasPump className="text-slate-400" /> {car.fuelType || "N/A"}</span>
                    <span className="inline-flex items-center gap-1"><FaBolt className="text-slate-400" /> {car.transmission || "N/A"}</span>
                  </p>

                  <p className="text-amber-700 font-bold mt-2 text-lg">{formatPrice(car.price)}</p>

                  <p className="text-sm text-slate-600 mt-1">Mileage: {car.mileage || "N/A"} km</p>

                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <Link
                      to="/customer"
                      className="text-center bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg text-sm font-semibold"
                    >
                      Buy Now
                    </Link>
                    <button
                      type="button"
                      onClick={() => toggleSave(car._id)}
                      className={`py-2 rounded-lg text-sm font-semibold ${
                        savedCars.includes(car._id)
                          ? "bg-slate-900 text-white"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {savedCars.includes(car._id) ? "Saved" : "Save"}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && !error && visibleCars.length === 0 && (
          <p className="text-center text-slate-500">No matching cars found. Try another search.</p>
        )}
      </section>

      <section className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-800 text-white py-16 text-center">

        <h2 className="text-3xl font-bold mb-4">
          Ready To Buy Or Sell Your Next Car?
        </h2>

        <p className="mb-6">
          Choose your side and launch into a high-conversion experience.
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          <Link
            to="/customer"
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-lg font-semibold"
          >
            Buy Cars
          </Link>
          <button
            type="button"
            onClick={() => setIsSellWizardOpen(true)}
            className="bg-white text-slate-900 px-8 py-3 rounded-lg font-semibold hover:scale-105 transition"
          >
            Sell Your Car
          </button>
        </div>

      </section>

      <SellCarModel
        isOpen={isSellWizardOpen}
        onClose={() => setIsSellWizardOpen(false)}
      />

    </div>
  );
};

export default Home;