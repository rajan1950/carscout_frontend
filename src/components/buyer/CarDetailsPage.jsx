import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaCalendarAlt,
  FaGasPump,
  FaMapMarkerAlt,
  FaRoad,
  FaUserTag,
  FaCogs,
} from "react-icons/fa";
import {
  CAR_IMAGE_FALLBACK,
  resolveCarImageFromCar,
  resolveCarImageGalleryFromCar,
} from "../../utils/carImage";
import { getCarAddedByDetails } from "../../utils/carOwnership";
import { createBookingApi } from "../../services/bookingService";
import { getAuthProfile, getAuthUserId, readAuthSession } from "../../utils/auth";
import { createOfferApi } from "../../services/offerService";

const getMileageAverage = (mileage) => {
  const values = String(mileage || "")
    .replace(/,/g, "")
    .match(/\d+/g);

  if (!values || values.length === 0) {
    return null;
  }

  const nums = values.map((item) => Number(item)).filter((item) => Number.isFinite(item));
  if (nums.length === 0) {
    return null;
  }

  const total = nums.reduce((sum, item) => sum + item, 0);
  return Math.round(total / nums.length);
};

const formatPrice = (price) => {
  const numeric = Number(price || 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(numeric);
};

export const CarDetailsPage = () => {
  const { carId } = useParams();
  const navigate = useNavigate();
  const profile = getAuthProfile();
  const userId = getAuthUserId();
  const authToken = readAuthSession()?.token;
  const [car, setCar] = useState(null);
  const [allCars, setAllCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState(false);
  const [isSubmittingTestDrive, setIsSubmittingTestDrive] = useState(false);
  const [isSubmittingOffer, setIsSubmittingOffer] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const [inquiryForm, setInquiryForm] = useState({
    name: profile.name || "",
    email: profile.email || "",
    message: "",
  });

  const [testDriveForm, setTestDriveForm] = useState({
    date: "",
    location: "",
  });

  const [offerForm, setOfferForm] = useState({
    offeredPrice: "",
    message: "",
  });
  const [sellerCandidates, setSellerCandidates] = useState([]);
  const [selectedSellerId, setSelectedSellerId] = useState("");

  useEffect(() => {
    const fetchCar = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await axios.get("http://localhost:4444/car/all");
        const cars = Array.isArray(response?.data) ? response.data : [];
        setAllCars(cars);
        const selected = cars.find((item) => item?._id === carId);

        if (!selected) {
          setCar(null);
          setError("Car not found");
          return;
        }

        setCar(selected);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load car details");
      } finally {
        setLoading(false);
      }
    };

    fetchCar();
  }, [carId]);

  useEffect(() => {
    if (!car) {
      return;
    }

    const title = `${car.brand || "Car"} ${car.model || "Details"} | Car Scout`;
    const description = `View ${car.brand || "car"} ${car.model || ""} details, price ${formatPrice(
      car.price
    )}, specs, seller info, and book a test drive on Car Scout.`;

    document.title = title;

    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement("meta");
      metaDescription.setAttribute("name", "description");
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute("content", description);

    return () => {
      document.title = "Car Scout";
    };
  }, [car]);

  const galleryImages = useMemo(() => {
    const allImages = resolveCarImageGalleryFromCar(car);
    if (allImages.length > 0) {
      return allImages;
    }

    const singleImage = resolveCarImageFromCar(car);
    return singleImage ? [singleImage] : [CAR_IMAGE_FALLBACK];
  }, [car]);

  const imageUrl = galleryImages[activeImageIndex] || galleryImages[0] || CAR_IMAGE_FALLBACK;

  useEffect(() => {
    setActiveImageIndex(0);
  }, [car?._id]);

  const addedBy = getCarAddedByDetails(car || {});
  const sellerId =
    car?.sellerId?._id ||
    car?.sellerId ||
    car?.createdBy?._id ||
    car?.createdBy ||
    "";
  const resolvedSellerId = sellerId || selectedSellerId;
  const numericPrice = Number(car?.price || 0);
  const specItems = [
    {
      key: "year",
      label: "Year",
      value: car?.year || "N/A",
      icon: FaCalendarAlt,
      iconClass: "bg-blue-100 text-blue-700",
    },
    {
      key: "fuelType",
      label: "Fuel",
      value: car?.fuelType || "N/A",
      icon: FaGasPump,
      iconClass: "bg-emerald-100 text-emerald-700",
    },
    {
      key: "transmission",
      label: "Transmission",
      value: car?.transmission || "N/A",
      icon: FaCogs,
      iconClass: "bg-indigo-100 text-indigo-700",
    },
    {
      key: "mileage",
      label: "Mileage",
      value: car?.mileage ? `${car.mileage} km` : "N/A",
      icon: FaRoad,
      iconClass: "bg-amber-100 text-amber-700",
    },
    {
      key: "city",
      label: "City",
      value: car?.city || "N/A",
      icon: FaMapMarkerAlt,
      iconClass: "bg-rose-100 text-rose-700",
    },
    {
      key: "owner",
      label: "Owner",
      value: car?.owner || "N/A",
      icon: FaUserTag,
      iconClass: "bg-cyan-100 text-cyan-700",
    },
  ];
  const averageMileage = getMileageAverage(car?.mileage);
  const pricePerKm = useMemo(() => {
    if (!averageMileage || averageMileage <= 0) {
      return null;
    }

    return Math.round(numericPrice / averageMileage);
  }, [averageMileage, numericPrice]);

  const relatedCars = useMemo(() => {
    if (!car?._id) {
      return [];
    }

    const sameBrand = allCars.filter(
      (item) => item?._id !== car._id && String(item?.brand || "").toLowerCase() === String(car?.brand || "").toLowerCase()
    );

    const sameFuel = allCars.filter(
      (item) =>
        item?._id !== car._id &&
        String(item?.fuelType || "").toLowerCase() === String(car?.fuelType || "").toLowerCase() &&
        String(item?.brand || "").toLowerCase() !== String(car?.brand || "").toLowerCase()
    );

    const merged = [...sameBrand, ...sameFuel];
    const unique = [];
    const seen = new Set();

    for (const item of merged) {
      if (!item?._id || seen.has(item._id)) {
        continue;
      }
      seen.add(item._id);
      unique.push(item);
      if (unique.length >= 4) {
        break;
      }
    }

    return unique;
  }, [allCars, car]);

  useEffect(() => {
    const fetchSellersForLegacyCars = async () => {
      if (sellerId || !authToken) {
        setSellerCandidates([]);
        setSelectedSellerId("");
        return;
      }

      try {
        const response = await axios.get("http://localhost:4444/user/getallusers", {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        const users = Array.isArray(response?.data?.users)
          ? response.data.users
          : Array.isArray(response?.data)
            ? response.data
            : [];
        const sellers = users
          .filter((item) => String(item?.role || "").toLowerCase() === "seller")
          .map((item) => ({
            id: item?._id || item?.id,
            label: `${item?.firstname || ""} ${item?.lastname || ""}`.trim() || item?.email || "Seller",
            email: item?.email || "",
          }))
          .filter((item) => item.id);

        setSellerCandidates(sellers);
        if (sellers.length === 1) {
          setSelectedSellerId(sellers[0].id);
        }
      } catch {
        setSellerCandidates([]);
      }
    };

    fetchSellersForLegacyCars();
  }, [sellerId, authToken]);

  const submitInquiry = async (event) => {
    event.preventDefault();

    if (!car?._id || isSubmittingInquiry) {
      return;
    }

    setIsSubmittingInquiry(true);

    try {
      await axios.post("http://localhost:4444/inquiry/create", {
        name: inquiryForm.name,
        email: inquiryForm.email,
        message: `[${car.brand} ${car.model}] ${inquiryForm.message}`,
      });
      toast.success("Inquiry sent successfully");
      setInquiryForm((prev) => ({ ...prev, message: "" }));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to send inquiry");
    } finally {
      setIsSubmittingInquiry(false);
    }
  };

  const submitTestDrive = async (event) => {
    event.preventDefault();

    if (!car?._id || isSubmittingTestDrive) {
      return;
    }

    if (!userId) {
      toast.error("Login required for test drive booking");
      return;
    }

    setIsSubmittingTestDrive(true);

    try {
      await createBookingApi({
        userId,
        carId: car._id,
        date: testDriveForm.date,
        bookingDate: testDriveForm.date,
        location: testDriveForm.location,
        status: "pending",
      });

      toast.success("Test drive requested");
      setTestDriveForm({ date: "", location: "" });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create test drive request");
    } finally {
      setIsSubmittingTestDrive(false);
    }
  };

  const submitOffer = async (event) => {
    event.preventDefault();

    if (!car?._id || isSubmittingOffer) {
      return;
    }

    if (!userId) {
      toast.error("Login required to make an offer");
      return;
    }

    setIsSubmittingOffer(true);

    try {
      await createOfferApi({
        ...(resolvedSellerId ? { sellerId: resolvedSellerId } : {}),
        carId: car._id,
        offeredPrice: Number(offerForm.offeredPrice),
        message: offerForm.message,
      });

      toast.success("Offer sent successfully");
      setOfferForm({
        offeredPrice: "",
        message: "",
      });
      navigate("/customer/offers");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to send offer");
    } finally {
      setIsSubmittingOffer(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  if (loading) {
    return <p className="text-slate-600">Loading car details...</p>;
  }

  if (error || !car) {
    return (
      <section className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <p className="text-red-700 font-semibold">{error || "Car details unavailable"}</p>
        <button
          type="button"
          onClick={() => navigate("/customer")}
          className="mt-4 rounded-lg bg-slate-900 text-white px-4 py-2"
        >
          Back to Buyer Dashboard
        </button>
      </section>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-12">
      <section className="rounded-3xl border border-cyan-100 bg-gradient-to-r from-slate-900 via-slate-800 to-cyan-800 text-white p-4 sm:p-6 md:p-8 mb-6">
        <p className="uppercase text-xs tracking-[0.18em] text-cyan-200">Car Detail Page</p>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black mt-2">{car.brand || "Car"} {car.model || "Model"}</h1>
        <p className="text-cyan-100 mt-3 max-w-3xl text-sm sm:text-base">Detailed vehicle information with seller details, specs, and quick actions.</p>
        <div className="mt-5 flex flex-wrap gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => navigate(`/buy/${car._id}`)}
            className="bg-emerald-600 hover:bg-emerald-700 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-white font-semibold text-sm sm:text-base"
          >
            Buy Now
          </button>
          <Link
            to="/customer"
            className="bg-white/10 hover:bg-white/20 border border-white/20 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-white font-semibold text-sm sm:text-base"
          >
            Back to Inventory
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-4 sm:gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 md:p-5">
          <img
            src={imageUrl}
            alt={`${car.brand || "Car"} ${car.model || ""}`}
            className="w-full aspect-video object-cover rounded-xl border border-slate-200"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = CAR_IMAGE_FALLBACK;
            }}
          />

          {galleryImages.length > 1 && (
            <div className="mt-2 sm:mt-3 grid grid-cols-3 sm:grid-cols-4 gap-1 sm:gap-2">
              {galleryImages.slice(0, 3).map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setActiveImageIndex(index)}
                  className={`rounded-lg overflow-hidden border-2 transition ${
                    activeImageIndex === index
                      ? "border-cyan-500"
                      : "border-slate-200 hover:border-cyan-300"
                  }`}
                >
                  <img
                    src={image}
                    alt={`${car.brand || "Car"} ${car.model || ""} view ${index + 1}`}
                    className="h-16 sm:h-20 w-full object-cover"
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = CAR_IMAGE_FALLBACK;
                    }}
                  />
                </button>
              ))}
            </div>
          )}

          <div className="mt-3 sm:mt-5 rounded-xl border border-slate-200 p-3 sm:p-4 bg-slate-50">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-500 font-semibold">Description</p>
            <p className="text-slate-700 mt-2 text-sm leading-relaxed">
              {car.description || "No detailed description available for this car yet."}
            </p>
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 sm:p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-amber-700 font-semibold">Price</p>
            <p className="text-2xl sm:text-3xl text-amber-700 font-black mt-1">{formatPrice(car.price)}</p>
            <div className="flex flex-wrap gap-2 mt-2 sm:mt-3">
              {pricePerKm && (
                <span className="rounded-full bg-white border border-amber-200 px-2.5 py-1 text-xs font-semibold text-amber-800">
                  ~ {formatPrice(pricePerKm)} / km
                </span>
              )}
              {car.year && (
                <span className="rounded-full bg-white border border-amber-200 px-2.5 py-1 text-xs font-semibold text-amber-800">
                  {Math.max(0, new Date().getFullYear() - Number(car.year)) === 0
                    ? "Current Year Model"
                    : `${Math.max(0, new Date().getFullYear() - Number(car.year))} years old`}
                </span>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-3 sm:p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-500 font-semibold">Vehicle Specs</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 mt-2 sm:mt-3">
              {specItems.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.key}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 flex items-center gap-3"
                  >
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center text-base ${item.iconClass}`}>
                      <Icon />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500 font-semibold">{item.label}</p>
                      <p className="text-sm font-semibold text-slate-800 truncate">{item.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-3 sm:p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-cyan-700 font-semibold">Added By Details</p>
            <div className="grid gap-2 mt-2 sm:mt-3">
              <p className="rounded-lg bg-white p-2 sm:p-2.5 text-xs sm:text-sm text-slate-700">
                <span className="font-semibold text-slate-900">Name:</span> {addedBy.name || "-"}
              </p>
              <p className="rounded-lg bg-white p-2 sm:p-2.5 text-xs sm:text-sm text-slate-700 break-all">
                <span className="font-semibold text-slate-900">Email:</span> {addedBy.email || "-"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-6 sm:mt-8">
        <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4 sm:p-5">
          <h2 className="text-lg sm:text-xl font-black text-slate-900">Make An Offer</h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-1">
            Send a direct price offer to the seller and negotiate from the offer center.
          </p>

          <form onSubmit={submitOffer} className="space-y-2 sm:space-y-3 mt-3 sm:mt-4">
            <input
              type="number"
              min="1"
              value={offerForm.offeredPrice}
              onChange={(event) => setOfferForm((prev) => ({ ...prev, offeredPrice: event.target.value }))}
              placeholder={`Suggested: ${Math.round(numericPrice * 0.95) || 0}`}
              required
              className="w-full rounded-xl border border-violet-200 bg-white px-3 py-2 sm:py-2.5 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-violet-300"
            />
            <textarea
              value={offerForm.message}
              onChange={(event) => setOfferForm((prev) => ({ ...prev, message: event.target.value }))}
              placeholder="I am ready to proceed quickly if this price works for you."
              rows={2}
              className="w-full rounded-xl border border-violet-200 bg-white px-3 py-2 sm:py-2.5 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-violet-300"
            />

            {!sellerId && sellerCandidates.length > 0 && (
              <select
                value={selectedSellerId}
                onChange={(event) => setSelectedSellerId(event.target.value)}
                className="w-full rounded-xl border border-violet-200 bg-white px-3 py-2 sm:py-2.5 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-violet-300"
                required
              >
                <option value="">Select seller</option>
                {sellerCandidates.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}{item.email ? ` - ${item.email}` : ""}
                  </option>
                ))}
              </select>
            )}

            <div className="flex flex-col sm:flex-row flex-wrap gap-2">
              <button
                type="submit"
                disabled={isSubmittingOffer || (!sellerId && sellerCandidates.length > 0 && !selectedSellerId)}
                className="rounded-xl bg-violet-700 hover:bg-violet-800 text-white px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmittingOffer ? "Sending Offer..." : "Send Offer"}
              </button>
              <Link
                to="/customer/offers"
                className="rounded-xl border border-violet-200 bg-white px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-violet-800 hover:bg-violet-100 text-center"
              >
                View Offers
              </Link>
            </div>
          </form>
        </div>

        <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4 sm:p-5">
          <h2 className="text-lg sm:text-xl font-black text-slate-900">Send Inquiry</h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-1">Ask seller about condition, negotiation, and paperwork.</p>

          <form onSubmit={submitInquiry} className="space-y-2 sm:space-y-3 mt-3 sm:mt-4">
            <input
              type="text"
              value={inquiryForm.name}
              onChange={(event) => setInquiryForm((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="Your name"
              required
              className="w-full rounded-xl border border-cyan-200 bg-white px-3 py-2 sm:py-2.5 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-cyan-300"
            />
            <input
              type="email"
              value={inquiryForm.email}
              onChange={(event) => setInquiryForm((prev) => ({ ...prev, email: event.target.value }))}
              placeholder="Your email"
              required
              className="w-full rounded-xl border border-cyan-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-cyan-300"
            />
            <textarea
              value={inquiryForm.message}
              onChange={(event) => setInquiryForm((prev) => ({ ...prev, message: event.target.value }))}
              placeholder="I want to know service history, final price, and transfer process..."
              rows={4}
              required
              className="w-full rounded-xl border border-cyan-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-cyan-300"
            />
            <button
              type="submit"
              disabled={isSubmittingInquiry}
              className="rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white px-4 py-2.5 text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmittingInquiry ? "Sending..." : "Send Inquiry"}
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <h2 className="text-xl font-black text-slate-900">Book Test Drive</h2>
          <p className="text-slate-600 text-sm mt-1">Choose preferred date and location for your test drive request.</p>

          <form onSubmit={submitTestDrive} className="space-y-3 mt-4">
            <input
              type="date"
              min={today}
              value={testDriveForm.date}
              onChange={(event) => setTestDriveForm((prev) => ({ ...prev, date: event.target.value }))}
              required
              className="w-full rounded-xl border border-emerald-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-300"
            />
            <input
              type="text"
              value={testDriveForm.location}
              onChange={(event) => setTestDriveForm((prev) => ({ ...prev, location: event.target.value }))}
              placeholder="Preferred location"
              required
              className="w-full rounded-xl border border-emerald-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-300"
            />
            <button
              type="submit"
              disabled={isSubmittingTestDrive}
              className="rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmittingTestDrive ? "Booking..." : "Request Test Drive"}
            </button>
          </form>
        </div>
      </section>

      <section className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-black text-slate-900">Related Cars</h2>
          <span className="rounded-full bg-slate-100 text-slate-700 px-4 py-1.5 text-sm font-semibold">
            {relatedCars.length} suggestions
          </span>
        </div>

        {relatedCars.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-slate-600">
            No similar cars found right now.
          </div>
        )}

        {relatedCars.length > 0 && (
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {relatedCars.map((item) => {
              const relatedImage = resolveCarImageFromCar(item) || CAR_IMAGE_FALLBACK;

              return (
                <article key={item._id} className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                  <img
                    src={relatedImage}
                    alt={`${item.brand || "Car"} ${item.model || ""}`}
                    className="h-36 w-full object-cover"
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = CAR_IMAGE_FALLBACK;
                    }}
                  />
                  <div className="p-3">
                    <p className="font-black text-slate-900">{item.brand || "Car"} {item.model || "Model"}</p>
                    <p className="text-xs text-slate-600 mt-1">{item.year || "N/A"} | {item.fuelType || "N/A"}</p>
                    <p className="text-amber-700 font-black mt-2">{formatPrice(item.price)}</p>
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <button
                        type="button"
                        onClick={() => navigate(`/customer/car/${item._id}`)}
                        className="rounded-lg border border-slate-200 text-slate-800 py-2 text-xs font-semibold hover:bg-slate-50"
                      >
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(`/buy/${item._id}`)}
                        className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white py-2 text-xs font-semibold"
                      >
                        Buy
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
