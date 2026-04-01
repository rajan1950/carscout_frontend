import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { FaCarSide } from "react-icons/fa";
import SellCarModel from "../seller/SellCarModel";
import { getAuthUserId, readAuthSession } from "../../utils/auth";
import { useNotifications } from "../../hooks/useNotifications";
import { createBookingApi } from "../../services/bookingService";
import { createReportApi } from "../../services/reportService";
import { addToWishlistApi, getUserWishlistApi, removeFromWishlistApi } from "../../services/wishlistService";
import { FilterBar } from "./FilterBar";
import { CompareSection } from "./CompareSection";
import { FavoriteSection } from "./FavoriteSection";
import { CarCard } from "./CarCard";
import { CarModal } from "./CarModal";
import { ActionModal } from "./ActionModal";

const COMPARE_STORAGE_KEY = "carscout.compareList";
const PURCHASED_CAR_STORAGE_KEY = "carscout.purchasedCarIds";
const PURCHASED_CARS_UPDATED_EVENT = "carscout-purchased-cars-updated";

const readCompareList = () => {
  try {
    const raw = localStorage.getItem(COMPARE_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const readPurchasedCarIds = () => {
  try {
    const raw = localStorage.getItem(PURCHASED_CAR_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const formatPrice = (price) => {
  const numeric = Number(price || 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(numeric);
};

export const CustomerHome = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { fetchUnreadCount } = useNotifications();
  const [isSellWizardOpen, setIsSellWizardOpen] = useState(false);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [fuelFilter, setFuelFilter] = useState("all");
  const [sortBy, setSortBy] = useState("latest");
  const [selectedCar, setSelectedCar] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [compareList, setCompareList] = useState(() => readCompareList());
  const [purchasedCarIds, setPurchasedCarIds] = useState(() => readPurchasedCarIds());
  const [actionType, setActionType] = useState(null);
  const [submittingAction, setSubmittingAction] = useState(false);

  const session = readAuthSession();
  const currentUser = session?.user || {};
  const userId = getAuthUserId();
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

  const [reportForm, setReportForm] = useState({
    reason: "",
    description: "",
  });

  const isWishlistView = searchParams.get("view") === "wishlist";

  const fetchCars = async () => {
    setLoading(true);
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

  useEffect(() => {
    fetchCars();
  }, []);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!userId) {
        setFavorites([]);
        return;
      }

      try {
        const response = await getUserWishlistApi(userId);
        const items = Array.isArray(response?.data) ? response.data : [];
        const nextFavorites = items
          .map((item) => item?.carId?._id || item?.carId)
          .filter(Boolean);
        setFavorites(nextFavorites);
      } catch {
        setFavorites([]);
      }
    };

    fetchWishlist();
  }, [userId]);

  useEffect(() => {
    localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(compareList));
  }, [compareList]);

  useEffect(() => {
    setCompareList((prev) => prev.filter((car) => !purchasedCarIds.includes(car._id)));
  }, [purchasedCarIds]);

  useEffect(() => {
    const syncPurchasedCars = () => {
      setPurchasedCarIds(readPurchasedCarIds());
    };

    syncPurchasedCars();
    window.addEventListener("storage", syncPurchasedCars);
    window.addEventListener(PURCHASED_CARS_UPDATED_EVENT, syncPurchasedCars);

    return () => {
      window.removeEventListener("storage", syncPurchasedCars);
      window.removeEventListener(PURCHASED_CARS_UPDATED_EVENT, syncPurchasedCars);
    };
  }, []);

  const filteredCars = useMemo(() => {
    let items = [...cars];
    const normalizedQuery = query.trim().toLowerCase();

    // Keep buyer inventory focused on cars not already in wishlist.
    items = items.filter((car) => !favorites.includes(car._id));

    // Hide purchased cars from buyer inventory.
    items = items.filter((car) => !purchasedCarIds.includes(car._id));

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
  }, [cars, query, fuelFilter, sortBy, favorites, purchasedCarIds]);

  const inventoryValue = useMemo(
    () => cars.reduce((sum, car) => sum + Number(car.price || 0), 0),
    [cars]
  );

  const toggleFavorite = async (carId) => {
    if (!userId) {
      toast.error("Login required to manage wishlist");
      return;
    }

    const isFavorite = favorites.includes(carId);

    try {
      if (isFavorite) {
        await removeFromWishlistApi({ userId, carId });
        setFavorites((prev) => prev.filter((id) => id !== carId));
        toast.success("Removed from wishlist");
        return;
      }

      await addToWishlistApi({ userId, carId });
      setFavorites((prev) => [...prev, carId]);
      toast.success("Added to wishlist");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update wishlist");
    }
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

  const openAction = (car, type) => {
    setSelectedCar(car);
    setActionType(type);
  };

  const closeActionModal = () => {
    setActionType(null);
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
        bookingDate: testDriveForm.date,
        location: testDriveForm.location,
        status: "pending",
      };
      await createBookingApi(payload);
      toast.success("Booking requested");
      fetchUnreadCount();
      setTestDriveForm({ date: "", location: "" });
      closeActionModal();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create booking");
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

  const submitReport = async (event) => {
    event.preventDefault();
    if (!selectedCar || submittingAction) {
      return;
    }
    if (!userId) {
      toast.error("Login required to submit report");
      return;
    }

    setSubmittingAction(true);
    try {
      const payload = {
        userId,
        carId: selectedCar._id,
        reason: reportForm.reason,
        description: reportForm.description,
      };
      await createReportApi(payload);
      toast.success("Report submitted");
      setReportForm({ reason: "", description: "" });
      closeActionModal();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit report");
    } finally {
      setSubmittingAction(false);
    }
  };

  const favoriteCars = cars.filter(
    (car) => favorites.includes(car._id) && !purchasedCarIds.includes(car._id)
  );

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
            <p className="text-xs uppercase text-cyan-200">Wishlist</p>
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

      {!isWishlistView && (
        <>
          <FilterBar
            query={query}
            setQuery={setQuery}
            fuelFilter={fuelFilter}
            setFuelFilter={setFuelFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />

          <CompareSection
            compareList={compareList}
            onClear={() => setCompareList([])}
            formatPrice={formatPrice}
          />

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
                    <CarCard
                      key={car._id}
                      car={car}
                      isFavorite={isFavorite}
                      isCompared={isCompared}
                      onViewDetails={setSelectedCar}
                      onBuyNow={(item) => navigate(`/customer/buy/${item._id}`)}
                      onToggleFavorite={toggleFavorite}
                      onOpenInquiry={(item) => openAction(item, "inquiry")}
                      onOpenTestDrive={(item) => openAction(item, "testdrive")}
                      onToggleCompare={toggleCompare}
                      onOpenReview={(item) => openAction(item, "review")}
                      onOpenReport={(item) => openAction(item, "report")}
                      formatPrice={formatPrice}
                    />
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}

      {isWishlistView && (
        <section className="rounded-2xl border border-cyan-100 bg-cyan-50/60 p-5 mb-6">
          <h2 className="text-2xl font-black text-slate-900">Wishlist View</h2>
          <p className="text-slate-600 mt-1">
            Cars in wishlist are hidden from Buyer Dashboard inventory until removed.
          </p>
        </section>
      )}

      <FavoriteSection
        favoriteCars={favoriteCars}
        formatPrice={formatPrice}
        onRemoveFromWishlist={toggleFavorite}
        onViewDetails={setSelectedCar}
        onBuyNow={(item) => navigate(`/customer/buy/${item._id}`)}
      />

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-xl font-black text-slate-900">Role Actions</h2>
        <p className="text-slate-600 mt-1">Buyer dashboard keeps the same website flow while allowing quick switch to selling.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link to="/" className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-lg font-semibold">
            <FaCarSide /> Back To Home
          </Link>
          {/* <button
            type="button"
            onClick={() => setIsSellWizardOpen(true)}
            className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 rounded-lg font-semibold"
          >
            <FaTag /> Sell From Popup
          </button> */}
        </div>
      </section>

      <CarModal
        selectedCar={selectedCar && !actionType ? selectedCar : null}
        onClose={() => setSelectedCar(null)}
        formatPrice={formatPrice}
      />

      <ActionModal
        selectedCar={selectedCar}
        actionType={actionType}
        inquiryForm={inquiryForm}
        setInquiryForm={setInquiryForm}
        testDriveForm={testDriveForm}
        setTestDriveForm={setTestDriveForm}
        reviewForm={reviewForm}
        setReviewForm={setReviewForm}
        reportForm={reportForm}
        setReportForm={setReportForm}
        submitInquiry={submitInquiry}
        submitTestDrive={submitTestDrive}
        submitReview={submitReview}
        submitReport={submitReport}
        submittingAction={submittingAction}
        onClose={closeActionModal}
        formatPrice={formatPrice}
      />

      <SellCarModel
        isOpen={isSellWizardOpen}
        onClose={() => setIsSellWizardOpen(false)}
        onSuccess={fetchCars}
      />
    </div>
  );
};
