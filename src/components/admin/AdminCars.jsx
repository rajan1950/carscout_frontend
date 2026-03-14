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
  const [form, setForm] = useState(initialForm);
  const [editingCarId, setEditingCarId] = useState(null);

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

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      brand: form.brand,
      model: form.model,
      year: form.year ? Number(form.year) : undefined,
      price: form.price ? Number(form.price) : undefined,
      mileage: form.mileage ? Number(form.mileage) : undefined,
      fuelType: form.fuelType,
      transmission: form.transmission,
    };

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
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
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
  };

  useEffect(() => {
    fetchCars();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-5">All Cars</h2>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow border border-gray-100 p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-3"
      >
        <input
          name="brand"
          value={form.brand}
          onChange={handleChange}
          placeholder="Brand"
          required
          className="border border-gray-300 rounded px-3 py-2"
        />
        <input
          name="model"
          value={form.model}
          onChange={handleChange}
          placeholder="Model"
          required
          className="border border-gray-300 rounded px-3 py-2"
        />
        <input
          type="number"
          name="year"
          value={form.year}
          onChange={handleChange}
          placeholder="Year"
          className="border border-gray-300 rounded px-3 py-2"
        />
        <input
          type="number"
          name="price"
          value={form.price}
          onChange={handleChange}
          placeholder="Price"
          className="border border-gray-300 rounded px-3 py-2"
        />
        <input
          type="number"
          name="mileage"
          value={form.mileage}
          onChange={handleChange}
          placeholder="Mileage"
          className="border border-gray-300 rounded px-3 py-2"
        />
        <input
          name="fuelType"
          value={form.fuelType}
          onChange={handleChange}
          placeholder="Fuel type"
          className="border border-gray-300 rounded px-3 py-2"
        />
        <input
          name="transmission"
          value={form.transmission}
          onChange={handleChange}
          placeholder="Transmission"
          className="border border-gray-300 rounded px-3 py-2"
        />
        <div className="md:col-span-3 flex gap-2">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            {editingCarId ? "Update Car" : "Create Car"}
          </button>
          {editingCarId && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {loading && <p className="text-gray-600">Loading cars...</p>}
      {error && <p className="text-red-600 mb-3">{error}</p>}

      {!loading && !error && (
        <div className="overflow-x-auto bg-white rounded-xl shadow border border-gray-100">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="text-left px-4 py-3">Brand</th>
                <th className="text-left px-4 py-3">Model</th>
                <th className="text-left px-4 py-3">Year</th>
                <th className="text-left px-4 py-3">Price</th>
                <th className="text-left px-4 py-3">Fuel</th>
                <th className="text-left px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {cars.map((car) => (
                <tr key={car._id} className="border-t border-gray-100">
                  <td className="px-4 py-3">{car.brand || "-"}</td>
                  <td className="px-4 py-3">{car.model || "-"}</td>
                  <td className="px-4 py-3">{car.year || "-"}</td>
                  <td className="px-4 py-3">{car.price || "-"}</td>
                  <td className="px-4 py-3">{car.fuelType || "-"}</td>
                  <td className="px-4 py-3 flex gap-2">
                    <button
                      onClick={() => startEdit(car)}
                      className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(car._id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {cars.length === 0 && (
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
    </div>
  );
};
