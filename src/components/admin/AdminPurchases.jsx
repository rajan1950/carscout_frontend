import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { createNotificationForUser } from "../../services/notificationService";
import {
  deletePurchaseLocal,
  getAllPurchasesLocal,
  updatePurchaseStatusLocal,
} from "../../services/purchaseService";
import { buildPurchaseStatusMailTemplate } from "../../utils/mailTemplates";

const PURCHASED_CAR_STORAGE_KEY = "carscout.purchasedCarIds";
const PURCHASED_CARS_UPDATED_EVENT = "carscout-purchased-cars-updated";

const readPurchasedCarIds = () => {
  try {
    const raw = localStorage.getItem(PURCHASED_CAR_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const restoreCarToBuyerDashboard = (carId) => {
  if (!carId) {
    return;
  }

  const current = readPurchasedCarIds();
  const next = current.filter((id) => id !== carId);
  localStorage.setItem(PURCHASED_CAR_STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(PURCHASED_CARS_UPDATED_EVENT));
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

const formatPrice = (price) => {
  const numeric = Number(price || 0);

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(numeric);
};

export const AdminPurchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [savingStatus, setSavingStatus] = useState("");

  const refreshPurchases = () => {
    setPurchases(getAllPurchasesLocal());
  };

  useEffect(() => {
    refreshPurchases();

    const syncPurchases = () => {
      refreshPurchases();
    };

    window.addEventListener("storage", syncPurchases);

    return () => {
      window.removeEventListener("storage", syncPurchases);
    };
  }, []);

  const stats = useMemo(() => {
    const uniqueBuyers = new Set(
      purchases
        .map((item) => item?.buyer?.email || item?.buyer?.fullName || item?.userId || "")
        .filter(Boolean)
    ).size;

    const totalAmount = purchases.reduce(
      (sum, item) => sum + Number(item?.totalAmount || 0),
      0
    );

    return {
      totalPurchases: purchases.length,
      uniqueBuyers,
      totalAmount,
    };
  }, [purchases]);

  const normalizedSearch = searchQuery.trim().toLowerCase();

  const filteredPurchases = useMemo(() => {
    return purchases.filter((item) => {
      const carTitle = String(item?.carTitle || "").toLowerCase();
      const buyerName = String(item?.buyer?.fullName || "").toLowerCase();
      const buyerEmail = String(item?.buyer?.email || "").toLowerCase();
      const status = String(item?.status || "").toLowerCase();
      const orderId = String(item?.id || "").toLowerCase();

      const matchesSearch =
        normalizedSearch.length === 0 ||
        carTitle.includes(normalizedSearch) ||
        buyerName.includes(normalizedSearch) ||
        buyerEmail.includes(normalizedSearch) ||
        orderId.includes(normalizedSearch);

      const matchesStatus = statusFilter === "all" || status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [purchases, normalizedSearch, statusFilter]);

  const updateStatus = async (purchase, nextStatus) => {
    if (!purchase?.id || !nextStatus) {
      return;
    }

    setSavingStatus(purchase.id);

    try {
      const updated = updatePurchaseStatusLocal(purchase.id, nextStatus);

      if (!updated) {
        toast.error("Failed to update purchase status");
        return;
      }

      if (nextStatus === "cancelled") {
        restoreCarToBuyerDashboard(purchase.carId);
      }

      refreshPurchases();
      toast.success("Purchase status updated");

      if (purchase.userId && purchase.userId !== "guest") {
        try {
          const statusMailTemplate = buildPurchaseStatusMailTemplate({
            customerName: purchase?.buyer?.fullName,
            customerEmail: purchase?.buyer?.email,
            orderId: purchase?.id,
            carTitle: purchase?.carTitle,
            status: nextStatus,
            totalAmount: purchase?.totalAmount,
          });

          await createNotificationForUser({
            recipientId: purchase.userId,
            title: statusMailTemplate.subject,
            body: statusMailTemplate.text,
            type: "system",
            priority: "medium",
          });
        } catch {
          // Keep status update successful even if notification fails.
        }
      }
    } finally {
      setSavingStatus("");
    }
  };

  const removePurchase = (purchase) => {
    if (!purchase?.id) {
      return;
    }

    const confirmed = window.confirm("Delete this purchase record?");
    if (!confirmed) {
      return;
    }

    restoreCarToBuyerDashboard(purchase.carId);

    const deleted = deletePurchaseLocal(purchase.id);

    if (!deleted) {
      toast.error("Purchase record not found");
      return;
    }

    refreshPurchases();
    toast.success("Purchase record deleted");
  };

  return (
    <div>
      <h2 className="text-4xl font-bold text-slate-800 mb-8">Purchase Management</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-sm text-slate-500">Total Purchases</p>
          <p className="text-3xl font-bold text-indigo-700 mt-1">{stats.totalPurchases}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-sm text-slate-500">Unique Buyers</p>
          <p className="text-3xl font-bold text-cyan-700 mt-1">{stats.uniqueBuyers}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-sm text-slate-500">Revenue</p>
          <p className="text-3xl font-bold text-emerald-700 mt-1">{formatPrice(stats.totalAmount)}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 flex flex-col lg:flex-row gap-3 lg:items-center">
        <input
          type="text"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search by order id, buyer, or car"
          className="w-full lg:flex-1 border border-gray-300 rounded-xl px-4 py-3 text-base outline-none focus:ring-2 focus:ring-indigo-300"
        />
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="w-full lg:w-52 border border-gray-300 rounded-xl px-4 py-3 text-base outline-none focus:ring-2 focus:ring-indigo-300"
        >
          <option value="all">All Status</option>
          <option value="order_placed">Order Placed</option>
          <option value="processing">Processing</option>
          <option value="approved">Approved</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button
          type="button"
          onClick={refreshPurchases}
          className="w-full lg:w-auto bg-slate-800 hover:bg-black text-white rounded-xl px-6 py-3 font-semibold"
        >
          Refresh
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded-2xl border border-gray-200">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wider">
            <tr>
              <th className="text-left px-4 py-3">Order ID</th>
              <th className="text-left px-4 py-3">Car</th>
              <th className="text-left px-4 py-3">Buyer</th>
              <th className="text-left px-4 py-3">Amount</th>
              <th className="text-left px-4 py-3">Payment</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Placed At</th>
              <th className="text-left px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPurchases.map((item) => (
              <tr key={item.id} className="border-t border-gray-100">
                <td className="px-4 py-4 font-semibold text-slate-800">{item.id}</td>
                <td className="px-4 py-4 text-gray-700">{item.carTitle || "-"}</td>
                <td className="px-4 py-4 text-gray-700">
                  <p className="font-semibold text-slate-800">{item.buyer?.fullName || "-"}</p>
                  <p className="text-xs text-slate-500">{item.buyer?.email || "-"}</p>
                </td>
                <td className="px-4 py-4 text-gray-700">{formatPrice(item.totalAmount)}</td>
                <td className="px-4 py-4 text-gray-700 uppercase">{item.paymentMethod || "-"}</td>
                <td className="px-4 py-4">
                  <select
                    value={item.status || "order_placed"}
                    onChange={(event) => updateStatus(item, event.target.value)}
                    disabled={savingStatus === item.id}
                    className="border border-gray-300 rounded-lg px-2 py-1 text-xs font-semibold"
                  >
                    <option value="order_placed">Order Placed</option>
                    <option value="processing">Processing</option>
                    <option value="approved">Approved</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
                <td className="px-4 py-4 text-gray-600">{formatDate(item.placedAt)}</td>
                <td className="px-4 py-4">
                  <button
                    type="button"
                    onClick={() => removePurchase(item)}
                    className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {filteredPurchases.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
                  No purchase records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
