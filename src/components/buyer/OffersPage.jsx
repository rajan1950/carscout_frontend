import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { getAuthProfile, getAuthUserId } from "../../utils/auth";
import { getMyOffersApi, updateOfferApi } from "../../services/offerService";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(price || 0));

const resolveId = (value) => {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  return value._id || value.id || "";
};

const getDisplayName = (user) => {
  if (!user) {
    return "Unknown";
  }

  if (typeof user === "string") {
    return user;
  }

  const first = String(user.firstname || "").trim();
  const last = String(user.lastname || "").trim();
  const full = `${first} ${last}`.trim();
  return full || user.email || "Unknown";
};

export const OffersPage = () => {
  const profile = getAuthProfile();
  const userId = getAuthUserId();

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState(
    profile.role === "seller" ? "received" : profile.role === "admin" ? "" : "sent"
  );
  const [submittingOfferId, setSubmittingOfferId] = useState("");

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const response = await getMyOffersApi({
        type: typeFilter || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
      });
      const items = Array.isArray(response?.data) ? response.data : [];
      setOffers(items);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load offers");
      setOffers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, [typeFilter, statusFilter]);

  const visibleTypeOptions = useMemo(() => {
    if (profile.role === "admin") {
      return [
        { value: "", label: "All" },
        { value: "sent", label: "Sent" },
        { value: "received", label: "Received" },
      ];
    }

    if (profile.role === "seller") {
      return [
        { value: "received", label: "Received" },
        { value: "sent", label: "Sent" },
      ];
    }

    return [
      { value: "sent", label: "Sent" },
      { value: "received", label: "Received" },
    ];
  }, [profile.role]);

  const canAct = (offer) => {
    if (!userId) {
      return false;
    }

    const nextActionBy = resolveId(offer?.nextActionBy);
    if (!nextActionBy) {
      return false;
    }

    return nextActionBy === userId;
  };

  const handleAction = async (offer, action) => {
    if (!offer?._id || submittingOfferId) {
      return;
    }

    setSubmittingOfferId(offer._id);

    try {
      await updateOfferApi(offer._id, { action });

      toast.success(`Offer ${action}ed successfully`);
      await fetchOffers();
    } catch (err) {
      toast.error(err?.response?.data?.message || `Failed to ${action} offer`);
    } finally {
      setSubmittingOfferId("");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
      <section className="rounded-3xl border border-cyan-100 bg-gradient-to-r from-slate-900 via-slate-800 to-cyan-800 text-white p-6 sm:p-8 mb-6">
        <p className="uppercase text-xs tracking-[0.18em] text-cyan-200">Offer Center</p>
        <h1 className="text-3xl md:text-4xl font-black mt-2">Manage Car Offers</h1>
        <p className="text-cyan-100 mt-3 max-w-3xl">
          Track negotiations, accept or reject offers, and send counters in one place.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 mb-5 flex flex-wrap gap-3 items-center">
        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Type</label>
          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            className="mt-1 block rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            {visibleTypeOptions.map((item) => (
              <option key={item.label} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Status</label>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="mt-1 block rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="countered">Countered</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <Link
          to="/customer"
          className="ml-auto rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Back To Dashboard
        </Link>
      </section>

      {loading && <p className="text-slate-600">Loading offers...</p>}

      {!loading && offers.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-slate-600">
          No offers found for the selected filters.
        </div>
      )}

      {!loading && offers.length > 0 && (
        <div className="space-y-4">
          {offers.map((offer) => {
            const buyerName = getDisplayName(offer?.buyerId);
            const sellerName = getDisplayName(offer?.sellerId);
            const carTitle = `${offer?.carId?.brand || "Car"} ${offer?.carId?.model || "Model"}`;
            const actionAllowed =
              profile.role === "seller" && canAct(offer) && ["pending", "countered"].includes(offer?.status);

            return (
              <article key={offer._id} className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.12em] text-slate-500">{carTitle}</p>
                    <p className="text-xl font-black text-slate-900 mt-1">{formatPrice(offer.offeredPrice)}</p>
                    <p className="text-sm text-slate-600 mt-2">Buyer: {buyerName}</p>
                    <p className="text-sm text-slate-600">Seller: {sellerName}</p>
                    <p className="text-sm text-slate-600 mt-1">Message: {offer?.message || "-"}</p>
                  </div>

                  <div className="text-right">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-slate-700">
                      {offer.status}
                    </span>
                    <p className="text-xs text-slate-500 mt-2">
                      Last action by: {getDisplayName(offer?.lastActionBy)}
                    </p>
                    <p className="text-xs text-slate-500">
                      Waiting on: {getDisplayName(offer?.nextActionBy) || "None"}
                    </p>
                  </div>
                </div>

                {actionAllowed && (
                  <div className="mt-4 border-t border-slate-200 pt-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={submittingOfferId === offer._id}
                        onClick={() => handleAction(offer, "accept")}
                        className="rounded-lg bg-emerald-600 px-4 py-2 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50"
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        disabled={submittingOfferId === offer._id}
                        onClick={() => handleAction(offer, "reject")}
                        className="rounded-lg bg-rose-600 px-4 py-2 text-white text-sm font-semibold hover:bg-rose-700 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
