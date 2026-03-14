import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const ADMIN_BASE_URL = "http://localhost:4444/admin";

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${ADMIN_BASE_URL}/users`);
      setUsers(Array.isArray(res.data) ? res.data : []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${ADMIN_BASE_URL}/user/delete/${id}`);
      toast.success("User deleted");
      setUsers((prev) => prev.filter((user) => user._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-5">All Users</h2>

      {loading && <p className="text-gray-600">Loading users...</p>}
      {error && <p className="text-red-600 mb-3">{error}</p>}

      {!loading && !error && (
        <div className="overflow-x-auto bg-white rounded-xl shadow border border-gray-100">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Role</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-t border-gray-100">
                  <td className="px-4 py-3">{`${user.firstname || ""} ${user.lastname || ""}`.trim()}</td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3 capitalize">{user.role || "buyer"}</td>
                  <td className="px-4 py-3 capitalize">{user.status || "active"}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                    No users found
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
