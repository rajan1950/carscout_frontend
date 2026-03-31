import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import UserNavbar from "../layouts/UserNavbar";
import { isAuthenticated, updateAuthProfile } from "../utils/auth";
import {
  extractApiErrorMessage,
  getAuthToken,
  getUserProfileApi,
  updateUserProfileApi,
} from "../services/profileService";

const createForm = (profile = {}) => ({
  fullName: profile.fullName || "",
  email: profile.email || "",
  mobile: profile.mobile || "",
  address: profile.address || "",
  city: profile.city || "",
  area: profile.area || "",
  pincode: profile.pincode || "",
  profileImage: profile.profileImage || "",
  profilePhotoFile: null,
});

const parseApiUserToForm = (user = {}) => {
  const firstName = String(user.firstname || user.firstName || "").trim();
  const lastName = String(user.lastname || user.lastName || "").trim();
  const computedFullName = `${firstName} ${lastName}`.trim();

  return createForm({
    fullName:
      computedFullName ||
      String(user.fullName || user.name || user.username || "").trim(),
    email: String(user.email || "").trim(),
    mobile: String(user.mobile || "").replace(/\D/g, ""),
    address: String(user.address || "").trim(),
    city: String(user.city || "").trim(),
    area: String(user.area || "").trim(),
    pincode: String(user.pinCode || user.pincode || "").replace(/\D/g, ""),
    profileImage: String(user.profilepic || user.profileImage || user.image || "").trim(),
  });
};

const splitFullName = (fullName = "") => {
  const words = String(fullName)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return { firstName: "", lastName: "" };
  }

  if (words.length === 1) {
    return { firstName: words[0], lastName: "" };
  }

  return {
    firstName: words[0],
    lastName: words.slice(1).join(" "),
  };
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(() => ({ name: "", email: "" }));
  const [form, setForm] = useState(() => createForm());
  const [errors, setErrors] = useState({});
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadProfileFromApi = async ({ showErrorToast = true } = {}) => {
    const token = getAuthToken();

    if (!token) {
      if (showErrorToast) {
        toast.error("Session expired. Please login again.");
      }
      navigate("/login");
      return false;
    }

    try {
      const response = await getUserProfileApi(token);
      const apiUser = response?.data?.user || {};
      const apiForm = parseApiUserToForm(apiUser);

      setForm(apiForm);
      setProfile({
        name: apiForm.fullName,
        email: apiForm.email,
      });

      // Keep auth cache synced with DB-backed profile to update shared UI (navbar, menus).
      updateAuthProfile({
        name: apiForm.fullName,
        email: apiForm.email,
        mobile: apiForm.mobile,
        address: apiForm.address,
        city: apiForm.city,
        area: apiForm.area,
        pincode: apiForm.pincode,
        profileImage: apiForm.profileImage,
      });

      return true;
    } catch (error) {
      const status = error?.response?.status;
      const message = extractApiErrorMessage(error);

      if (status === 401) {
        toast.error(message || "Session expired. Please login again.");
        navigate("/login");
        return false;
      }

      if (showErrorToast) {
        toast.error(message);
      }

      return false;
    }
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }

    const bootstrap = async () => {
      setIsLoadingProfile(true);
      await loadProfileFromApi({ showErrorToast: true });
      setIsLoadingProfile(false);
    };

    bootstrap();
  }, [navigate]);

  const initials = useMemo(() => {
    const words = String(form.fullName || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }

    if (words.length === 1) {
      return words[0].slice(0, 2).toUpperCase();
    }

    return "PR";
  }, [form.name]);

  const completePercent = useMemo(() => {
    const required = [form.fullName, form.email, form.mobile, form.address, form.city, form.area, form.pincode];
    const done = required.filter((value) => String(value || "").trim()).length;
    return Math.round((done / required.length) * 100);
  }, [form]);

  const onInput = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: name === "mobile" || name === "pincode" ? value.replace(/\D/g, "") : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const onImageUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, profileImage: "Please upload an image file" }));
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, profileImage: "Image size must be under 2MB" }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({
        ...prev,
        profileImage: String(reader.result || ""),
        profilePhotoFile: file,
      }));
      setErrors((prev) => ({ ...prev, profileImage: "" }));
    };
    reader.onerror = () => {
      setErrors((prev) => ({ ...prev, profileImage: "Unable to read selected image" }));
    };

    reader.readAsDataURL(file);
  };

  const removeUploadedPhoto = () => {
    setForm((prev) => ({ ...prev, profileImage: "", profilePhotoFile: null }));
    if (errors.profileImage) {
      setErrors((prev) => ({ ...prev, profileImage: "" }));
    }
  };

  const validate = () => {
    const next = {};

    if (!form.fullName.trim()) {
      next.fullName = "Full name is required";
    }

    if (!form.email.trim()) {
      next.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      next.email = "Enter a valid email";
    }

    if (!form.mobile.trim()) {
      next.mobile = "Mobile number is required";
    } else if (form.mobile.trim().length !== 10) {
      next.mobile = "Mobile must be 10 digits";
    }

    if (!form.address.trim()) {
      next.address = "Address is required";
    }

    if (!form.city.trim()) {
      next.city = "City is required";
    }

    if (!form.area.trim()) {
      next.area = "Area is required";
    }

    if (!form.pincode.trim()) {
      next.pincode = "Pin code is required";
    } else if (form.pincode.trim().length !== 6) {
      next.pincode = "Pin code must be 6 digits";
    }

    return next;
  };

  const onSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      toast.error("Please fix profile form errors.");
      return;
    }

    const token = getAuthToken();

    if (!token) {
      toast.error("Session expired. Please login again.");
      navigate("/login");
      return;
    }

    const payload = new FormData();
    payload.append("fullName", form.fullName.trim());
    payload.append("email", form.email.trim());
    payload.append("mobile", form.mobile.trim());
    payload.append("pincode", form.pincode.trim());
    payload.append("address", form.address.trim());
    payload.append("city", form.city.trim());
    payload.append("area", form.area.trim());

    if (form.profilePhotoFile) {
      payload.append("profilePhoto", form.profilePhotoFile);
    }

    setIsSaving(true);

    try {
      const updateResponse = await updateUserProfileApi(token, payload);

      if (updateResponse.status !== 200) {
        toast.error("Unable to save profile right now.");
        return;
      }

      const refreshed = await loadProfileFromApi({ showErrorToast: true });

      if (!refreshed) {
        return;
      }

      toast.success("Profile updated successfully.");
    } catch (error) {
      const status = error?.response?.status;
      const message = extractApiErrorMessage(error);

      if (status === 401) {
        toast.error(message || "Session expired. Please login again.");
        navigate("/login");
        return;
      }

      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const fieldClass =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f2fbff,_#f8fafc_35%,_#eef4f7_100%)]">
      <UserNavbar />

      <main className="mx-auto max-w-5xl px-6 py-8">
        <section className="mb-6 rounded-2xl border border-cyan-100 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center gap-4">
            {form.profileImage ? (
              <img
                src={form.profileImage}
                alt="Profile"
                className="h-16 w-16 rounded-full border border-cyan-200 object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cyan-700 text-lg font-bold text-white">
                {initials}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p className="truncate text-xl font-black text-slate-900">{profile.name || "Your Profile"}</p>
              <p className="truncate text-sm text-slate-600">{profile.email || "Signed in user"}</p>
            </div>

            <div className="w-full sm:w-56">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Profile Completion</p>
              <div className="h-2.5 rounded-full bg-slate-200">
                <div
                  className="h-2.5 rounded-full bg-cyan-600 transition-all"
                  style={{ width: `${completePercent}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-slate-600">{completePercent}% complete</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-cyan-100 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-black text-slate-900">Complete Profile</h1>
          <p className="mt-1 text-sm text-slate-600">
            Add your full profile details including address, city, area, pin code and mobile number.
          </p>

          {isLoadingProfile ? (
            <p className="mt-4 text-sm text-slate-600">Loading profile...</p>
          ) : null}

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Full Name</label>
                <input name="fullName" value={form.fullName} onChange={onInput} className={fieldClass} />
                {errors.fullName ? <p className="mt-1 text-xs text-rose-600">{errors.fullName}</p> : null}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
                <input name="email" value={form.email} onChange={onInput} className={fieldClass} />
                {errors.email ? <p className="mt-1 text-xs text-rose-600">{errors.email}</p> : null}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Mobile</label>
                <input
                  name="mobile"
                  value={form.mobile}
                  onChange={onInput}
                  maxLength={10}
                  className={fieldClass}
                  placeholder="10-digit mobile"
                />
                {errors.mobile ? <p className="mt-1 text-xs text-rose-600">{errors.mobile}</p> : null}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Pin Code</label>
                <input
                  name="pincode"
                  value={form.pincode}
                  onChange={onInput}
                  maxLength={6}
                  className={fieldClass}
                  placeholder="6-digit pin code"
                />
                {errors.pincode ? <p className="mt-1 text-xs text-rose-600">{errors.pincode}</p> : null}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Address</label>
              <textarea
                name="address"
                value={form.address}
                onChange={onInput}
                rows={3}
                className={fieldClass}
                placeholder="House no, street, landmark"
              />
              {errors.address ? <p className="mt-1 text-xs text-rose-600">{errors.address}</p> : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">City</label>
                <input name="city" value={form.city} onChange={onInput} className={fieldClass} />
                {errors.city ? <p className="mt-1 text-xs text-rose-600">{errors.city}</p> : null}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Area</label>
                <input name="area" value={form.area} onChange={onInput} className={fieldClass} />
                {errors.area ? <p className="mt-1 text-xs text-rose-600">{errors.area}</p> : null}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Profile Photo (optional)</label>
              <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={onImageUpload}
                  className="block w-full text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-cyan-700 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-cyan-800"
                />
                <p className="mt-2 text-xs text-slate-500">Supported: JPG, PNG, WEBP. Max size: 2MB.</p>
                {form.profileImage ? (
                  <button
                    type="button"
                    onClick={removeUploadedPhoto}
                    className="mt-2 text-xs font-semibold text-rose-600 hover:text-rose-700"
                  >
                    Remove uploaded photo
                  </button>
                ) : null}
              </div>
              {errors.profileImage ? <p className="mt-1 text-xs text-rose-600">{errors.profileImage}</p> : null}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
              <p className="text-xs text-slate-500">Your profile data is securely synced with your account.</p>
              <button
                type="submit"
                disabled={isLoadingProfile || isSaving}
                className="rounded-lg bg-cyan-700 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800"
              >
                {isSaving ? "Saving..." : "Save Profile"}
              </button>
              
            </div>
          </form>
        </section>
      </main>
    </div>
  );
};

export default ProfilePage;
