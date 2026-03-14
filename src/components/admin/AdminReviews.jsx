import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const REVIEW_BASE_URL = "http://localhost:4444/reviews";

const initialForm = {
  userId: "",
  carId: "",
  rating: "",
  comment: "",
};

export const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`${REVIEW_BASE_URL}/all`);
      setReviews(Array.isArray(res.data) ? res.data : []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const startEdit = (item) => {
    setEditingId(item._id);
    setForm({
      userId: item.userId?._id || item.userId || "",
      carId: item.carId?._id || item.carId || "",
      rating: item.rating || "",
      comment: item.comment || "",
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      userId: form.userId,
      carId: form.carId,
      rating: Number(form.rating),
      comment: form.comment,
    };

    try {
      if (editingId) {
        const res = await axios.put(`${REVIEW_BASE_URL}/${editingId}`, payload);
        const updated = res.data;
        if (updated?._id) {
          setReviews((prev) =>
            prev.map((item) => (item._id === updated._id ? updated : item))
          );
        } else {
          fetchReviews();
        }
        toast.success("Review updated");
      } else {
        const res = await axios.post(`${REVIEW_BASE_URL}/add`, payload);
        const created = res.data?.data;
        if (created?._id) {
          setReviews((prev) => [created, ...prev]);
        } else {
          fetchReviews();
        }
        toast.success("Review created");
      }
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${REVIEW_BASE_URL}/${id}`);
      setReviews((prev) => prev.filter((item) => item._id !== id));
      toast.success("Review deleted");
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-5">Reviews</h2>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow border border-gray-100 p-4 mb-6 grid grid-cols-1 md:grid-cols-2 gap-3"
      >
        <input
          name="userId"
          value={form.userId}
          onChange={handleChange}
          placeholder="User ID"
          required
          className="border border-gray-300 rounded px-3 py-2"
        />
        <input
          name="carId"
          value={form.carId}
          onChange={handleChange}
          placeholder="Car ID"
          required
          className="border border-gray-300 rounded px-3 py-2"
        />
        <input
          type="number"
          min="1"
          max="5"
          name="rating"
          value={form.rating}
          onChange={handleChange}
          placeholder="Rating (1-5)"
          required
          className="border border-gray-300 rounded px-3 py-2"
        />
        <input
          name="comment"
          value={form.comment}
          onChange={handleChange}
          placeholder="Comment"
          className="border border-gray-300 rounded px-3 py-2"
        />
        <div className="md:col-span-2 flex gap-2">
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
          >
            {editingId ? "Update Review" : "Create Review"}
          </button>
          {editingId && (
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

      {loading && <p className="text-gray-600">Loading reviews...</p>}
      {error && <p className="text-red-600 mb-3">{error}</p>}

      {!loading && !error && (
        <div className="overflow-x-auto bg-white rounded-xl shadow border border-gray-100">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="text-left px-4 py-3">User</th>
                <th className="text-left px-4 py-3">Car</th>
                <th className="text-left px-4 py-3">Rating</th>
                <th className="text-left px-4 py-3">Comment</th>
                <th className="text-left px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((item) => (
                <tr key={item._id} className="border-t border-gray-100">
                  <td className="px-4 py-3">{item.userId?.firstname || item.userId || "-"}</td>
                  <td className="px-4 py-3">{item.carId?.brand || item.carId || "-"}</td>
                  <td className="px-4 py-3">{item.rating || "-"}</td>
                  <td className="px-4 py-3">{item.comment || "-"}</td>
                  <td className="px-4 py-3 flex gap-2">
                    <button
                      onClick={() => startEdit(item)}
                      className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {reviews.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                    No reviews found
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
