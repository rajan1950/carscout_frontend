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
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import UserNavbar from "../../layouts/UserNavbar";
import { isAdminAuthenticated, isAuthenticated } from "../../utils/auth";
import SellCarModel from "../../components/seller/SellCarModel";
import { CAR_IMAGE_FALLBACK, resolveCarImageFromCar } from "../../utils/carImage";
import {
  getPurchasedCarIdsLocal,
  PURCHASED_CARS_UPDATED_EVENT,
  syncPurchasedCarIdsFromPurchases,
} from "../../services/purchaseService";

const Home = () => {
  const navigate = useNavigate();
  const MotionH1 = motion.h1;
  const MotionP = motion.p;
  const MotionDiv = motion.div;
  const canOpenAdminPanel = isAdminAuthenticated();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [purchasedCarIds, setPurchasedCarIds] = useState(() => getPurchasedCarIdsLocal());
  const [query, setQuery] = useState("");
  const [fuelFilter, setFuelFilter] = useState("all");
  const [priceSort, setPriceSort] = useState("default");
  const [isSellWizardOpen, setIsSellWizardOpen] = useState(false);
  const [platformStats, setPlatformStats] = useState({
    cars: 0,
    inquiries: 0,
    testDrives: 0,
  });

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [carsRes, summaryRes, testDriveRes] = await Promise.allSettled([
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

  useEffect(() => {
    const syncPurchasedCars = () => {
      setPurchasedCarIds(getPurchasedCarIdsLocal());
    };

    syncPurchasedCarIdsFromPurchases();
    syncPurchasedCars();
    window.addEventListener("storage", syncPurchasedCars);
    window.addEventListener(PURCHASED_CARS_UPDATED_EVENT, syncPurchasedCars);

    return () => {
      window.removeEventListener("storage", syncPurchasedCars);
      window.removeEventListener(PURCHASED_CARS_UPDATED_EVENT, syncPurchasedCars);
    };
  }, []);

  const availableCars = useMemo(
    () => cars.filter((car) => !purchasedCarIds.includes(car._id)),
    [cars, purchasedCarIds]
  );

  const visibleCars = useMemo(() => {
    let items = [...availableCars];

    if (query.trim()) {
      const q = query.toLowerCase();
      items = items.filter((car) =>
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
  }, [availableCars, query, fuelFilter, priceSort]);

  const formatPrice = (price) => {
    const numeric = Number(price || 0);
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(numeric);
  };

  const featuredCars = visibleCars.slice(0, 9);

  const handleSellCarClick = () => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    setIsSellWizardOpen(true);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f5f0e8_0%,_#f8f7f3_35%,_#eff3f4_100%)] text-slate-900">
      <UserNavbar />

      {/* ───────────────── HERO SECTION ───────────────── */}
      <section className="relative overflow-hidden py-16 md:py-20">
        <div className="absolute -top-24 -left-20 h-72 w-72 rounded-full bg-amber-300/30 blur-3xl" />
        <div className="absolute -bottom-16 -right-14 h-72 w-72 rounded-full bg-emerald-300/25 blur-3xl" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-10 items-center">
          {/* Left copy */}
          <div>
            <p className="uppercase tracking-[0.2em] text-xs md:text-sm text-amber-700 font-semibold mb-4">
              Premium Automotive Marketplace
            </p>
            <MotionH1
              initial={{ opacity: 0, y: -40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-6xl font-black tracking-tight mb-5 text-slate-900"
            >
              Buy Smarter. Sell Faster. Trade With Confidence.
            </MotionH1>

            <MotionP
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-base md:text-lg mb-8 text-slate-700 max-w-2xl leading-relaxed"
            >
              Car Scout is built for both sides of the market. Buyers get verified inventory,
              smart filtering, and quick actions. Sellers get faster listing flow, better
              visibility, and lead-ready inquiries.
            </MotionP>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/customer"
                className="inline-flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-full text-sm font-semibold transition"
              >
                Start Buying <FaArrowRight />
              </Link>
              <button
                type="button"
                onClick={handleSellCarClick}
                className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-full text-sm font-semibold transition"
              >
                Start Selling <FaArrowRight />
              </button>
              <a
                href="#featured-cars"
                className="border border-slate-300 hover:border-slate-700 px-6 py-3 rounded-full text-sm font-semibold text-slate-800 transition"
              >
                Explore Inventory
              </a>
            </div>

            {/* Stats */}
            <div className="grid sm:grid-cols-3 gap-3 mt-8">
              <div className="rounded-xl bg-white/90 border border-slate-200 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">Available Cars</p>
                <p className="text-2xl font-black text-slate-900">{availableCars.length}</p>
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

          {/* Right — Deal Engine panel */}
          <MotionDiv
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid md:grid-cols-4 gap-3 bg-white/95 border border-slate-200 rounded-2xl p-4 shadow-xl"
          >
            <div className="md:col-span-4 rounded-xl bg-gradient-to-r from-slate-900 to-slate-700 text-white p-4">
              <p className="text-xs uppercase tracking-wider text-slate-300">Deal Engine</p>
              <h3 className="text-lg font-bold">Buyer + Seller Functions In One Screen</h3>
              <p className="text-sm text-slate-200 mt-1">
                Search, compare, and instantly move into buy or sell journeys.
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
                className="bg-slate-900 hover:bg-black px-6 flex items-center text-white transition"
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
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-full text-sm font-semibold transition"
                >
                  Buy Cars
                </Link>
                <button
                  type="button"
                  onClick={handleSellCarClick}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-full text-sm font-semibold transition"
                >
                  Sell Car
                </button>
                {canOpenAdminPanel && (
                  <Link
                    to="/adminpanel/dashboard"
                    className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-full text-sm font-semibold transition"
                  >
                    Admin
                  </Link>
                )}
              </div>
            </div>
          </MotionDiv>
        </div>
      </section>

      {/* ───────────────── BUYER / SELLER CARDS ───────────────── */}
      <section className="max-w-7xl mx-auto px-6 pb-10">
        <div className="grid lg:grid-cols-2 gap-5">
          {/* Buyer */}
          <div className="rounded-3xl bg-white border border-emerald-100 shadow-sm p-6">
            <p className="text-xs uppercase tracking-widest text-emerald-700 font-semibold mb-2">
              Buyer Side
            </p>
            <h3 className="font-black text-2xl text-slate-900 mb-4">
              Find The Right Car, Faster
            </h3>
            <div className="space-y-3 text-sm text-slate-700">
              <p className="flex items-center gap-2">
                <FaCheckCircle className="text-emerald-600 flex-shrink-0" />
                Search by brand, model, fuel and price.
              </p>
              <p className="flex items-center gap-2">
                <FaCheckCircle className="text-emerald-600 flex-shrink-0" />
                Review featured inventory and open buyer dashboard.
              </p>
              <p className="flex items-center gap-2">
                <FaCheckCircle className="text-emerald-600 flex-shrink-0" />
                Move directly into buyer flow and compare options.
              </p>
            </div>
            <Link
              to="/customer"
              className="inline-flex items-center gap-2 mt-5 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition"
            >
              Go To Buyer Dashboard <FaArrowRight />
            </Link>
          </div>

          {/* Seller */}
          <div className="rounded-3xl bg-white border border-amber-100 shadow-sm p-6">
            <p className="text-xs uppercase tracking-widest text-amber-700 font-semibold mb-2">
              Seller Side
            </p>
            <h3 className="font-black text-2xl text-slate-900 mb-4">
              List, Manage, And Close More Deals
            </h3>
            <div className="space-y-3 text-sm text-slate-700">
              <p className="flex items-center gap-2">
                <FaCheckCircle className="text-amber-600 flex-shrink-0" />
                Add car details with pricing and vehicle specs.
              </p>
              <p className="flex items-center gap-2">
                <FaCheckCircle className="text-amber-600 flex-shrink-0" />
                Get buyer inquiries, messages, and review activity.
              </p>
              <p className="flex items-center gap-2">
                <FaCheckCircle className="text-amber-600 flex-shrink-0" />
                Convert leads with test-drive scheduling flow.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSellCarClick}
              className="inline-flex items-center gap-2 mt-5 bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition"
            >
              Go To Sell Car Form <FaArrowRight />
            </button>
          </div>
        </div>
      </section>

      {/* ───────────────── FEATURED CARS GRID ───────────────── */}
      <section
        id="featured-cars"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16"
      >
        <h2 className="text-2xl sm:text-3xl font-black text-center mb-8 sm:mb-12 text-slate-900">
          Featured Cars To Buy
        </h2>

        {loading && (
          <p className="text-center text-slate-600 py-10">Loading cars...</p>
        )}
        {error && (
          <p className="text-center text-red-600 py-10">{error}</p>
        )}

        {!loading && !error && featuredCars.length > 0 && (
          /*
           * KEY FIX:
           *  • items-stretch  → every card in a row grows to the tallest card's height
           *  • Each motion.div gets  flex flex-col h-full  so it fills that height
           *  • The image height is fixed (h-48) so all thumbnails are identical
           *  • The content div is  flex flex-col flex-1  so it expands to fill remaining space
           *  • mt-auto on the button wrapper pins "Buy Now" to the bottom of every card
           */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 items-stretch">
            {featuredCars.map((car, index) => (
              <motion.div
                key={car._id}
                whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(0,0,0,0.10)" }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
                className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden flex flex-col h-full"
              >
                {/* ── Fixed-height image ── */}
                <div className="relative h-48 w-full flex-shrink-0 overflow-hidden bg-slate-100">
                  <img
                    src={resolveCarImageFromCar(car) || CAR_IMAGE_FALLBACK}
                    alt={`${car.brand || "Car"} ${car.model || ""}`}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = CAR_IMAGE_FALLBACK;
                    }}
                  />
                </div>

                {/* ── Card body — grows to fill remaining height ── */}
                <div className="p-4 flex flex-col flex-1">
                  {/* Title */}
                  <h3 className="text-lg font-bold text-slate-900 leading-snug">
                    {car.brand || "Unknown"} {car.model || "Model"}
                  </h3>

                  {/* Specs row */}
                  <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 mt-2">
                    <span className="inline-flex items-center gap-1">
                      <FaRoad className="text-slate-400" />
                      {car.year || "N/A"}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <FaGasPump className="text-slate-400" />
                      {car.fuelType || "N/A"}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <FaBolt className="text-slate-400" />
                      {car.transmission || "N/A"}
                    </span>
                  </p>

                  {/* Price */}
                  <p className="text-amber-700 font-bold mt-3 text-lg">
                    {formatPrice(car.price)}
                  </p>

                  {/* Mileage */}
                  <p className="text-xs text-slate-500 mt-1">
                    Mileage: {car.mileage || "N/A"} km
                  </p>

                  {/* Button — pinned to the bottom via mt-auto */}
                  <div className="mt-auto pt-4">
                    <Link
                      to="/customer"
                      className="inline-flex w-full items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition"
                    >
                      Buy Now <FaArrowRight className="text-xs" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && !error && visibleCars.length === 0 && (
          <p className="text-center text-slate-500 py-10">
            No matching cars found. Try another search.
          </p>
        )}
      </section>

      {/* ───────────────── FOOTER ───────────────── */}
      <footer className="bg-slate-950 text-slate-200 border-t border-slate-800 mt-10">
        <div className="max-w-7xl mx-auto px-6 py-10 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="text-xl font-black text-white">Car Scout</h3>
            <p className="mt-3 text-sm text-slate-400 leading-relaxed">
              A unified marketplace for buying and selling cars with verified listings,
              smooth inquiry flows, and fast seller onboarding.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold tracking-wide uppercase text-slate-300">
              Explore
            </h4>
            <div className="mt-3 space-y-2 text-sm">
              <Link to="/customer" className="block hover:text-white transition">
                Browse Cars
              </Link>
              <button
                type="button"
                onClick={handleSellCarClick}
                className="text-left hover:text-white transition"
              >
                Sell Your Car
              </button>
              {canOpenAdminPanel && (
                <Link
                  to="/adminpanel/dashboard"
                  className="block hover:text-white transition"
                >
                  Admin Panel
                </Link>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold tracking-wide uppercase text-slate-300">
              Services
            </h4>
            <div className="mt-3 space-y-2 text-sm text-slate-400">
              <a href="/services#servicing" className="block hover:text-white transition">
                Car Servicing
              </a>
              <a href="/services#policies" className="block hover:text-white transition">
                Policies &amp; Terms
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold tracking-wide uppercase text-slate-300">
              Contact Us
            </h4>
            <p className="mt-3 text-sm text-slate-400">
              Need help with listing, booking, or purchases?
            </p>
            <a
              href="/services#contact"
              className="mt-2 inline-block text-sm text-emerald-400 hover:text-emerald-300 transition"
            >
              carscout85@gmail.com
            </a>
            <a
              href="tel:+918320161950"
              className="mt-1 block text-sm text-slate-400 hover:text-white transition"
            >
              +91 83201 61950
            </a>
          </div>
        </div>

        <div className="border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-6 py-4 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2">
            <p>© {new Date().getFullYear()} Car Scout. All rights reserved.</p>
            <p>Built for smarter car decisions.</p>
          </div>
        </div>
      </footer>

      <SellCarModel
        isOpen={isSellWizardOpen}
        onClose={() => setIsSellWizardOpen(false)}
      />
    </div>
  );
};

export default Home;