import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { CAR_IMAGE_FALLBACK, resolveCarImageFromCar } from "../../utils/carImage";
import { getCarAddedByDetails } from "../../utils/carOwnership";
import { createBookingApi } from "../../services/bookingService";
import { getAuthProfile, getAuthUserId } from "../../utils/auth";

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
  const [car, setCar] = useState(null);
  const [allCars, setAllCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState(false);
  const [isSubmittingTestDrive, setIsSubmittingTestDrive] = useState(false);

  const [inquiryForm, setInquiryForm] = useState({
    name: profile.name || "",
    email: profile.email || "",
    message: "",
  });

  const [testDriveForm, setTestDriveForm] = useState({
    date: "",
    location: "",
  });

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

  const imageUrl = resolveCarImageFromCar(car) || CAR_IMAGE_FALLBACK;
  const addedBy = getCarAddedByDetails(car || {});
  const numericPrice = Number(car?.price || 0);
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
      <section className="rounded-3xl border border-cyan-100 bg-gradient-to-r from-slate-900 via-slate-800 to-cyan-800 text-white p-6 sm:p-8 mb-6">
        <p className="uppercase text-xs tracking-[0.18em] text-cyan-200">Car Detail Page</p>
        <h1 className="text-3xl md:text-4xl font-black mt-2">{car.brand || "Car"} {car.model || "Model"}</h1>
        <p className="text-cyan-100 mt-3 max-w-3xl">Detailed vehicle information with seller details, specs, and quick actions.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => navigate(`/buy/${car._id}`)}
            className="bg-emerald-600 hover:bg-emerald-700 px-5 py-2.5 rounded-xl text-white font-semibold"
          >
            Buy Now
          </button>
          <Link
            to="/customer"
            className="bg-white/10 hover:bg-white/20 border border-white/20 px-5 py-2.5 rounded-xl text-white font-semibold"
          >
            Back to Inventory
          </Link>
        </div>
      </section>

      <section className="grid lg:grid-cols-[1.15fr_0.85fr] gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
          <img
            src={imageUrl}
            alt={`${car.brand || "Car"} ${car.model || ""}`}
            className="w-full h-72 md:h-96 object-cover rounded-xl border border-slate-200"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = CAR_IMAGE_FALLBACK;
            }}
          />

          <div className="mt-5 rounded-xl border border-slate-200 p-4 bg-slate-50">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-500 font-semibold">Description</p>
            <p className="text-slate-700 mt-2 leading-relaxed">
              {car.description || "No detailed description available for this car yet."}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-amber-700 font-semibold">Price</p>
            <p className="text-3xl text-amber-700 font-black mt-1">{formatPrice(car.price)}</p>
            <div className="flex flex-wrap gap-2 mt-3">
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

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-500 font-semibold">Vehicle Specs</p>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <p className="rounded-lg bg-white p-2.5 text-sm text-slate-700"><span className="font-semibold text-slate-900">Year:</span> {car.year || "N/A"}</p>
              <p className="rounded-lg bg-white p-2.5 text-sm text-slate-700"><span className="font-semibold text-slate-900">Fuel:</span> {car.fuelType || "N/A"}</p>
              <p className="rounded-lg bg-white p-2.5 text-sm text-slate-700"><span className="font-semibold text-slate-900">Transmission:</span> {car.transmission || "N/A"}</p>
              <p className="rounded-lg bg-white p-2.5 text-sm text-slate-700"><span className="font-semibold text-slate-900">Mileage:</span> {car.mileage || "N/A"} km</p>
              <p className="rounded-lg bg-white p-2.5 text-sm text-slate-700"><span className="font-semibold text-slate-900">City:</span> {car.city || "N/A"}</p>
              <p className="rounded-lg bg-white p-2.5 text-sm text-slate-700"><span className="font-semibold text-slate-900">Owner:</span> {car.owner || "N/A"}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-cyan-700 font-semibold">Added By Details</p>
            <div className="grid gap-2 mt-3">
              <p className="rounded-lg bg-white p-2.5 text-sm text-slate-700">
                <span className="font-semibold text-slate-900">Name:</span> {addedBy.name || "-"}
              </p>
              <p className="rounded-lg bg-white p-2.5 text-sm text-slate-700 break-all">
                <span className="font-semibold text-slate-900">Email:</span> {addedBy.email || "-"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid lg:grid-cols-2 gap-6 mt-8">
        <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-5">
          <h2 className="text-xl font-black text-slate-900">Send Inquiry</h2>
          <p className="text-slate-600 text-sm mt-1">Ask seller about condition, negotiation, and paperwork.</p>

          <form onSubmit={submitInquiry} className="space-y-3 mt-4">
            <input
              type="text"
              value={inquiryForm.name}
              onChange={(event) => setInquiryForm((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="Your name"
              required
              className="w-full rounded-xl border border-cyan-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-cyan-300"
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
