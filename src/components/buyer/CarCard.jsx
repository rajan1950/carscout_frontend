import { FaGasPump, FaRoad } from "react-icons/fa";
import { CAR_IMAGE_FALLBACK, resolveCarImageFromCar } from "../../utils/carImage";

export const CarCard = ({
  car,
  isFavorite,
  isCompared,
  onViewDetails,
  onToggleFavorite,
  onOpenInquiry,
  onOpenTestDrive,
  onToggleCompare,
  onOpenReview,
  formatPrice,
}) => {
  const imageUrl = resolveCarImageFromCar(car) || CAR_IMAGE_FALLBACK;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <img
        src={imageUrl}
        alt={`${car.brand || "Car"} ${car.model || ""}`}
        className="h-44 w-full object-cover"
        onError={(event) => {
          event.currentTarget.onerror = null;
          event.currentTarget.src = CAR_IMAGE_FALLBACK;
        }}
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
            onClick={() => onViewDetails(car)}
            className="bg-slate-900 hover:bg-black text-white rounded-lg py-2 text-sm font-semibold"
          >
            View Details
          </button>
          <button
            type="button"
            onClick={() => onToggleFavorite(car._id)}
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
            onClick={() => onOpenInquiry(car)}
            className="rounded-lg border border-cyan-200 text-cyan-700 py-2 text-xs font-semibold hover:bg-cyan-50"
          >
            Inquiry
          </button>
          <button
            type="button"
            onClick={() => onOpenTestDrive(car)}
            className="rounded-lg border border-emerald-200 text-emerald-700 py-2 text-xs font-semibold hover:bg-emerald-50"
          >
            Test Drive
          </button>
          <button
            type="button"
            onClick={() => onToggleCompare(car)}
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
          onClick={() => onOpenReview(car)}
          className="w-full rounded-lg border border-amber-200 text-amber-700 py-2 text-xs font-semibold hover:bg-amber-50 mt-2"
        >
          Write Review
        </button>
      </div>
    </div>
  );
};
