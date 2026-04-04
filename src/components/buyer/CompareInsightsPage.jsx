import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaBalanceScale,
  FaBolt,
  FaCarSide,
  FaCheckCircle,
  FaChevronDown,
  FaGasPump,
  FaRoad,
  FaRobot,
  FaSearch,
  FaTrashAlt,
  FaUsers,
} from "react-icons/fa";
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

const toDisplay = (value, suffix = "") => {
  if (value === null || value === undefined || value === "") {
    return "Data Unavailable";
  }
  const normalized = String(value).trim();
  if (!normalized) {
    return "Data Unavailable";
  }
  return `${normalized}${suffix}`;
};

const getSeats = (car) => {
  const raw = car?.seatingCapacity ?? car?.seats ?? car?.seatCapacity;
  if (!raw) {
    return "5";
  }
  return String(raw);
};

const getEngineCc = (car) => {
  const raw = car?.engineDisplacement ?? car?.engineCC ?? car?.engine;
  if (!raw) {
    return "Data Unavailable";
  }
  const digits = String(raw).match(/\d+/g);
  return digits?.[0] || "Data Unavailable";
};

const getKmpl = (car) => {
  const mileage = String(car?.mileage || "").match(/\d+(\.\d+)?/);
  return mileage?.[0] || "Data Unavailable";
};

const getSpecCategories = (cars) => {
  const first = cars[0] || {};
  const specs = {
    "Comfort and convenience": [
      { label: "Air conditioner", value: (car) => toDisplay(car.airConditioner || first.airConditioner || "Yes") },
      { label: "Power steering", value: (car) => toDisplay(car.powerSteering || first.powerSteering || "Yes") },
      { label: "Accessory power outlet", value: (car) => toDisplay(car.accessoryPowerOutlet || "Data Unavailable") },
      { label: "Adjustable seats", value: (car) => toDisplay(car.adjustableSeats || "Data Unavailable") },
      { label: "Automatic climate control", value: (car) => toDisplay(car.climateControl || "Data Unavailable") },
      { label: "Rear AC vents", value: (car) => toDisplay(car.rearAcVents || "Data Unavailable") },
      { label: "Cruise control", value: (car) => toDisplay(car.cruiseControl || "Data Unavailable") },
    ],
    "Dimensions and capacity": [
      { label: "Seating capacity", value: (car) => toDisplay(getSeats(car)) },
      { label: "Boot space", value: (car) => toDisplay(car.bootSpace, " L") },
      { label: "Length", value: (car) => toDisplay(car.length, " mm") },
      { label: "Width", value: (car) => toDisplay(car.width, " mm") },
      { label: "Wheelbase", value: (car) => toDisplay(car.wheelbase, " mm") },
    ],
    "Engine and transmission": [
      { label: "Engine displacement", value: (car) => toDisplay(getEngineCc(car), " cc") },
      { label: "Fuel type", value: (car) => toDisplay(car.fuelType) },
      { label: "Transmission", value: (car) => toDisplay(car.transmission) },
      { label: "Mileage", value: (car) => toDisplay(getKmpl(car), " kmpl") },
      { label: "Drive type", value: (car) => toDisplay(car.driveType || "Data Unavailable") },
    ],
    Safety: [
      { label: "ABS", value: (car) => toDisplay(car.abs || "Data Unavailable") },
      { label: "Airbags", value: (car) => toDisplay(car.airbags || "Data Unavailable") },
      { label: "Rear parking camera", value: (car) => toDisplay(car.rearCamera || "Data Unavailable") },
      { label: "Hill assist", value: (car) => toDisplay(car.hillAssist || "Data Unavailable") },
      { label: "Electronic stability control", value: (car) => toDisplay(car.esc || "Data Unavailable") },
    ],
  };

  return specs;
};

export const CompareInsightsPage = () => {
  const [compareCars, setCompareCars] = useState(() => readStoredCompareList());
  const [activeTab, setActiveTab] = useState("highlights");
  const [showDifferences, setShowDifferences] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [expandedSections, setExpandedSections] = useState({
    "Comfort and convenience": true,
    "Dimensions and capacity": false,
    "Engine and transmission": false,
    Safety: false,
  });
  const [showMoreMap, setShowMoreMap] = useState({});

  const rankedCars = useMemo(() => {
    if (!compareCars.length) {
      return [];
    }
    return scoreCars(compareCars);
  }, [compareCars]);

  const bestCar = rankedCars[0] || null;
  const specCategories = useMemo(() => getSpecCategories(rankedCars), [rankedCars]);

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

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleShowMore = (section) => {
    setShowMoreMap((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const tabButtonClass = (tab) =>
    `px-4 py-2 rounded-full text-xs sm:text-sm font-semibold border transition ${
      activeTab === tab
        ? "bg-slate-950 text-white border-slate-950"
        : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
    }`;

  const categoryRows = (section, rows) => {
    const filtered = rows.filter((row) =>
      row.label.toLowerCase().includes(searchText.trim().toLowerCase())
    );

    const differenceFiltered = showDifferences
      ? filtered.filter((row) => {
          const values = rankedCars.map((car) => row.value(car));
          return new Set(values).size > 1;
        })
      : filtered;

    const rowsToShow = showMoreMap[section] ? differenceFiltered : differenceFiltered.slice(0, 6);

    return { differenceFiltered, rowsToShow };
  };

  return (
    <div className="pb-10">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 inline-flex items-center gap-3">
            <FaBalanceScale className="text-cyan-700" /> Compare Cars
          </h1>
          <div className="flex items-center gap-2">
            <Link
              to="/customer"
              className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-semibold"
            >
              Back to Buyer Dashboard
            </Link>
            <button
              type="button"
              onClick={clearAll}
              className="border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold"
            >
              Clear Compare
            </button>
          </div>
        </div>

        <p className="text-slate-500 text-sm mt-3">
          Compare price, mileage, engine and practical specs side-by-side.
        </p>

        <div className="sticky top-0 z-20 mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {rankedCars.map((car) => (
              <article key={car._id} className="rounded-xl bg-white border border-slate-200 px-3 py-3 relative">
                <button
                  type="button"
                  onClick={() => removeCar(car._id)}
                  className="absolute right-2 top-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 px-2 py-1 rounded-md inline-flex items-center gap-1"
                >
                  <FaTrashAlt /> Remove
                </button>
                <div className="flex items-center gap-3 pr-20">
                  <img
                    src={resolveCarImageFromCar(car) || CAR_IMAGE_FALLBACK}
                    alt={`${car.brand || "Car"} ${car.model || ""}`}
                    className="w-24 h-16 object-cover rounded-lg"
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = CAR_IMAGE_FALLBACK;
                    }}
                  />
                  <div>
                    <p className="text-sm text-slate-500">{car.brand || "Brand"}</p>
                    <h3 className="font-black text-slate-900 leading-tight">{car.model || "Model"}</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {car.transmission || "N/A"} | {car.fuelType || "N/A"}
                    </p>
                    <p className="text-sm font-bold text-cyan-700 mt-1">{formatPrice(car.price)}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 flex-wrap mt-5">
          <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
            <FaSearch className="text-slate-400" />
            <input
              type="text"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Search specs, features and details"
              className="bg-transparent outline-none text-sm w-64 max-w-[70vw]"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button type="button" onClick={() => setActiveTab("highlights")} className={tabButtonClass("highlights")}>
              Highlights
            </button>
            <button type="button" onClick={() => setActiveTab("specs")} className={tabButtonClass("specs")}>
              Specs & features
            </button>
            <button type="button" onClick={() => setActiveTab("more")} className={tabButtonClass("more")}>
              More comparisons
            </button>
          </div>
        </div>
      </section>

      {activeTab === "highlights" && (
        <section className="mt-6 rounded-3xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-5 sm:p-7">
          <h2 className="text-2xl font-black text-slate-900 mb-5">Highlights</h2>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-separate border-spacing-y-3">
              <thead>
                <tr>
                  <th className="text-left text-sm font-semibold text-slate-500 px-3 py-2">Feature</th>
                  {rankedCars.map((car) => (
                    <th key={`label-${car._id}`} className="text-center text-base font-black text-slate-900 px-3 py-2">
                      {car.brand} {car.model}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {[
                  {
                    key: "price",
                    label: "Ex-showroom Price",
                    icon: <FaCarSide className="text-cyan-600" />,
                    render: (car) => formatPrice(car.price),
                  },
                  {
                    key: "seat",
                    label: "Seating Capacity",
                    icon: <FaUsers className="text-cyan-600" />,
                    render: (car) => toDisplay(getSeats(car)),
                  },
                  {
                    key: "mileage",
                    label: "ARAI mileage",
                    icon: <FaRoad className="text-cyan-600" />,
                    render: (car) => toDisplay(getKmpl(car), " kmpl"),
                  },
                  {
                    key: "engine",
                    label: "Engine displacement",
                    icon: <FaBolt className="text-cyan-600" />,
                    render: (car) => toDisplay(getEngineCc(car), " cc"),
                  },
                  {
                    key: "fuel",
                    label: "Fuel type",
                    icon: <FaGasPump className="text-cyan-600" />,
                    render: (car) => toDisplay(car.fuelType),
                  },
                  {
                    key: "transmission",
                    label: "Transmission",
                    icon: <FaBalanceScale className="text-cyan-600" />,
                    render: (car) => toDisplay(car.transmission),
                  },
                  {
                    key: "year",
                    label: "Model year",
                    icon: <FaCheckCircle className="text-cyan-600" />,
                    render: (car) => toDisplay(car.year),
                  },
                  {
                    key: "score",
                    label: "AI score",
                    icon: <FaRobot className="text-cyan-600" />,
                    render: (car) => `${car.aiScore} / 100`,
                  },
                ].map((row) => (
                  <tr key={row.key}>
                    <td className="px-3 py-4 bg-white border border-slate-200 rounded-xl text-slate-700 font-semibold">
                      <span className="inline-flex items-center gap-2">
                        {row.icon}
                        {row.label}
                      </span>
                    </td>
                    {rankedCars.map((car) => (
                      <td
                        key={`${row.key}-${car._id}`}
                        className="px-3 py-4 bg-white border border-slate-200 rounded-xl text-center font-black text-slate-900"
                      >
                        {row.render(car)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === "specs" && (
        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 sm:p-7">
          <div className="flex items-center justify-between gap-2 flex-wrap mb-4">
            <h2 className="text-2xl font-black text-slate-900">Specs & features</h2>
            <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer select-none">
              Show differences
              <input
                type="checkbox"
                checked={showDifferences}
                onChange={(event) => setShowDifferences(event.target.checked)}
                className="accent-slate-900"
              />
            </label>
          </div>

          <div className="space-y-3">
            {Object.entries(specCategories).map(([section, rows]) => {
              const { differenceFiltered, rowsToShow } = categoryRows(section, rows);
              const open = !!expandedSections[section];

              return (
                <article key={section} className="rounded-xl border border-slate-200 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleSection(section)}
                    className="w-full px-4 py-3 bg-cyan-50 text-left font-bold text-slate-900 inline-flex items-center justify-between"
                  >
                    <span>{section}</span>
                    <FaChevronDown className={`transition ${open ? "rotate-180" : ""}`} />
                  </button>

                  {open && (
                    <div className="overflow-x-auto">
                      {differenceFiltered.length === 0 ? (
                        <p className="px-4 py-4 text-sm text-slate-500">No matching items for current filters.</p>
                      ) : (
                        <table className="w-full min-w-[820px] text-sm">
                          <tbody>
                            {rowsToShow.map((row) => (
                              <tr key={`${section}-${row.label}`} className="border-t border-slate-100">
                                <td className="px-4 py-2 text-slate-500 w-1/3">{row.label}</td>
                                {rankedCars.map((car) => (
                                  <td key={`${section}-${row.label}-${car._id}`} className="px-4 py-2 text-center font-semibold text-slate-900">
                                    {row.value(car)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}

                      {differenceFiltered.length > 6 && (
                        <div className="px-4 py-3 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => toggleShowMore(section)}
                            className="text-sm font-semibold text-slate-700 hover:text-slate-950"
                          >
                            {showMoreMap[section] ? "Show less" : "Show more"}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      )}

      {activeTab === "more" && (
        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 sm:p-7">
          <h2 className="text-2xl font-black text-slate-900">More comparisons</h2>
          <p className="text-sm text-slate-500 mt-1">AI ranking summary based on year, mileage, fuel profile and pricing.</p>

          {bestCar && (
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <h3 className="font-black text-emerald-900 inline-flex items-center gap-2">
                <FaRobot /> AI Recommendation: {bestCar.brand} {bestCar.model}
              </h3>
              <p className="text-sm text-emerald-800 font-semibold mt-1">AI Score: {bestCar.aiScore} / 100</p>
              <div className="mt-2 space-y-1 text-sm text-emerald-900">
                {reasons.map((reason) => (
                  <p key={reason} className="inline-flex items-center gap-2">
                    <FaCheckCircle /> {reason}
                  </p>
                ))}
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 mt-5">
            {rankedCars.map((car, index) => (
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
                  <div className="inline-flex text-xs font-bold rounded-full bg-slate-900 text-white px-2 py-1">
                    Rank #{index + 1}
                  </div>
                  <h3 className="text-lg font-black text-slate-900 mt-2">{car.brand} {car.model}</h3>
                  <p className="text-sm text-slate-600 mt-1">{car.description || "No description provided."}</p>

                  <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                    <p className="rounded-md bg-slate-50 px-2 py-1"><span className="font-semibold">Year:</span> {toDisplay(car.year)}</p>
                    <p className="rounded-md bg-slate-50 px-2 py-1"><span className="font-semibold">Fuel:</span> {toDisplay(car.fuelType)}</p>
                    <p className="rounded-md bg-slate-50 px-2 py-1"><span className="font-semibold">Mileage:</span> {toDisplay(getKmpl(car), " kmpl")}</p>
                    <p className="rounded-md bg-slate-50 px-2 py-1"><span className="font-semibold">Score:</span> {car.aiScore}</p>
                  </div>

                  <p className="text-lg font-black text-amber-700 mt-3">{formatPrice(car.price)}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
