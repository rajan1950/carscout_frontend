import { FaFilter } from "react-icons/fa";

export const FilterBar = ({
  query,
  setQuery,
  fuelFilter,
  setFuelFilter,
  sortBy,
  setSortBy,
}) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 md:p-5 mb-6">
      <div className="flex items-center gap-2 text-slate-800 mb-3 font-bold text-sm sm:text-base">
        <FaFilter /> Smart Filter Controls
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by brand, model, year"
          className="sm:col-span-2 md:col-span-2 rounded-xl border border-slate-200 px-3 sm:px-4 py-2.5 sm:py-3 text-sm outline-none focus:border-cyan-400"
        />
        <select
          value={fuelFilter}
          onChange={(event) => setFuelFilter(event.target.value)}
          className="rounded-xl border border-slate-200 px-3 sm:px-4 py-2.5 sm:py-3 text-sm outline-none focus:border-cyan-400"
        >
          <option value="all">All Fuel Type</option>
          <option value="petrol">Petrol</option>
          <option value="diesel">Diesel</option>
          <option value="electric">Electric</option>
          <option value="cng">CNG</option>
        </select>
        <select
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value)}
          className="rounded-xl border border-slate-200 px-3 sm:px-4 py-2.5 sm:py-3 text-sm outline-none focus:border-cyan-400"
        >
          <option value="latest">Sort: Latest</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="year-new">Year: Newest</option>
        </select>
      </div>
    </section>
  );
};
