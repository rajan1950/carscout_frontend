import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const ADMIN_BASE_URL = "http://localhost:4444/admin";
const CAR_BASE_URL = "http://localhost:4444/car";

const initialForm = {
  brand: "",
  model: "",
  year: "",
  price: "",
  mileage: "",
  fuelType: "",
  transmission: "",
};

export const AdminCars = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
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

    const payload = {
      brand: form.brand,
      model: form.model,
      year: form.year ? Number(form.year) : undefined,
      price: form.price ? Number(form.price) : undefined,
      mileage: form.mileage ? Number(form.mileage) : undefined,
      fuelType: form.fuelType,
      transmission: form.transmission,
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
        const res = await axios.post(`${CAR_BASE_URL}/add`, payload);
        const createdCar = res.data?.data;
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
      year: car.year || "",
      price: car.price || "",
      mileage: car.mileage || "",
      fuelType: car.fuelType || "",
      transmission: car.transmission || "",
    });
    setIsModalOpen(true);
  };

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filteredCars = cars.filter((car) => {
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

  return (
    <div>
      <h2 className="text-4xl font-bold text-slate-800 mb-8">Car Management</h2>

      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 flex flex-col lg:flex-row gap-3 lg:items-center">
        <input
          type="text"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search cars..."
          className="w-full lg:flex-1 border border-gray-300 rounded-xl px-4 py-3 text-base outline-none focus:ring-2 focus:ring-indigo-300"
        />
        <button
          type="button"
          onClick={openCreateModal}
          className="w-full lg:w-auto bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-3 font-semibold"
        >
          + Add Car
        </button>
      </div>

      {loading && <p className="text-gray-600">Loading cars...</p>}
      {error && <p className="text-red-600 mb-3">{error}</p>}

      {!loading && !error && (
        <div className="overflow-x-auto bg-white rounded-2xl border border-gray-200">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wider">
              <tr>
                <th className="text-left px-4 py-3">Brand</th>
                <th className="text-left px-4 py-3">Model</th>
                <th className="text-left px-4 py-3">Year</th>
                <th className="text-left px-4 py-3">Price</th>
                <th className="text-left px-4 py-3">Fuel</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCars.map((car) => (
                <tr key={car._id} className="border-t border-gray-100">
                  <td className="px-4 py-4 font-semibold text-slate-800">{car.brand || "-"}</td>
                  <td className="px-4 py-4 text-gray-700">{car.model || "-"}</td>
                  <td className="px-4 py-4 text-gray-600">{car.year || "-"}</td>
                  <td className="px-4 py-4 text-gray-600">{car.price || "-"}</td>
                  <td className="px-4 py-4 text-gray-600">{car.fuelType || "-"}</td>
                  <td className="px-4 py-3 flex gap-2">
                    <button
                      onClick={() => startEdit(car)}
                      className="bg-slate-100 hover:bg-slate-200 text-indigo-700 px-3 py-2 rounded-lg"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(car._id)}
                      className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filteredCars.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
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
            className="w-full max-w-3xl bg-white rounded-2xl border border-gray-200 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-slate-800">
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

            <form onSubmit={handleSubmit} className="p-5 grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                name="brand"
                value={form.brand}
                onChange={handleChange}
                placeholder="Brand"
                required
                className="border border-gray-300 rounded-xl px-3 py-2"
              />
              <input
                name="model"
                value={form.model}
                onChange={handleChange}
                placeholder="Model"
                required
                className="border border-gray-300 rounded-xl px-3 py-2"
              />
              <input
                type="number"
                name="year"
                value={form.year}
                onChange={handleChange}
                placeholder="Year"
                className="border border-gray-300 rounded-xl px-3 py-2"
              />
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="Price"
                className="border border-gray-300 rounded-xl px-3 py-2"
              />
              <input
                type="number"
                name="mileage"
                value={form.mileage}
                onChange={handleChange}
                placeholder="Mileage"
                className="border border-gray-300 rounded-xl px-3 py-2"
              />
              <input
                name="fuelType"
                value={form.fuelType}
                onChange={handleChange}
                placeholder="Fuel type"
                className="border border-gray-300 rounded-xl px-3 py-2"
              />
              <input
                name="transmission"
                value={form.transmission}
                onChange={handleChange}
                placeholder="Transmission"
                className="border border-gray-300 rounded-xl px-3 py-2 md:col-span-2"
              />

              <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
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
