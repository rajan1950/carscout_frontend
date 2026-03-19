import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaChevronLeft } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";

const initialForm = {
  brand: "",
  model: "",
  city: "",
  year: "",
  owner: "",
  mileage: "",
  fuelType: "",
  transmission: "",
  price: "",
  description: "",
};

const stepConfig = [
  { key: "brand", label: "Brand", title: "Select your car brand" },
  { key: "model", label: "Model", title: "Select your car model" },
  { key: "city", label: "City", title: "Select RTO location" },
  { key: "year", label: "Year", title: "Select manufacturing year" },
  { key: "owner", label: "Owner", title: "Select ownership" },
  { key: "mileage", label: "Mileage", title: "Select mileage range" },
  { key: "fuelType", label: "Fuel", title: "Select fuel type" },
  { key: "transmission", label: "Transmission", title: "Select transmission" },
  { key: "price", label: "Price", title: "Set expected price" },
];

const options = {
  brand: ["Maruti Suzuki", "Hyundai", "Honda", "Tata", "Mahindra", "BMW", "Audi", "Toyota"],
  city: ["Ahmedabad", "Mumbai", "Delhi", "Bangalore", "Pune", "Hyderabad", "Chennai"],
  owner: ["1st owner", "2nd owner", "3rd owner", "4th owner"],
  mileage: [
    "0 - 10,000 km",
    "10,000 - 20,000 km",
    "20,000 - 30,000 km",
    "30,000 - 40,000 km",
    "40,000 - 50,000 km",
    "50,000 - 60,000 km",
    "60,000 - 70,000 km",
  ],
  fuelType: ["Petrol", "Diesel", "Electric", "CNG"],
  transmission: ["Manual", "Automatic"],
};

const modelByBrand = {
  "Maruti Suzuki": ["Swift", "Baleno", "Brezza", "Dzire"],
  Hyundai: ["i20", "Creta", "Venue", "Verna"],
  Honda: ["City", "Amaze", "Elevate"],
  Tata: ["Nexon", "Harrier", "Altroz", "Punch"],
  Mahindra: ["XUV300", "XUV700", "Scorpio", "Thar"],
  BMW: ["3 Series", "5 Series", "X1", "X3"],
  Audi: ["A4", "A6", "Q3", "Q5"],
  Toyota: ["Innova", "Fortuner", "Glanza", "Hyryder"],
};

const yearOptions = Array.from({ length: 15 }, (_, i) => String(new Date().getFullYear() - i));

const SellCarModel = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [carImageFile, setCarImageFile] = useState(null);
  const [carImagePreview, setCarImagePreview] = useState("");
  const [carImageError, setCarImageError] = useState("");

  const selectedStep = stepConfig[step];

  const modelOptions = useMemo(
    () => (form.brand ? modelByBrand[form.brand] || [] : []),
    [form.brand]
  );

  const selectValue = (key, value) => {
    setForm((prev) => {
      if (key === "brand") {
        return { ...prev, brand: value, model: "" };
      }
      return { ...prev, [key]: value };
    });

    if (step < stepConfig.length - 1) {
      setStep((prev) => prev + 1);
    }
  };

  const closeAndReset = () => {
    if (carImagePreview) {
      URL.revokeObjectURL(carImagePreview);
    }
    setStep(0);
    setForm(initialForm);
    setSubmitting(false);
    setCarImageFile(null);
    setCarImagePreview("");
    setCarImageError("");
    onClose();
  };

  const nextStep = () => {
    if (step < stepConfig.length - 1) {
      setStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (step > 0) {
      setStep((prev) => prev - 1);
    }
  };

  const canSubmit =
    form.brand &&
    form.model &&
    form.city &&
    form.year &&
    form.owner &&
    form.mileage &&
    form.fuelType &&
    form.transmission &&
    form.price &&
    carImageFile;

  const onCarImageUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setCarImageError("Please upload a valid image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setCarImageError("Image size must be under 5MB");
      return;
    }

    if (carImagePreview) {
      URL.revokeObjectURL(carImagePreview);
    }
    setCarImageFile(file);
    setCarImageError("");
    setCarImagePreview(URL.createObjectURL(file));
  };

  const removeCarImage = () => {
    if (carImagePreview) {
      URL.revokeObjectURL(carImagePreview);
    }
    setCarImageFile(null);
    setCarImagePreview("");
    setCarImageError("");
  };

  const submitListing = async () => {
    if (!canSubmit || submitting) {
      return;
    }

    setSubmitting(true);

    const payload = new FormData();
    payload.append("brand", form.brand);
    payload.append("model", form.model);
    payload.append("city", form.city);
    payload.append("year", String(Number(form.year)));
    payload.append("owner", form.owner);
    payload.append(
      "mileage",
      String(Number((form.mileage.match(/\d[\d,]*/)?.[0] || "0").replace(/,/g, "")))
    );
    payload.append("fuelType", form.fuelType);
    payload.append("transmission", form.transmission);
    payload.append("price", String(Number(form.price)));
    payload.append(
      "description",
      form.description ||
        `${form.brand} ${form.model} in ${form.city}, ${form.owner}, approx ${form.mileage}`
    );

    if (carImageFile) {
      payload.append("image", carImageFile);
      payload.append("carImage", carImageFile);
    }

    try {
      await axios.post("http://localhost:4444/car/add", payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Car listed successfully");
      closeAndReset();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit car");
      setSubmitting(false);
    }
  };

  const renderStepBody = () => {
    if (selectedStep.key === "model") {
      if (!form.brand) {
        return <p className="text-sm text-slate-500">Please select brand first.</p>;
      }
      return (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          {modelOptions.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => selectValue("model", item)}
              className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                form.model === item
                  ? "bg-cyan-50 border-cyan-500 text-cyan-800"
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      );
    }

    if (selectedStep.key === "year") {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {yearOptions.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => selectValue("year", item)}
              className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                form.year === item
                  ? "bg-cyan-50 border-cyan-500 text-cyan-800"
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      );
    }

    if (selectedStep.key === "price") {
      return (
        <div className="space-y-3">
          <input
            type="number"
            value={form.price}
            onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
            placeholder="Enter expected price in INR"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-400"
          />
          <textarea
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Extra details (optional)"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-400"
            rows={4}
          />
          <div className="rounded-xl border border-slate-200 p-3">
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              Upload car photo
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={onCarImageUpload}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            {carImagePreview ? (
              <div className="mt-3">
                <img
                  src={carImagePreview}
                  alt="Car preview"
                  className="h-36 w-full max-w-sm rounded-lg object-cover border border-slate-200"
                />
                <button
                  type="button"
                  onClick={removeCarImage}
                  className="mt-2 text-xs font-semibold text-rose-600 hover:text-rose-700"
                >
                  Remove image
                </button>
              </div>
            ) : null}
            {carImageError ? (
              <p className="mt-2 text-xs text-rose-600">{carImageError}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={submitListing}
            disabled={!canSubmit || submitting}
            className="w-full rounded-xl bg-cyan-700 hover:bg-cyan-800 disabled:bg-slate-300 text-white py-3 font-semibold"
          >
            {submitting ? "Submitting..." : "Submit Listing"}
          </button>
          {!carImageFile ? (
            <p className="text-xs text-slate-500">Please upload at least one car image to submit.</p>
          ) : null}
        </div>
      );
    }

    if (selectedStep.key === "city") {
      return (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          {options.city.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => selectValue("city", item)}
              className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                form.city === item
                  ? "bg-cyan-50 border-cyan-500 text-cyan-800"
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      );
    }

    const stepOptions =
      selectedStep.key === "brand"
        ? options.brand
        : selectedStep.key === "owner"
        ? options.owner
        : selectedStep.key === "mileage"
        ? options.mileage
        : selectedStep.key === "fuelType"
        ? options.fuelType
        : options.transmission;

    return (
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
        {stepOptions.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => selectValue(selectedStep.key, item)}
            className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
              form[selectedStep.key] === item
                ? "bg-cyan-50 border-cyan-500 text-cyan-800"
                : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
            }`}
          >
            {item}
          </button>
        ))}
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm p-3 sm:p-6"
        >
          <div className="h-full w-full flex items-center justify-center">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 via-slate-800 to-cyan-800 shadow-2xl"
            >
              <div className="p-4 sm:p-6 border-b border-cyan-800/50 flex items-start justify-between gap-3">
                <div>
                  <p className="text-cyan-100 text-sm font-semibold">Your Car Details</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {stepConfig.map((stepItem, index) => {
                      const value = form[stepItem.key];
                      const active = index === step;
                      return (
                        <span
                          key={stepItem.key}
                          className={`px-3 py-1 rounded-md text-xs font-semibold ${
                            active
                              ? "bg-cyan-100 text-cyan-900"
                              : value
                              ? "bg-white text-slate-900"
                              : "bg-slate-700 text-cyan-100"
                          }`}
                        >
                          {value || stepItem.label}
                        </span>
                      );
                    })}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeAndReset}
                  className="text-white/90 hover:text-white mt-1"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="bg-white m-3 sm:m-4 rounded-xl p-4 sm:p-6 max-h-[68vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <button
                    type="button"
                    onClick={prevStep}
                    disabled={step === 0}
                    className="text-cyan-900 disabled:text-slate-300"
                  >
                    <FaChevronLeft />
                  </button>
                  <p className="text-sm font-bold text-cyan-900">
                    {step + 1}/{stepConfig.length}
                  </p>
                </div>

                <h3 className="text-2xl font-semibold text-slate-900 mb-4">{selectedStep.title}</h3>

                {renderStepBody()}

                {selectedStep.key !== "price" && (
                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      onClick={nextStep}
                      className="rounded-lg bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 font-semibold"
                    >
                      Skip
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SellCarModel;
