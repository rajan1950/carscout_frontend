import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  deleteWishlistItemByIdApi,
  getAllWishlistItemsApi,
} from "../../services/wishlistService";
import { CAR_IMAGE_FALLBACK, resolveCarImageFromCar } from "../../utils/carImage";

const getWishlistItems = (response) => {
  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response)) {
    return response;
  }

  return [];
};

const getUserName = (item) => {
  const user = item?.userId;

  if (user && typeof user === "object") {
    return (
      user.name ||
      user.fullName ||
      `${user.firstname || ""} ${user.lastname || ""}`.trim() ||
      user.email ||
      "Unknown User"
    );
  }

  return user || "Unknown User";
};

const getUserEmail = (item) => {
  const user = item?.userId;

  if (user && typeof user === "object") {
    return user.email || "-";
  }

  return "-";
};

const getCarLabel = (item) => {
  const car = item?.carId;

  if (car && typeof car === "object") {
    const brand = car.brand || "Unknown";
    const model = car.model || "Car";
    const year = car.year ? ` (${car.year})` : "";
    return `${brand} ${model}${year}`;
  }

  return car || "Unknown Car";
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
  }).format(date);
};

export const AdminWishlists = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchWishlists = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getAllWishlistItemsApi();
      setWishlistItems(getWishlistItems(response));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load wishlist items");
      setWishlistItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlists();
  }, []);

  const handleDelete = async (wishlistId) => {
    if (!wishlistId) {
      return;
    }

    const confirmed = window.confirm(
      "Delete this wishlist entry? This action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteWishlistItemByIdApi(wishlistId);
      setWishlistItems((prev) => prev.filter((item) => item._id !== wishlistId));
      toast.success("Wishlist item removed");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete wishlist item");
    }
  };

  const normalizedSearch = searchQuery.trim().toLowerCase();

  const filteredWishlistItems = useMemo(() => {
    if (!normalizedSearch) {
      return wishlistItems;
    }

    return wishlistItems.filter((item) => {
      const userName = getUserName(item).toLowerCase();
      const userEmail = getUserEmail(item).toLowerCase();
      const car = getCarLabel(item).toLowerCase();

      return (
        userName.includes(normalizedSearch) ||
        userEmail.includes(normalizedSearch) ||
        car.includes(normalizedSearch)
      );
    });
  }, [wishlistItems, normalizedSearch]);

  const stats = useMemo(() => {
    const uniqueUsers = new Set(
      wishlistItems.map((item) =>
        item?.userId && typeof item.userId === "object"
          ? item.userId._id || item.userId.id || item.userId.email
          : item?.userId
      )
    );

    const uniqueCars = new Set(
      wishlistItems.map((item) =>
        item?.carId && typeof item.carId === "object"
          ? item.carId._id || item.carId.id
          : item?.carId
      )
    );

    return {
      totalItems: wishlistItems.length,
      uniqueUsers: Array.from(uniqueUsers).filter(Boolean).length,
      uniqueCars: Array.from(uniqueCars).filter(Boolean).length,
    };
  }, [wishlistItems]);

  return (
    <div>
      <h2 className="text-4xl font-bold text-slate-800 mb-8">Wishlist Management</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-sm text-slate-500">Total Wishlist Items</p>
          <p className="text-3xl font-bold text-indigo-700 mt-1">{stats.totalItems}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-sm text-slate-500">Unique Users</p>
          <p className="text-3xl font-bold text-cyan-700 mt-1">{stats.uniqueUsers}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-sm text-slate-500">Unique Cars</p>
          <p className="text-3xl font-bold text-emerald-700 mt-1">{stats.uniqueCars}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 flex flex-col lg:flex-row gap-3 lg:items-center">
        <input
          type="text"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search by user, email, or car"
          className="w-full lg:flex-1 border border-gray-300 rounded-xl px-4 py-3 text-base outline-none focus:ring-2 focus:ring-indigo-300"
        />
        <button
          type="button"
          onClick={fetchWishlists}
          className="w-full lg:w-auto bg-slate-800 hover:bg-black text-white rounded-xl px-6 py-3 font-semibold"
        >
          Refresh
        </button>
      </div>

      {loading && <p className="text-gray-600">Loading wishlist entries...</p>}
      {error && <p className="text-red-600 mb-3">{error}</p>}

      {!loading && !error && (
        <div className="overflow-x-auto bg-white rounded-2xl border border-gray-200">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wider">
              <tr>
                <th className="text-left px-4 py-3">Car</th>
                <th className="text-left px-4 py-3">User</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Added On</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredWishlistItems.map((item) => {
                const car = item?.carId && typeof item.carId === "object" ? item.carId : null;
                const imageUrl = car ? resolveCarImageFromCar(car) : "";

                return (
                  <tr key={item._id || `${item.userId}-${item.carId}`} className="border-t border-gray-100">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3 min-w-[240px]">
                        <img
                          src={imageUrl || CAR_IMAGE_FALLBACK}
                          alt={getCarLabel(item)}
                          className="w-14 h-14 rounded-lg object-cover border border-gray-200"
                          onError={(event) => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.src = CAR_IMAGE_FALLBACK;
                          }}
                        />
                        <div>
                          <p className="font-semibold text-slate-800">{getCarLabel(item)}</p>
                          <p className="text-xs text-slate-500">
                            {car?.fuelType || "N/A"} | {car?.transmission || "N/A"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-700">{getUserName(item)}</td>
                    <td className="px-4 py-4 text-slate-600">{getUserEmail(item)}</td>
                    <td className="px-4 py-4 text-slate-600">
                      {formatDate(item?.createdAt || item?.updatedAt)}
                    </td>
                    <td className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() => handleDelete(item._id)}
                        className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredWishlistItems.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                    No wishlist items found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
