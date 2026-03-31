import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FaBalanceScale, FaCheckCircle, FaRobot, FaTrashAlt } from "react-icons/fa";
import { CAR_IMAGE_FALLBACK, resolveCarImageFromCar } from "../../utils/carImage";

const COMPARE_STORAGE_KEY = "carscout.compareList";

const formatPrice = (price) => {
  const numeric = Number(price || 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(numeric);
};

const numericMileage = (mileage) => {
  if (typeof mileage === "number") {
    return mileage;
  }
  const text = String(mileage || "").replace(/,/g, "");
  const values = text.match(/\d+/g);
  if (!values || values.length === 0) {
    return 0;
  }
  if (values.length === 1) {
    return Number(values[0]);
  }
  return Math.round((Number(values[0]) + Number(values[1])) / 2);
};

const fuelBonus = (fuelType) => {
  const fuel = String(fuelType || "").toLowerCase();
  if (fuel === "electric") return 10;
  if (fuel === "cng") return 8;
  if (fuel === "diesel") return 6;
  if (fuel === "petrol") return 5;
  return 4;
};

const normalize = (value, min, max, invert = false) => {
  if (max === min) {
    return 1;
  }
  const ratio = (value - min) / (max - min);
  return invert ? 1 - ratio : ratio;
};

const scoreCars = (cars) => {
  const years = cars.map((car) => Number(car.year || 0));
  const prices = cars.map((car) => Number(car.price || 0));
  const mileages = cars.map((car) => numericMileage(car.mileage));

  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const minMileage = Math.min(...mileages);
  const maxMileage = Math.max(...mileages);

  return cars
    .map((car) => {
      const year = Number(car.year || 0);
      const price = Number(car.price || 0);
      const mileage = numericMileage(car.mileage);

      const score =
        normalize(year, minYear, maxYear) * 40 +
        normalize(mileage, minMileage, maxMileage, true) * 30 +
        normalize(price, minPrice, maxPrice, true) * 20 +
        fuelBonus(car.fuelType);

      return {
        ...car,
        aiScore: Number(score.toFixed(1)),
      };
    })
    .sort((a, b) => b.aiScore - a.aiScore);
};

const readStoredCompareList = () => {
  try {
    const raw = localStorage.getItem(COMPARE_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const CompareInsightsPage = () => {
  const [compareCars, setCompareCars] = useState(() => readStoredCompareList());

  const rankedCars = useMemo(() => {
    if (!compareCars.length) {
      return [];
    }
    return scoreCars(compareCars);
  }, [compareCars]);

  const bestCar = rankedCars[0] || null;

  const removeCar = (carId) => {
    const next = compareCars.filter((car) => car._id !== carId);
    setCompareCars(next);
    localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(next));
  };

  const clearAll = () => {
    setCompareCars([]);
    localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify([]));
  };

  const buildReasons = (car) => {
    if (!car) return [];
    const reasons = [];

    const cheapest = rankedCars.reduce(
      (prev, item) => (Number(item.price || 0) < Number(prev.price || 0) ? item : prev),
      rankedCars[0]
    );
    const newest = rankedCars.reduce(
      (prev, item) => (Number(item.year || 0) > Number(prev.year || 0) ? item : prev),
      rankedCars[0]
    );
    const lowMileage = rankedCars.reduce(
      (prev, item) => (numericMileage(item.mileage) < numericMileage(prev.mileage) ? item : prev),
      rankedCars[0]
    );

    if (car._id === cheapest?._id) reasons.push("Most budget-friendly price in this compare list");
    if (car._id === newest?._id) reasons.push("Newest model year among selected cars");
    if (car._id === lowMileage?._id) reasons.push("Lowest mileage among selected cars");
    if (reasons.length === 0) reasons.push("Balanced overall score across price, year, mileage, and fuel type");

    return reasons;
  };

  if (compareCars.length === 0) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-black text-slate-900">AI Compare Page</h1>
        <p className="text-slate-600 mt-2">No cars selected for compare yet. Add up to 3 cars from Buyer Inventory.</p>
        <Link
          to="/customer"
          className="inline-flex mt-4 bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-semibold"
        >
          Back To Buyer Dashboard
        </Link>
      </section>
    );
  }

  const reasons = buildReasons(bestCar);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-cyan-200 bg-cyan-50 p-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h1 className="text-2xl md:text-3xl font-black text-cyan-950 inline-flex items-center gap-2">
            <FaBalanceScale /> AI Car Compare
          </h1>
          <div className="flex items-center gap-2">
            <Link
              to="/customer"
              className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-semibold"
            >
              Back To Buyer Dashboard
            </Link>
            <button
              type="button"
              onClick={clearAll}
              className="border border-cyan-300 text-cyan-900 px-4 py-2 rounded-lg text-sm font-semibold"
            >
              Clear Compare
            </button>
          </div>
        </div>
      </section>

      {bestCar && (
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
          <h2 className="text-xl font-black text-emerald-900 inline-flex items-center gap-2">
            <FaRobot /> AI Recommendation: {bestCar.brand} {bestCar.model}
          </h2>
          <p className="text-emerald-900 font-semibold mt-2">AI Score: {bestCar.aiScore} / 100</p>
          <div className="mt-3 space-y-2 text-sm text-emerald-900">
            {reasons.map((reason) => (
              <p key={reason} className="inline-flex items-center gap-2">
                <FaCheckCircle /> {reason}
              </p>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 overflow-x-auto">
        <h2 className="text-xl font-black text-slate-900 mb-3">Full Detail Comparison</h2>
        <table className="min-w-[900px] w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-600 uppercase text-xs tracking-wide">
              <th className="text-left px-3 py-2">Car</th>
              <th className="text-left px-3 py-2">Price</th>
              <th className="text-left px-3 py-2">Year</th>
              <th className="text-left px-3 py-2">Fuel</th>
              <th className="text-left px-3 py-2">Transmission</th>
              <th className="text-left px-3 py-2">Mileage</th>
              <th className="text-left px-3 py-2">AI Score</th>
              <th className="text-left px-3 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {rankedCars.map((car) => (
              <tr key={car._id} className="border-t border-slate-200">
                <td className="px-3 py-2 font-semibold text-slate-900">{car.brand} {car.model}</td>
                <td className="px-3 py-2">{formatPrice(car.price)}</td>
                <td className="px-3 py-2">{car.year || "N/A"}</td>
                <td className="px-3 py-2">{car.fuelType || "N/A"}</td>
                <td className="px-3 py-2">{car.transmission || "N/A"}</td>
                <td className="px-3 py-2">{car.mileage || "N/A"} km</td>
                <td className="px-3 py-2 font-bold text-cyan-700">{car.aiScore}</td>
                <td className="px-3 py-2">
                  <button
                    type="button"
                    onClick={() => removeCar(car._id)}
                    className="inline-flex items-center gap-1 rounded-md bg-rose-50 text-rose-700 border border-rose-200 px-2 py-1"
                  >
                    <FaTrashAlt /> Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {rankedCars.map((car) => (
          <article key={car._id} className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <img
              src={resolveCarImageFromCar(car) || CAR_IMAGE_FALLBACK}
              alt={`${car.brand || "Car"} ${car.model || ""}`}
              className="h-44 w-full object-cover"
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = CAR_IMAGE_FALLBACK;
              }}
            />
            <div className="p-4">
              <h3 className="text-lg font-black text-slate-900">{car.brand} {car.model}</h3>
              <p className="text-sm text-slate-600 mt-1">{car.description || "No description provided."}</p>
              <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                <p className="rounded-md bg-slate-50 px-2 py-1"><span className="font-semibold">Year:</span> {car.year || "N/A"}</p>
                <p className="rounded-md bg-slate-50 px-2 py-1"><span className="font-semibold">Fuel:</span> {car.fuelType || "N/A"}</p>
                <p className="rounded-md bg-slate-50 px-2 py-1"><span className="font-semibold">Gear:</span> {car.transmission || "N/A"}</p>
                <p className="rounded-md bg-slate-50 px-2 py-1"><span className="font-semibold">Mileage:</span> {car.mileage || "N/A"} km</p>
              </div>
              <p className="text-lg font-black text-amber-700 mt-3">{formatPrice(car.price)}</p>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
};
