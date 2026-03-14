import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const ADMIN_BASE_URL = "http://localhost:4444/admin";
const USER_BASE_URL = "http://localhost:4444/user";

const initialForm = {
  firstname: "",
  lastname: "",
  email: "",
  password: "",
  role: "buyer",
  status: "active",
};

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(initialForm);
  const [editingUserId, setEditingUserId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

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
      await axios.delete(`${USER_BASE_URL}/getallusers/${id}`);
      toast.success("User deleted");
      setUsers((prev) => prev.filter((user) => user._id !== id));
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
    setEditingUserId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) {
      return;
    }

    setSubmitting(true);
    try {
      if (editingUserId) {
        const payload = {
          firstname: form.firstname,
          lastname: form.lastname,
          email: form.email,
          role: form.role,
          status: form.status,
        };

        const res = await axios.put(
          `${USER_BASE_URL}/getallusers/${editingUserId}`,
          payload
        );

        const updatedUser = res.data?.user;
        if (updatedUser?._id) {
          setUsers((prev) =>
            prev.map((item) =>
              item._id === updatedUser._id ? updatedUser : item
            )
          );
        } else {
          fetchUsers();
        }

        toast.success("User updated");
      } else {
        const payload = {
          firstname: form.firstname,
          lastname: form.lastname,
          email: form.email,
          password: form.password,
          role: form.role,
        };

        const res = await axios.post(`${USER_BASE_URL}/register`, payload);
        const createdUser = res.data?.user;

        if (createdUser?._id) {
          setUsers((prev) => [createdUser, ...prev]);
        } else {
          fetchUsers();
        }
        toast.success("User created");
      }

      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (user) => {
    setEditingUserId(user._id);
    setForm({
      firstname: user.firstname || "",
      lastname: user.lastname || "",
      email: user.email || "",
      password: "",
      role: user.role || "buyer",
      status: user.status || "active",
    });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-5">All Users</h2>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow border border-gray-100 p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-3"
      >
        <input
          name="firstname"
          value={form.firstname}
          onChange={handleChange}
          placeholder="First name"
          required
          className="border border-gray-300 rounded px-3 py-2"
        />
        <input
          name="lastname"
          value={form.lastname}
          onChange={handleChange}
          placeholder="Last name"
          required
          className="border border-gray-300 rounded px-3 py-2"
        />
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          required
          className="border border-gray-300 rounded px-3 py-2"
        />
        {!editingUserId && (
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            required
            className="border border-gray-300 rounded px-3 py-2"
          />
        )}
        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="border border-gray-300 rounded px-3 py-2"
        >
          <option value="buyer">Buyer</option>
          <option value="seller">Seller</option>
          <option value="admin">Admin</option>
        </select>
        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className="border border-gray-300 rounded px-3 py-2"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="banned">Banned</option>
          <option value="pending">Pending</option>
          <option value="suspended">Suspended</option>
          <option value="deleted">Deleted</option>
          <option value="verified">Verified</option>
          <option value="unverified">Unverified</option>
        </select>
        <div className="md:col-span-3 flex gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            {submitting
              ? "Please wait..."
              : editingUserId
              ? "Update User"
              : "Create User"}
          </button>
          {editingUserId && (
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
                  <td className="px-4 py-3 flex gap-2">
                    <button
                      onClick={() => startEdit(user)}
                      className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded"
                    >
                      Edit
                    </button>
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
