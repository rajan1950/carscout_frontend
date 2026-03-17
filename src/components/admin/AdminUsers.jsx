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
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [form, setForm] = useState(initialForm);
  const [editingUserId, setEditingUserId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const closeModal = () => {
    if (submitting) {
      return;
    }
    setIsModalOpen(false);
    resetForm();
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
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
      setIsModalOpen(false);
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
    setIsModalOpen(true);
  };

  const normalizedSearch = searchQuery.trim().toLowerCase();

  const filteredUsers = users.filter((user) => {
    const fullName = `${user.firstname || ""} ${user.lastname || ""}`
      .trim()
      .toLowerCase();
    const email = (user.email || "").toLowerCase();
    const role = (user.role || "buyer").toLowerCase();
    const status = (user.status || "active").toLowerCase();

    const matchesSearch =
      normalizedSearch.length === 0 ||
      fullName.includes(normalizedSearch) ||
      email.includes(normalizedSearch);

    const matchesRole = roleFilter === "all" || role === roleFilter;
    const matchesStatus = statusFilter === "all" || status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!isModalOpen) {
      return;
    }

    const onEscape = (event) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };

    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [isModalOpen, submitting]);

  return (
    <div>
      <h2 className="text-4xl font-bold text-slate-800 mb-8">User Management</h2>

      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 flex flex-col lg:flex-row gap-3 lg:items-center">
        <input
          type="text"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search users..."
          className="w-full lg:flex-1 border border-gray-300 rounded-xl px-4 py-3 text-base outline-none focus:ring-2 focus:ring-indigo-300"
        />

        <select
          value={roleFilter}
          onChange={(event) => setRoleFilter(event.target.value)}
          className="w-full lg:w-40 border border-gray-300 rounded-xl px-4 py-3 text-base outline-none focus:ring-2 focus:ring-indigo-300"
        >
          <option value="all">All Roles</option>
          <option value="buyer">Buyer</option>
          <option value="seller">Seller</option>
          <option value="admin">Admin</option>
        </select>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="w-full lg:w-44 border border-gray-300 rounded-xl px-4 py-3 text-base outline-none focus:ring-2 focus:ring-indigo-300"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="banned">Banned</option>
          <option value="pending">Pending</option>
          <option value="suspended">Suspended</option>
          <option value="deleted">Deleted</option>
          <option value="verified">Verified</option>
          <option value="unverified">Unverified</option>
        </select>

        <button
          type="button"
          onClick={openCreateModal}
          className="w-full lg:w-auto bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-3 font-semibold"
        >
          + Add User
        </button>
      </div>

      {loading && <p className="text-gray-600">Loading users...</p>}
      {error && <p className="text-red-600 mb-3">{error}</p>}

      {!loading && !error && (
        <div className="overflow-x-auto bg-white rounded-2xl border border-gray-200">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wider">
              <tr>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Role</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id} className="border-t border-gray-100">
                  <td className="px-4 py-4 font-semibold text-slate-800">{`${user.firstname || ""} ${user.lastname || ""}`.trim()}</td>
                  <td className="px-4 py-4 text-gray-600">{user.email}</td>
                  <td className="px-4 py-4 capitalize text-gray-700">{user.role || "buyer"}</td>
                  <td className="px-4 py-4">
                    <span className="inline-block capitalize bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">
                      {user.status || "active"}
                    </span>
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <button
                      onClick={() => startEdit(user)}
                      className="bg-slate-100 hover:bg-slate-200 text-indigo-700 px-3 py-2 rounded-lg"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
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
                {editingUserId ? "Update User" : "Add User"}
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
                name="firstname"
                value={form.firstname}
                onChange={handleChange}
                placeholder="First name"
                required
                className="border border-gray-300 rounded-xl px-3 py-2"
              />
              <input
                name="lastname"
                value={form.lastname}
                onChange={handleChange}
                placeholder="Last name"
                required
                className="border border-gray-300 rounded-xl px-3 py-2"
              />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email"
                required
                className="border border-gray-300 rounded-xl px-3 py-2"
              />

              {!editingUserId && (
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Password"
                  required
                  className="border border-gray-300 rounded-xl px-3 py-2"
                />
              )}

              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="border border-gray-300 rounded-xl px-3 py-2"
              >
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
                <option value="admin">Admin</option>
              </select>

              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="border border-gray-300 rounded-xl px-3 py-2"
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
                    : editingUserId
                    ? "Update User"
                    : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
