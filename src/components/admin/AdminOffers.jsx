import { useEffect, useMemo, useState } from "react";
import { getMyOffersApi } from "../../services/offerService";

const formatPrice = (price) => {
  const numeric = Number(price || 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(numeric);
};

const formatDate = (value) => {
  const date = value ? new Date(value) : null;

  if (!date || Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-IN", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const getUserLabel = (user) => {
  if (!user) {
    return "-";
  }

  if (typeof user === "string") {
    return user;
  }

  const first = String(user.firstname || "").trim();
  const last = String(user.lastname || "").trim();
  const name = `${first} ${last}`.trim();

  return name || user.email || "-";
};

export const AdminOffers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchOffers = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getMyOffersApi({
        status: statusFilter === "all" ? undefined : statusFilter,
      });

      const data = Array.isArray(response?.data) ? response.data : [];
      setOffers(data);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load offers");
      setOffers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, [statusFilter]);

  const stats = useMemo(() => {
    const total = offers.length;
    const pending = offers.filter((item) => item.status === "pending").length;
    const accepted = offers.filter((item) => item.status === "accepted").length;
    const rejected = offers.filter((item) => item.status === "rejected").length;

    return {
      total,
      pending,
      accepted,
      rejected,
    };
  }, [offers]);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredOffers = useMemo(() => {
    return offers.filter((item) => {
      if (!normalizedQuery) {
        return true;
      }

      const carText = `${item?.carId?.brand || ""} ${item?.carId?.model || ""}`.toLowerCase();
      const buyerText = getUserLabel(item?.buyerId).toLowerCase();
      const sellerText = getUserLabel(item?.sellerId).toLowerCase();
      const statusText = String(item?.status || "").toLowerCase();

      return (
        carText.includes(normalizedQuery) ||
        buyerText.includes(normalizedQuery) ||
        sellerText.includes(normalizedQuery) ||
        statusText.includes(normalizedQuery)
      );
    });
  }, [offers, normalizedQuery]);

  return (
    <div>
      <h2 className="text-4xl font-bold text-slate-800 mb-8">Offer Management</h2>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-sm text-slate-500">Total Offers</p>
          <p className="text-3xl font-bold text-indigo-700 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-sm text-slate-500">Pending</p>
          <p className="text-3xl font-bold text-amber-700 mt-1">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-sm text-slate-500">Accepted</p>
          <p className="text-3xl font-bold text-emerald-700 mt-1">{stats.accepted}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-sm text-slate-500">Rejected</p>
          <p className="text-3xl font-bold text-rose-700 mt-1">{stats.rejected}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 flex flex-col lg:flex-row gap-3 lg:items-center">
        <input
          type="text"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search by car, buyer, seller, or status"
          className="w-full lg:flex-1 border border-gray-300 rounded-xl px-4 py-3 text-base outline-none focus:ring-2 focus:ring-indigo-300"
        />
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="w-full lg:w-52 border border-gray-300 rounded-xl px-4 py-3 text-base outline-none focus:ring-2 focus:ring-indigo-300"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
          <option value="countered">Countered</option>
        </select>
        <button
          type="button"
          onClick={fetchOffers}
          className="w-full lg:w-auto bg-slate-800 hover:bg-black text-white rounded-xl px-6 py-3 font-semibold"
        >
          Refresh
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded-2xl border border-gray-200">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wider">
            <tr>
              <th className="text-left px-4 py-3">Car</th>
              <th className="text-left px-4 py-3">Buyer</th>
              <th className="text-left px-4 py-3">Seller</th>
              <th className="text-left px-4 py-3">Offer Price</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Message</th>
              <th className="text-left px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                  Loading offers...
                </td>
              </tr>
            )}

            {!loading && filteredOffers.map((item) => (
              <tr key={item._id} className="border-t border-gray-100">
                <td className="px-4 py-4 text-slate-700 font-semibold">
                  {(item?.carId?.brand || "Car")} {(item?.carId?.model || "")}
                </td>
                <td className="px-4 py-4 text-gray-700">{getUserLabel(item?.buyerId)}</td>
                <td className="px-4 py-4 text-gray-700">{getUserLabel(item?.sellerId)}</td>
                <td className="px-4 py-4 text-gray-700">{formatPrice(item?.offeredPrice)}</td>
                <td className="px-4 py-4">
                  <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-slate-700">
                    {item?.status || "-"}
                  </span>
                </td>
                <td className="px-4 py-4 text-gray-700 max-w-sm">
                  <p className="truncate">{item?.message || "-"}</p>
                </td>
                <td className="px-4 py-4 text-gray-600">{formatDate(item?.createdAt)}</td>
              </tr>
            ))}

            {!loading && filteredOffers.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                  No offers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
