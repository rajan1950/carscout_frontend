import { FaHeart } from "react-icons/fa";
import { CAR_IMAGE_FALLBACK, resolveCarImageFromCar } from "../../utils/carImage";

export const FavoriteSection = ({
  favoriteCars,
  formatPrice,
  onRemoveFromWishlist,
  onViewDetails,
  onBuyNow,
}) => {
  if (favoriteCars.length === 0) {
    return null;
  }

  return (
    <section className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 p-4">
      <h2 className="text-lg font-black text-rose-900 inline-flex items-center gap-2">
        <FaHeart /> Wishlist Cars
      </h2>
      <div className="mt-3 grid md:grid-cols-2 gap-4">
        {favoriteCars.map((car) => {
          const imageUrl = resolveCarImageFromCar(car) || CAR_IMAGE_FALLBACK;

          return (
            <div key={car._id} className="rounded-xl border border-rose-200 bg-white p-3 sm:p-4">
              <div className="grid sm:grid-cols-[170px_1fr] gap-4 items-start">
                <img
                  src={imageUrl}
                  alt={`${car.brand || "Car"} ${car.model || ""}`}
                  className="h-36 sm:h-32 w-full rounded-lg object-cover border border-rose-100"
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = CAR_IMAGE_FALLBACK;
                  }}
                />

                <div>
                  <p className="font-black text-slate-900 text-lg">{car.brand || "Unknown"} {car.model || "Model"}</p>
                  <p className="text-sm text-slate-600 mt-1">
                    {car.year || "N/A"} | {car.fuelType || "N/A"} | {car.transmission || "N/A"}
                  </p>
                  <p className="text-sm text-slate-600 mt-1">Mileage: {car.mileage || "N/A"} km</p>
                  <p className="text-base text-rose-700 font-black mt-2">{formatPrice(car.price)}</p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => onViewDetails(car)}
                      className="bg-slate-900 hover:bg-black text-white px-3 py-2 rounded-lg text-xs font-semibold"
                    >
                      View Full Details
                    </button>
                    <button
                      type="button"
                      onClick={() => onBuyNow(car)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg text-xs font-semibold"
                    >
                      Buy Now
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveFromWishlist(car._id)}
                      className="bg-rose-100 hover:bg-rose-200 text-rose-700 px-3 py-2 rounded-lg text-xs font-semibold"
                    >
                      Remove from Wishlist
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
