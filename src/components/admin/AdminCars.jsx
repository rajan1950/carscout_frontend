import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const ADMIN_BASE_URL = "http://localhost:4444/admin";

export const AdminCars = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      await axios.delete(`${ADMIN_BASE_URL}/car/delete/${id}`);
      toast.success("Car deleted");
      setCars((prev) => prev.filter((car) => car._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-5">All Cars</h2>

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
                  <td className="px-4 py-3">
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
