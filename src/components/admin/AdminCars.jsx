import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { getAuthProfile, getAuthUserId, readAuthSession } from "../../utils/auth";
import {
  getPurchasedCarIdsLocal,
  PURCHASED_CARS_UPDATED_EVENT,
  syncPurchasedCarIdsFromPurchases,
} from "../../services/purchaseService";
import {
  buildCarCreatorPayload,
  getCarAddedByDetails,
  saveCarCreatorMeta,
} from "../../utils/carOwnership";
import { normalizeOwnerForApi } from "../../utils/owner";

const ADMIN_BASE_URL = "http://localhost:4444/admin";
const CAR_BASE_URL = "http://localhost:4444/car";

const initialForm = {
  brand: "",
  model: "",
  city: "",
  year: "",
  owner: "",
  price: "",
  mileage: "",
  fuelType: "",
  transmission: "",
  description: "",
  imageFile: null,
};

export const AdminCars = () => {
  const profile = getAuthProfile();
  const userId = getAuthUserId();
  const session = readAuthSession();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [purchasedCarIds, setPurchasedCarIds] = useState(() => getPurchasedCarIdsLocal());
  const [form, setForm] = useState(initialForm);
  const [editingCarId, setEditingCarId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchCars = async () => {
    try {
      const res = await axios.get(`${ADMIN_BASE_URL}/cars`);
      setCars(Array.isArray(res.data) ? res.data : []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load cars");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${CAR_BASE_URL}/${id}`);
      toast.success("Car deleted");
      setCars((prev) => prev.filter((car) => car._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingCarId(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (submitting) {
      return;
    }
    setIsModalOpen(false);
    resetForm();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) {
      return;
    }

    const normalizedOwner = normalizeOwnerForApi(form.owner);

    const payload = {
      brand: form.brand,
      model: form.model,
        city: form.city,
      year: form.year ? Number(form.year) : undefined,
        owner: normalizedOwner,
      price: form.price ? Number(form.price) : undefined,
        mileage: form.mileage,
      fuelType: form.fuelType,
      transmission: form.transmission,
        description: form.description,
    };

    setSubmitting(true);
    try {
      if (editingCarId) {
        const res = await axios.put(`${CAR_BASE_URL}/${editingCarId}`, payload);
        const updatedCar = res.data;
        if (updatedCar?._id) {
          setCars((prev) =>
            prev.map((item) => (item._id === updatedCar._id ? updatedCar : item))
          );
        } else {
          fetchCars();
        }
        toast.success("Car updated");
      } else {
        const creatorPayload = buildCarCreatorPayload({
          userId,
          role: session?.role,
          name: profile.name,
          email: profile.email,
        });

        const formData = new FormData();
        Object.entries({ ...payload, ...creatorPayload }).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, String(value));
          }
        });
        if (form.imageFile) {
          formData.append("image", form.imageFile);
        }

        const res = await axios.post(`${CAR_BASE_URL}/add`, formData);
        const createdCar = res.data?.data;
        const createdCarId = createdCar?._id || res.data?._id || "";
        saveCarCreatorMeta(createdCarId, {
          name: profile.name,
          email: profile.email,
          userId,
          role: session?.role,
        });
        if (createdCar?._id) {
          setCars((prev) => [createdCar, ...prev]);
        } else {
          fetchCars();
        }
        toast.success("Car created");
      }

      resetForm();
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (car) => {
    setEditingCarId(car._id);
    setForm({
      brand: car.brand || "",
      model: car.model || "",
      city: car.city || "",
      year: car.year || "",
      owner: car.owner || "",
      price: car.price || "",
      mileage: car.mileage || "",
      fuelType: car.fuelType || "",
      transmission: car.transmission || "",
      description: car.description || "",
      imageFile: null,
    });
    setIsModalOpen(true);
  };

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filteredCars = cars.filter((car) => {
    if (purchasedCarIds.includes(car._id)) {
      return false;
    }

    if (!normalizedSearch) {
      return true;
    }

    const brand = (car.brand || "").toLowerCase();
    const model = (car.model || "").toLowerCase();
    const fuel = (car.fuelType || "").toLowerCase();
    const transmission = (car.transmission || "").toLowerCase();

    return (
      brand.includes(normalizedSearch) ||
      model.includes(normalizedSearch) ||
      fuel.includes(normalizedSearch) ||
      transmission.includes(normalizedSearch)
    );
  });

  useEffect(() => {
    fetchCars();
  }, []);

  useEffect(() => {
    const syncPurchasedCars = () => {
      setPurchasedCarIds(getPurchasedCarIdsLocal());
    };

    syncPurchasedCarIdsFromPurchases();
    syncPurchasedCars();

    window.addEventListener("storage", syncPurchasedCars);
    window.addEventListener(PURCHASED_CARS_UPDATED_EVENT, syncPurchasedCars);

    return () => {
      window.removeEventListener("storage", syncPurchasedCars);
      window.removeEventListener(PURCHASED_CARS_UPDATED_EVENT, syncPurchasedCars);
    };
  }, []);

  return (
    <div>
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800 mb-4 sm:mb-8">Car Management</h2>

      <div className="bg-white rounded-2xl border border-gray-200 p-3 sm:p-4 mb-6 flex flex-col gap-2 sm:gap-3 sm:flex-row sm:items-center">
        <input
          type="text"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search cars..."
          className="flex-1 border border-gray-300 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
        />
        <button
          type="button"
          onClick={openCreateModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 sm:px-6 py-2.5 sm:py-3 font-semibold text-sm sm:text-base whitespace-nowrap"
        >
          + Add Car
        </button>
      </div>

      {loading && <p className="text-gray-600">Loading cars...</p>}
      {error && <p className="text-red-600 mb-3">{error}</p>}

      {!loading && !error && (
        <div className="overflow-x-auto bg-white rounded-2xl border border-gray-200">
          <table className="min-w-full text-xs sm:text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-[10px] sm:text-xs tracking-wider">
              <tr>
                <th className="text-left px-2 sm:px-4 py-2 sm:py-3">Brand</th>
                <th className="text-left px-2 sm:px-4 py-2 sm:py-3">Model</th>
                <th className="text-left px-2 sm:px-4 py-2 sm:py-3">Year</th>
                <th className="text-left px-2 sm:px-4 py-2 sm:py-3">Price</th>
                <th className="hidden sm:table-cell text-left px-2 sm:px-4 py-2 sm:py-3">Fuel</th>
                <th className="hidden md:table-cell text-left px-2 sm:px-4 py-2 sm:py-3">Added By</th>
                <th className="hidden md:table-cell text-left px-2 sm:px-4 py-2 sm:py-3">Email</th>
                <th className="text-left px-2 sm:px-4 py-2 sm:py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCars.map((car) => {
                const addedBy = getCarAddedByDetails(car);

                return (
                <tr key={car._id} className="border-t border-gray-100">
                  <td className="px-2 sm:px-4 py-3 sm:py-4 font-semibold text-slate-800 text-xs sm:text-sm">{car.brand || "-"}</td>
                  <td className="px-2 sm:px-4 py-3 sm:py-4 text-gray-700 text-xs sm:text-sm">{car.model || "-"}</td>
                  <td className="px-2 sm:px-4 py-3 sm:py-4 text-gray-600 text-xs sm:text-sm">{car.year || "-"}</td>
                  <td className="px-2 sm:px-4 py-3 sm:py-4 text-gray-600 text-xs sm:text-sm">{car.price || "-"}</td>
                  <td className="hidden sm:table-cell px-2 sm:px-4 py-3 sm:py-4 text-gray-600 text-xs sm:text-sm">{car.fuelType || "-"}</td>
                  <td className="hidden md:table-cell px-2 sm:px-4 py-3 sm:py-4 text-gray-600 text-xs sm:text-sm">{addedBy.name}</td>
                  <td className="hidden md:table-cell px-2 sm:px-4 py-3 sm:py-4 text-gray-600 text-xs sm:text-sm">{addedBy.email}</td>
                  <td className="px-2 sm:px-4 py-3 sm:py-4 flex flex-col sm:flex-row gap-1 sm:gap-2">
                    <button
                      onClick={() => startEdit(car)}
                      className="bg-slate-100 hover:bg-slate-200 text-indigo-700 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm whitespace-nowrap"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(car._id)}
                      className="bg-red-50 hover:bg-red-100 text-red-600 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm whitespace-nowrap"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );})}
              {filteredCars.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-2 sm:px-4 py-6 text-center text-gray-500 text-sm">
                    No cars found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-2xl sm:max-w-3xl bg-white rounded-2xl border border-gray-200 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3 sm:p-5 border-b border-gray-200 sticky top-0 bg-white">
              <h3 className="text-base sm:text-lg md:text-xl font-semibold text-slate-800">
                {editingCarId ? "Update Car" : "Add Car"}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
                aria-label="Close"
              >
                x
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-3 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              <input
                name="brand"
                value={form.brand}
                onChange={handleChange}
                placeholder="Brand"
                required
                className="border border-gray-300 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
              />
              <input
                name="model"
                value={form.model}
                onChange={handleChange}
                placeholder="Model"
                required
                className="border border-gray-300 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
              />
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="City"
                required
                className="border border-gray-300 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
              />
              <input
                type="number"
                name="year"
                value={form.year}
                onChange={handleChange}
                placeholder="Year"
                required
                className="border border-gray-300 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
              />
              <input
                name="owner"
                value={form.owner}
                onChange={handleChange}
                placeholder="Owner (e.g. 1 owner)"
                required
                className="border border-gray-300 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
              />
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="Price"
                required
                className="border border-gray-300 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
              />
              <input
                name="mileage"
                value={form.mileage}
                onChange={handleChange}
                placeholder="Mileage"
                required
                className="border border-gray-300 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
              />
              <input
                name="fuelType"
                value={form.fuelType}
                onChange={handleChange}
                placeholder="Fuel type"
                required
                className="border border-gray-300 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
              />
              <input
                name="transmission"
                value={form.transmission}
                onChange={handleChange}
                placeholder="Transmission"
                required
                className="border border-gray-300 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
              />
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Description"
                rows={3}
                className="border border-gray-300 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300 sm:col-span-2"
              />
              {!editingCarId && (
                <div className="sm:col-span-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => {
                      const file = event.target.files?.[0] || null;
                      setForm((prev) => ({ ...prev, imageFile: file }));
                    }}
                    required={!editingCarId}
                    className="border border-gray-300 rounded-xl px-3 py-2 w-full text-sm"
                  />
                </div>
              )}

              <div className="sm:col-span-2 flex flex-col sm:flex-row justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                >
                  {submitting
                    ? "Please wait..."
                    : editingCarId
                    ? "Update Car"
                    : "Create Car"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
