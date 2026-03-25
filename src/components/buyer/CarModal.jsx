import { CAR_IMAGE_FALLBACK, resolveCarImageFromCar } from "../../utils/carImage";

export const CarModal = ({ selectedCar, onClose, formatPrice }) => {
  if (!selectedCar) {
    return null;
  }

  const imageUrl = resolveCarImageFromCar(selectedCar) || CAR_IMAGE_FALLBACK;

  return (
    <div className="fixed inset-0 z-40 bg-black/50 p-4 flex items-center justify-center" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-2xl bg-white border border-slate-200 p-6" onClick={(event) => event.stopPropagation()}>
        <img
          src={imageUrl}
          alt={`${selectedCar.brand || "Car"} ${selectedCar.model || ""}`}
          className="h-56 w-full object-cover rounded-xl border border-slate-200"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = CAR_IMAGE_FALLBACK;
          }}
        />
        <h3 className="text-2xl font-black text-slate-900 mt-4">{selectedCar.brand} {selectedCar.model}</h3>
        <p className="text-slate-600 mt-2">{selectedCar.description || "No detailed description available."}</p>
        <div className="grid sm:grid-cols-2 gap-3 mt-4">
          <p className="rounded-lg bg-slate-50 p-3 text-sm"><span className="font-semibold">Year:</span> {selectedCar.year || "N/A"}</p>
          <p className="rounded-lg bg-slate-50 p-3 text-sm"><span className="font-semibold">Fuel:</span> {selectedCar.fuelType || "N/A"}</p>
          <p className="rounded-lg bg-slate-50 p-3 text-sm"><span className="font-semibold">Transmission:</span> {selectedCar.transmission || "N/A"}</p>
          <p className="rounded-lg bg-slate-50 p-3 text-sm"><span className="font-semibold">Mileage:</span> {selectedCar.mileage || "N/A"} km</p>
        </div>
        <p className="text-2xl text-amber-700 font-black mt-4">{formatPrice(selectedCar.price)}</p>
        <div className="flex justify-end mt-5">
          <button type="button" onClick={onClose} className="bg-slate-900 text-white px-4 py-2 rounded-lg font-semibold">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
