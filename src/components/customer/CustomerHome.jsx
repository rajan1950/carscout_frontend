import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaBalanceScale,
  FaCarSide,
  FaCalendarCheck,
  FaCheckCircle,
  FaEnvelope,
  FaFilter,
  FaGasPump,
  FaHeart,
  FaMapMarkerAlt,
  FaRoad,
  FaStar,
  FaTag,
} from "react-icons/fa";
import SellCarModel from "../seller/SellCarModel";
import { readAuthSession } from "../../utils/auth";

const BUYER_FAVORITES_KEY = "carscout_buyer_favorites";

const formatPrice = (price) => {
  const numeric = Number(price || 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(numeric);
};

export const CustomerHome = () => {
  const [isSellWizardOpen, setIsSellWizardOpen] = useState(false);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [fuelFilter, setFuelFilter] = useState("all");
  const [sortBy, setSortBy] = useState("latest");
  const [selectedCar, setSelectedCar] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [compareList, setCompareList] = useState([]);
  const [showInquiry, setShowInquiry] = useState(false);
  const [showTestDrive, setShowTestDrive] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [submittingAction, setSubmittingAction] = useState(false);

  const session = readAuthSession();
  const currentUser = session?.user || {};
  const userId = currentUser?._id || currentUser?.id || "";
  const defaultName =
    currentUser?.name ||
    currentUser?.fullName ||
    currentUser?.firstName ||
    "";
  const defaultEmail = currentUser?.email || "";

  const [inquiryForm, setInquiryForm] = useState({
    name: defaultName,
    email: defaultEmail,
    message: "",
  });

  const [testDriveForm, setTestDriveForm] = useState({
    date: "",
    location: "",
  });

  const [reviewForm, setReviewForm] = useState({
    rating: "5",
    comment: "",
  });

  useEffect(() => {
    const raw = localStorage.getItem(BUYER_FAVORITES_KEY);
    if (!raw) {
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      setFavorites(Array.isArray(parsed) ? parsed : []);
    } catch {
      setFavorites([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(BUYER_FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const res = await axios.get("http://localhost:4444/car/all");
        setCars(Array.isArray(res.data) ? res.data : []);
        setError("");
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load buyer inventory");
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, []);

  const filteredCars = useMemo(() => {
    let items = [...cars];
    const normalizedQuery = query.trim().toLowerCase();

    if (normalizedQuery) {
      items = items.filter((car) =>
        `${car.brand || ""} ${car.model || ""} ${car.year || ""}`
          .toLowerCase()
          .includes(normalizedQuery)
      );
    }

    if (fuelFilter !== "all") {
      items = items.filter(
        (car) => String(car.fuelType || "").toLowerCase() === fuelFilter
      );
    }

    if (sortBy === "price-low") {
      items.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    }
    if (sortBy === "price-high") {
      items.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    }
    if (sortBy === "year-new") {
      items.sort((a, b) => Number(b.year || 0) - Number(a.year || 0));
    }

    return items;
  }, [cars, query, fuelFilter, sortBy]);

  const inventoryValue = useMemo(
    () => cars.reduce((sum, car) => sum + Number(car.price || 0), 0),
    [cars]
  );

  const toggleFavorite = (carId) => {
    setFavorites((prev) =>
      prev.includes(carId) ? prev.filter((id) => id !== carId) : [...prev, carId]
    );
  };

  const toggleCompare = (car) => {
    setCompareList((prev) => {
      const exists = prev.some((item) => item._id === car._id);
      if (exists) {
        return prev.filter((item) => item._id !== car._id);
      }
      if (prev.length >= 3) {
        toast.info("You can compare up to 3 cars");
        return prev;
      }
      return [...prev, car];
    });
  };

  const openInquiry = (car) => {
    setSelectedCar(car);
    setShowInquiry(true);
    setShowTestDrive(false);
    setShowReview(false);
  };

  const openTestDrive = (car) => {
    setSelectedCar(car);
    setShowTestDrive(true);
    setShowInquiry(false);
    setShowReview(false);
  };

  const openReview = (car) => {
    setSelectedCar(car);
    setShowReview(true);
    setShowInquiry(false);
    setShowTestDrive(false);
  };

  const closeActionModal = () => {
    setShowInquiry(false);
    setShowTestDrive(false);
    setShowReview(false);
  };

  const submitInquiry = async (event) => {
    event.preventDefault();
    if (!selectedCar || submittingAction) {
      return;
    }

    setSubmittingAction(true);
    try {
      const payload = {
        name: inquiryForm.name,
        email: inquiryForm.email,
        message: `[${selectedCar.brand} ${selectedCar.model}] ${inquiryForm.message}`,
      };
      await axios.post("http://localhost:4444/inquiry/create", payload);
      toast.success("Inquiry sent successfully");
      setInquiryForm((prev) => ({ ...prev, message: "" }));
      closeActionModal();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send inquiry");
    } finally {
      setSubmittingAction(false);
    }
  };

  const submitTestDrive = async (event) => {
    event.preventDefault();
    if (!selectedCar || submittingAction) {
      return;
    }
    if (!userId) {
      toast.error("Login required for test drive booking");
      return;
    }

    setSubmittingAction(true);
    try {
      const payload = {
        userId,
        carId: selectedCar._id,
        date: testDriveForm.date,
        location: testDriveForm.location,
        status: "pending",
      };
      await axios.post("http://localhost:4444/testdrive/add", payload);
      toast.success("Test drive requested");
      setTestDriveForm({ date: "", location: "" });
      closeActionModal();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to book test drive");
    } finally {
      setSubmittingAction(false);
    }
  };

  const submitReview = async (event) => {
    event.preventDefault();
    if (!selectedCar || submittingAction) {
      return;
    }
    if (!userId) {
      toast.error("Login required for review");
      return;
    }

    setSubmittingAction(true);
    try {
      const payload = {
        userId,
        carId: selectedCar._id,
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment,
      };
      await axios.post("http://localhost:4444/reviews/add", payload);
      toast.success("Review submitted");
      setReviewForm({ rating: "5", comment: "" });
      closeActionModal();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmittingAction(false);
    }
  };

  const favoriteCars = cars.filter((car) => favorites.includes(car._id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
      <section className="rounded-3xl border border-cyan-100 bg-gradient-to-r from-slate-900 via-slate-800 to-cyan-800 text-white p-6 sm:p-8 mb-6">
        <p className="uppercase text-xs tracking-[0.18em] text-cyan-200">Buyer Dashboard</p>
        <h1 className="text-3xl md:text-4xl font-black mt-2">Find, Compare, And Buy With Confidence</h1>
        <p className="text-cyan-100 mt-3 max-w-3xl">
          Full buyer functionality is now in one place: advanced inventory browsing, favorites,
          compare list, direct inquiry, test drive scheduling, and review actions.
        </p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
          <div className="rounded-xl bg-white/10 border border-white/15 p-4">
            <p className="text-xs uppercase text-cyan-200">Total Cars</p>
            <p className="text-2xl font-black">{cars.length}</p>
          </div>
          <div className="rounded-xl bg-white/10 border border-white/15 p-4">
            <p className="text-xs uppercase text-cyan-200">Favorites</p>
            <p className="text-2xl font-black">{favorites.length}</p>
          </div>
          <div className="rounded-xl bg-white/10 border border-white/15 p-4">
            <p className="text-xs uppercase text-cyan-200">Compare List</p>
            <p className="text-2xl font-black">{compareList.length}</p>
          </div>
          <div className="rounded-xl bg-white/10 border border-white/15 p-4">
            <p className="text-xs uppercase text-cyan-200">Inventory Value</p>
            <p className="text-2xl font-black">{formatPrice(inventoryValue)}</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 mb-6">
        <div className="flex items-center gap-2 text-slate-800 mb-3 font-bold">
          <FaFilter /> Smart Filter Controls
        </div>

        <div className="grid md:grid-cols-4 gap-3">
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by brand, model, year"
            className="md:col-span-2 rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-400"
          />
          <select
            value={fuelFilter}
            onChange={(event) => setFuelFilter(event.target.value)}
            className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-400"
          >
            <option value="all">All Fuel Type</option>
            <option value="petrol">Petrol</option>
            <option value="diesel">Diesel</option>
            <option value="electric">Electric</option>
            <option value="cng">CNG</option>
          </select>
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-400"
          >
            <option value="latest">Sort: Latest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="year-new">Year: Newest</option>
          </select>
        </div>
      </section>

      {compareList.length > 0 && (
        <section className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4 mb-6">
          <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
            <h2 className="text-lg font-black text-cyan-900 inline-flex items-center gap-2">
              <FaBalanceScale /> Compare Shortlist
            </h2>
            <button
              type="button"
              onClick={() => setCompareList([])}
              className="text-sm font-semibold text-cyan-800 border border-cyan-300 px-3 py-1.5 rounded-lg"
            >
              Clear Compare
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-3">
            {compareList.map((car) => (
              <div key={car._id} className="rounded-xl border border-cyan-200 bg-white p-4">
                <h3 className="font-bold text-slate-900">{car.brand} {car.model}</h3>
                <p className="text-sm text-slate-600 mt-1">{car.year || "N/A"} • {car.fuelType || "N/A"}</p>
                <p className="text-sm text-slate-600">{car.transmission || "N/A"} • {car.mileage || "N/A"} km</p>
                <p className="font-bold text-cyan-800 mt-1">{formatPrice(car.price)}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-black text-slate-900">Buyer Inventory</h2>
          <span className="rounded-full bg-slate-100 text-slate-700 px-4 py-1.5 text-sm font-semibold">
            {filteredCars.length} cars found
          </span>
        </div>

        {loading && <p className="text-slate-600">Loading cars...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredCars.map((car) => {
              const isFavorite = favorites.includes(car._id);
              const isCompared = compareList.some((item) => item._id === car._id);

              return (
                <div key={car._id} className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=900&q=80"
                    alt={`${car.brand || "Car"} ${car.model || ""}`}
                    className="h-44 w-full object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-xl font-black text-slate-900">{car.brand || "Unknown"} {car.model || "Model"}</h3>
                    <p className="text-slate-600 text-sm flex flex-wrap gap-3 mt-1">
                      <span className="inline-flex items-center gap-1"><FaRoad className="text-slate-400" /> {car.year || "N/A"}</span>
                      <span className="inline-flex items-center gap-1"><FaGasPump className="text-slate-400" /> {car.fuelType || "N/A"}</span>
                    </p>
                    <p className="text-amber-700 font-black mt-2 text-lg">{formatPrice(car.price)}</p>

                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <button
                        type="button"
                        onClick={() => setSelectedCar(car)}
                        className="bg-slate-900 hover:bg-black text-white rounded-lg py-2 text-sm font-semibold"
                      >
                        View Details
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleFavorite(car._id)}
                        className={`rounded-lg py-2 text-sm font-semibold ${
                          isFavorite
                            ? "bg-rose-600 text-white"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {isFavorite ? "Saved" : "Save"}
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => openInquiry(car)}
                        className="rounded-lg border border-cyan-200 text-cyan-700 py-2 text-xs font-semibold hover:bg-cyan-50"
                      >
                        Inquiry
                      </button>
                      <button
                        type="button"
                        onClick={() => openTestDrive(car)}
                        className="rounded-lg border border-emerald-200 text-emerald-700 py-2 text-xs font-semibold hover:bg-emerald-50"
                      >
                        Test Drive
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleCompare(car)}
                        className={`rounded-lg py-2 text-xs font-semibold ${
                          isCompared
                            ? "bg-cyan-700 text-white"
                            : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {isCompared ? "Added" : "Compare"}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => openReview(car)}
                      className="w-full rounded-lg border border-amber-200 text-amber-700 py-2 text-xs font-semibold hover:bg-amber-50 mt-2"
                    >
                      Write Review
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {favoriteCars.length > 0 && (
        <section className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 p-4">
          <h2 className="text-lg font-black text-rose-900 inline-flex items-center gap-2">
            <FaHeart /> Saved Cars
          </h2>
          <div className="mt-3 grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {favoriteCars.map((car) => (
              <div key={car._id} className="rounded-xl border border-rose-200 bg-white p-4">
                <p className="font-bold text-slate-900">{car.brand} {car.model}</p>
                <p className="text-sm text-slate-600">{car.year || "N/A"} • {car.fuelType || "N/A"}</p>
                <p className="text-sm text-rose-700 font-semibold mt-1">{formatPrice(car.price)}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-xl font-black text-slate-900">Role Actions</h2>
        <p className="text-slate-600 mt-1">Buyer dashboard keeps the same website flow while allowing quick switch to selling.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link to="/" className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-lg font-semibold">
            <FaCarSide /> Back To Home
          </Link>
          <button
            type="button"
            onClick={() => setIsSellWizardOpen(true)}
            className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 rounded-lg font-semibold"
          >
            <FaTag /> Sell From Popup
          </button>
        </div>
      </section>

      {selectedCar && !showInquiry && !showTestDrive && !showReview && (
        <div className="fixed inset-0 z-40 bg-black/50 p-4 flex items-center justify-center" onClick={() => setSelectedCar(null)}>
          <div className="w-full max-w-2xl rounded-2xl bg-white border border-slate-200 p-6" onClick={(event) => event.stopPropagation()}>
            <h3 className="text-2xl font-black text-slate-900">{selectedCar.brand} {selectedCar.model}</h3>
            <p className="text-slate-600 mt-2">{selectedCar.description || "No detailed description available."}</p>
            <div className="grid sm:grid-cols-2 gap-3 mt-4">
              <p className="rounded-lg bg-slate-50 p-3 text-sm"><span className="font-semibold">Year:</span> {selectedCar.year || "N/A"}</p>
              <p className="rounded-lg bg-slate-50 p-3 text-sm"><span className="font-semibold">Fuel:</span> {selectedCar.fuelType || "N/A"}</p>
              <p className="rounded-lg bg-slate-50 p-3 text-sm"><span className="font-semibold">Transmission:</span> {selectedCar.transmission || "N/A"}</p>
              <p className="rounded-lg bg-slate-50 p-3 text-sm"><span className="font-semibold">Mileage:</span> {selectedCar.mileage || "N/A"} km</p>
            </div>
            <p className="text-2xl text-amber-700 font-black mt-4">{formatPrice(selectedCar.price)}</p>
            <div className="flex justify-end mt-5">
              <button type="button" onClick={() => setSelectedCar(null)} className="bg-slate-900 text-white px-4 py-2 rounded-lg font-semibold">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedCar && (showInquiry || showTestDrive || showReview) && (
        <div className="fixed inset-0 z-50 bg-black/50 p-4 flex items-center justify-center" onClick={closeActionModal}>
          <div className="w-full max-w-xl rounded-2xl bg-white border border-slate-200 p-6" onClick={(event) => event.stopPropagation()}>
            <h3 className="text-xl font-black text-slate-900 mb-1">{selectedCar.brand} {selectedCar.model}</h3>
            <p className="text-sm text-slate-500 mb-4">{formatPrice(selectedCar.price)}</p>

            {showInquiry && (
              <form onSubmit={submitInquiry} className="space-y-3">
                <p className="font-semibold text-cyan-800 inline-flex items-center gap-2"><FaEnvelope /> Send Inquiry</p>
                <input
                  type="text"
                  value={inquiryForm.name}
                  onChange={(event) => setInquiryForm((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder="Your name"
                  required
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                />
                <input
                  type="email"
                  value={inquiryForm.email}
                  onChange={(event) => setInquiryForm((prev) => ({ ...prev, email: event.target.value }))}
                  placeholder="Your email"
                  required
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                />
                <textarea
                  value={inquiryForm.message}
                  onChange={(event) => setInquiryForm((prev) => ({ ...prev, message: event.target.value }))}
                  placeholder="Ask about price, condition, service history..."
                  required
                  rows={4}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={closeActionModal} className="px-4 py-2 rounded-lg bg-slate-100 font-semibold">Cancel</button>
                  <button type="submit" disabled={submittingAction} className="px-4 py-2 rounded-lg bg-cyan-700 text-white font-semibold">
                    {submittingAction ? "Sending..." : "Send Inquiry"}
                  </button>
                </div>
              </form>
            )}

            {showTestDrive && (
              <form onSubmit={submitTestDrive} className="space-y-3">
                <p className="font-semibold text-emerald-800 inline-flex items-center gap-2"><FaCalendarCheck /> Book Test Drive</p>
                <input
                  type="date"
                  value={testDriveForm.date}
                  onChange={(event) => setTestDriveForm((prev) => ({ ...prev, date: event.target.value }))}
                  required
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                />
                <input
                  type="text"
                  value={testDriveForm.location}
                  onChange={(event) => setTestDriveForm((prev) => ({ ...prev, location: event.target.value }))}
                  placeholder="Preferred location"
                  required
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                />
                <p className="text-xs text-slate-500 inline-flex items-center gap-1"><FaMapMarkerAlt /> Request will be created with pending status.</p>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={closeActionModal} className="px-4 py-2 rounded-lg bg-slate-100 font-semibold">Cancel</button>
                  <button type="submit" disabled={submittingAction} className="px-4 py-2 rounded-lg bg-emerald-700 text-white font-semibold">
                    {submittingAction ? "Submitting..." : "Book Now"}
                  </button>
                </div>
              </form>
            )}

            {showReview && (
              <form onSubmit={submitReview} className="space-y-3">
                <p className="font-semibold text-amber-800 inline-flex items-center gap-2"><FaStar /> Write Review</p>
                <select
                  value={reviewForm.rating}
                  onChange={(event) => setReviewForm((prev) => ({ ...prev, rating: event.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                >
                  <option value="5">5 Star</option>
                  <option value="4">4 Star</option>
                  <option value="3">3 Star</option>
                  <option value="2">2 Star</option>
                  <option value="1">1 Star</option>
                </select>
                <textarea
                  value={reviewForm.comment}
                  onChange={(event) => setReviewForm((prev) => ({ ...prev, comment: event.target.value }))}
                  placeholder="Share your buying experience"
                  required
                  rows={4}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                />
                <div className="text-xs text-slate-500 inline-flex items-center gap-1"><FaCheckCircle /> Reviews help other buyers make decisions.</div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={closeActionModal} className="px-4 py-2 rounded-lg bg-slate-100 font-semibold">Cancel</button>
                  <button type="submit" disabled={submittingAction} className="px-4 py-2 rounded-lg bg-amber-600 text-white font-semibold">
                    {submittingAction ? "Submitting..." : "Submit Review"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <SellCarModel
        isOpen={isSellWizardOpen}
        onClose={() => setIsSellWizardOpen(false)}
      />
    </div>
  );
};
