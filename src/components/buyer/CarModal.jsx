import { CAR_IMAGE_FALLBACK, resolveCarImageFromCar } from "../../utils/carImage";
import { getCarAddedByDetails } from "../../utils/carOwnership";

const getFirstNumberFromText = (value) => {
  const match = String(value || "").replace(/,/g, "").match(/\d+/);
  return match ? Number(match[0]) : null;
};

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

export const CarModal = ({
  selectedCar,
  onClose,
  formatPrice,
  onBuyNow,
  onOpenInquiry,
  onOpenTestDrive,
}) => {
  if (!selectedCar) {
    return null;
  }

  const imageUrl = resolveCarImageFromCar(selectedCar) || CAR_IMAGE_FALLBACK;
  const addedBy = getCarAddedByDetails(selectedCar);
  const addedByRole = String(selectedCar?.addedByRole || selectedCar?.role || "seller")
    .replace(/_/g, " ")
    .toUpperCase();
  const numericPrice = Number(selectedCar?.price || 0);
  const averageMileage = getMileageAverage(selectedCar?.mileage);
  const pricePerKm = averageMileage && averageMileage > 0 ? Math.round(numericPrice / averageMileage) : null;
  const carAge = selectedCar?.year ? Math.max(0, new Date().getFullYear() - Number(selectedCar.year)) : null;
  const sellerPhoneRaw =
    selectedCar?.addedByMobile ||
    selectedCar?.mobile ||
    selectedCar?.phone ||
    selectedCar?.createdBy?.mobile ||
    selectedCar?.createdBy?.phone ||
    "";
  const sellerPhone = String(sellerPhoneRaw || "").replace(/\D/g, "");
  const hasPhone = sellerPhone.length >= 10;
  const hasEmail = String(addedBy?.email || "").includes("@");
  const whatsappHref = `https://wa.me/${sellerPhone}?text=${encodeURIComponent(
    `Hi ${addedBy?.name || "there"}, I am interested in ${selectedCar?.brand || ""} ${selectedCar?.model || ""}.`
  )}`;

  return (
    <div className="fixed inset-0 z-40 bg-slate-950/65 backdrop-blur-sm p-3 sm:p-5 flex items-center justify-center" onClick={onClose}>
      <div
        className="w-full max-w-4xl rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500 font-semibold">Car Details</p>
            <h2 className="text-lg sm:text-xl font-black text-slate-900">{selectedCar.brand || "Car"} {selectedCar.model || ""}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-9 w-9 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close car details"
          >
            x
          </button>
        </div>

        <div className="max-h-[80vh] overflow-y-auto p-5 sm:p-6">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-5">
            <div>
        <img
          src={imageUrl}
          alt={`${selectedCar.brand || "Car"} ${selectedCar.model || ""}`}
          className="h-64 sm:h-72 w-full object-cover rounded-2xl border border-slate-200"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = CAR_IMAGE_FALLBACK;
          }}
        />
            </div>

            <div className="flex flex-col gap-4">
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-amber-700 font-semibold">Price</p>
                <p className="text-3xl text-amber-700 font-black mt-1">{formatPrice(selectedCar.price)}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {pricePerKm && (
                    <span className="rounded-full bg-white border border-amber-200 px-2.5 py-1 text-xs font-semibold text-amber-800">
                      ~ {formatPrice(pricePerKm)} / km
                    </span>
                  )}
                  {carAge !== null && (
                    <span className="rounded-full bg-white border border-amber-200 px-2.5 py-1 text-xs font-semibold text-amber-800">
                      {carAge === 0 ? "Current Year Model" : `${carAge} years old`}
                    </span>
                  )}
                  {numericPrice > 0 && (
                    <span className="rounded-full bg-white border border-amber-200 px-2.5 py-1 text-xs font-semibold text-amber-800">
                      Approx value range: {formatPrice(Math.round(numericPrice * 0.95))} - {formatPrice(Math.round(numericPrice * 1.05))}
                    </span>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500 font-semibold">Quick Specs</p>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <p className="rounded-lg bg-white p-2.5 text-sm text-slate-700"><span className="font-semibold text-slate-900">Year:</span> {selectedCar.year || "N/A"}</p>
                  <p className="rounded-lg bg-white p-2.5 text-sm text-slate-700"><span className="font-semibold text-slate-900">Fuel:</span> {selectedCar.fuelType || "N/A"}</p>
                  <p className="rounded-lg bg-white p-2.5 text-sm text-slate-700"><span className="font-semibold text-slate-900">Transmission:</span> {selectedCar.transmission || "N/A"}</p>
                  <p className="rounded-lg bg-white p-2.5 text-sm text-slate-700"><span className="font-semibold text-slate-900">Mileage:</span> {selectedCar.mileage || "N/A"} km</p>
                </div>
              </div>

              <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs uppercase tracking-[0.14em] text-cyan-700 font-semibold">Added By</p>
                  <span className="rounded-full bg-cyan-100 border border-cyan-200 px-2.5 py-1 text-[11px] font-bold text-cyan-800">
                    {addedByRole}
                  </span>
                </div>
                <div className="grid gap-2 mt-3">
                  <p className="rounded-lg bg-white p-2.5 text-sm text-slate-700">
                    <span className="font-semibold text-slate-900">Name:</span> {addedBy.name || "-"}
                  </p>
                  <p className="rounded-lg bg-white p-2.5 text-sm text-slate-700 break-all">
                    <span className="font-semibold text-slate-900">Email:</span> {addedBy.email || "-"}
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <a
                      href={hasEmail ? `mailto:${addedBy.email}` : "#"}
                      onClick={(event) => {
                        if (!hasEmail) {
                          event.preventDefault();
                        }
                      }}
                      className={`text-center rounded-lg px-3 py-2 text-xs font-semibold ${
                        hasEmail
                          ? "bg-white border border-cyan-200 text-cyan-800 hover:bg-cyan-100"
                          : "bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed"
                      }`}
                    >
                      Email Seller
                    </a>
                    <a
                      href={hasPhone ? whatsappHref : "#"}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(event) => {
                        if (!hasPhone) {
                          event.preventDefault();
                        }
                      }}
                      className={`text-center rounded-lg px-3 py-2 text-xs font-semibold ${
                        hasPhone
                          ? "bg-white border border-cyan-200 text-cyan-800 hover:bg-cyan-100"
                          : "bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed"
                      }`}
                    >
                      WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-500 font-semibold">Description</p>
            <p className="text-slate-700 mt-2 leading-relaxed">
              {selectedCar.description || "No detailed description available for this car yet."}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-4 sm:px-6 bg-slate-50">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onOpenInquiry?.(selectedCar)}
              className="rounded-xl border border-cyan-200 text-cyan-800 bg-white hover:bg-cyan-50 px-4 py-2.5 text-sm font-semibold"
            >
              Inquiry
            </button>
            <button
              type="button"
              onClick={() => onOpenTestDrive?.(selectedCar)}
              className="rounded-xl border border-emerald-200 text-emerald-800 bg-white hover:bg-emerald-50 px-4 py-2.5 text-sm font-semibold"
            >
              Test Drive
            </button>
            <button
              type="button"
              onClick={() => onBuyNow?.(selectedCar)}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 text-sm font-semibold"
            >
              Buy Now
            </button>
          </div>
          <button type="button" onClick={onClose} className="bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-xl font-semibold">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
