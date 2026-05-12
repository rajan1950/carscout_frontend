import { FaBalanceScale } from "react-icons/fa";
import { Link } from "react-router-dom";

export const CompareSection = ({ compareList, onClear, formatPrice }) => {
  if (compareList.length === 0) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-cyan-200 bg-cyan-50 p-3 sm:p-4 mb-6">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
        <h2 className="text-base sm:text-lg font-black text-cyan-900 inline-flex items-center gap-2">
          <FaBalanceScale /> Compare Shortlist
        </h2>
        <button
          type="button"
          onClick={onClear}
          className="text-xs sm:text-sm font-semibold text-cyan-800 border border-cyan-300 px-3 py-1.5 rounded-lg"
        >
          Clear Compare
        </button>
      </div>

      <div className="mb-3">
        <Link
          to="/customer/compare"
          className="inline-flex items-center rounded-lg bg-cyan-700 hover:bg-cyan-800 text-white px-3 py-2 text-xs sm:text-sm font-semibold"
        >
          Open AI Compare Page
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
        {compareList.map((car) => (
          <div key={car._id} className="rounded-xl border border-cyan-200 bg-white p-3 sm:p-4">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">{car.brand} {car.model}</h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">{car.year || "N/A"} • {car.fuelType || "N/A"}</p>
            <p className="text-xs sm:text-sm text-slate-600">{car.transmission || "N/A"} • {car.mileage || "N/A"} km</p>
            <p className="font-bold text-cyan-800 mt-1 text-sm sm:text-base">{formatPrice(car.price)}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
