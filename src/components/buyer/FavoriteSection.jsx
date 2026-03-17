import { FaHeart } from "react-icons/fa";

export const FavoriteSection = ({ favoriteCars, formatPrice }) => {
  if (favoriteCars.length === 0) {
    return null;
  }

  return (
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
  );
};
