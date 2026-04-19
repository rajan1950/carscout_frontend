import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTimes,
  FaChevronLeft,
  FaCalendarAlt,
  FaGasPump,
  FaBolt,
  FaLeaf,
  FaCogs,
  FaRoad,
  FaMapMarkerAlt,
  FaUserTag,
  FaCarSide,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { sellCarApi } from "../../services/sellCarApi";
import { getAuthProfile, getAuthUserId, readAuthSession } from "../../utils/auth";
import { saveLocalCarImageGalleryOverride } from "../../utils/carImage";
import { buildCarCreatorPayload, saveCarCreatorMeta } from "../../utils/carOwnership";
import { normalizeOwnerForApi, OWNER_OPTIONS } from "../../utils/owner";

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
  imageFiles: [],
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
  brand: ["MarutiSuzuki", "Hyundai", "Honda", "Tata", "Mahindra", "BMW", "Audi", "Toyota", "Kia", "Renault", "Skoda", "Volkswagen", "Mercedes-Benz", "Ford", "Nissan", "Jaguar", "Land Rover", "Volvo", "Mitsubishi", "Isuzu", "Datsun", "Lexus", "Infiniti", "Acura", "Alfa Romeo", "Fiat", "Mini", "Porsche", "Rolls-Royce", "Bentley"],
  city: ["Ahmedabad", "Mumbai", "Delhi", "Bangalore", "Pune", "Hyderabad", "Chennai", "Kolkata", "Surat", "Jaipur", "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal", "Visakhapatnam", "Pimpri-Chinchwad", "Patna", "Vadodara", "Ghaziabad", "Ludhiana", "Agra", "Nashik", "Faridabad", "Meerut", "Rajkot", "Kalyan-Dombivli", "Vasai-Virar", "Varanasi", "Srinagar", "Aurangabad", "Dhanbad", "Amritsar", "Navi Mumbai", "Allahabad", "Ranchi", "Howrah", "Coimbatore", "Jabalpur", "Gwalior", "Vijayawada", "Jodhpur", "Madurai", "Raipur", "Kota", "Guwahati", "Chandigarh", "Solapur", "Hubli-Dharwad", "Bareilly", "Mysore", "Moradabad", "Gurgaon", "Aligarh", "Jalandhar", "Tiruchirappalli", "Bhubaneswar"],
  owner: OWNER_OPTIONS,
  mileage: [
    "0 - 10,000 km",
    "10,000 - 20,000 km",
    "20,000 - 30,000 km",
    "30,000 - 40,000 km",
    "40,000 - 50,000 km",
    "50,000 - 60,000 km",
    "60,000 - 70,000 km",
    "70,000 - 80,000 km",
    "80,000 - 90,000 km",
    "90,000 - 100,000 km",
  ],
  fuelType: ["Petrol", "Diesel", "Electric", "CNG"],
  transmission: ["Manual", "Automatic"],
};

const modelByBrand = {
  MarutiSuzuki: ["Swift", "Baleno", "Dzire", "Vitara Brezza"],
  Hyundai: ["i20", "Creta", "Venue", "Verna"],
  Honda: ["City", "Amaze", "Elevate"],
  Tata: ["Nexon", "Harrier", "Altroz", "Punch"],
  Mahindra: ["XUV300", "XUV700", "Scorpio", "Thar"],
  BMW: ["3 Series", "5 Series", "X1", "X3"],
  Audi: ["A4", "A6", "Q3", "Q5"],
  Toyota: ["Innova", "Fortuner", "Glanza", "Hyryder"],
  Kia: ["Seltos", "Sonet", "Carnival", "Carens"],
  Renault: ["Kwid", "Triber", "Duster", "Captur"],
  Skoda: ["Octavia", "Rapid", "Kushaq", "Slavia"],
  Volkswagen: ["Polo", "Vento", "Taigun", "Slavia"],
  "Mercedes-Benz": ["C-Class", "E-Class", "GLA", "GLC"],
  Ford: ["EcoSport", "Endeavour", "Figo", "Freestyle"],
  Nissan: ["Magnite", "Kicks", "Sunny", "Altima"],
  Jaguar: ["XE", "XF", "F-Pace", "E-Pace"],
  "Land Rover": ["Range Rover Evoque", "Discovery Sport", "Defender", "Range Rover Velar"],
  Volvo: ["XC40", "XC60", "XC90", "S60"],
  Mitsubishi: ["Outlander", "Pajero Sport", "Eclipse Cross", "Montero"],
  Isuzu: ["D-Max V-Cross", "MU-X", "D-Max", "MU-7"],
  Datsun: ["GO", "GO+", "redi-GO", "Cross"],
  Lexus: ["RX", "NX", "ES", "UX"],
  Infiniti: ["Q50", "QX50", "Q60", "QX60"],
  Acura: ["ILX", "TLX", "RDX", "MDX"],
  "Alfa Romeo": ["Giulia", "Stelvio", "Tonale", "4C"],
  Fiat: ["Punto", "Linea", "500", "Avventura"],
  Mini: ["Cooper", "Countryman", "Clubman", "Convertible"],
  Porsche: ["Cayenne", "Macan", "Panamera", "911"],
  "Rolls-Royce": ["Phantom", "Ghost", "Wraith", "Cullinan"],
  Bentley: ["Continental GT", "Bentayga", "Flying Spur", "Mulsanne"],
  
};

const yearOptions = Array.from({ length: 15 }, (_, i) => String(new Date().getFullYear() - i));

const getSubmissionErrorMessage = (err) => {
  const apiMessage = err?.response?.data?.message;
  if (typeof apiMessage === "string" && apiMessage.trim()) {
    return apiMessage;
  }

  const rawResponse = err?.response?.data;
  if (typeof rawResponse === "string") {
    if (rawResponse.toLowerCase().includes("unexpected field")) {
      return "Image upload field mismatch. Please retry.";
    }
    return rawResponse;
  }

  if (rawResponse && typeof rawResponse === "object") {
    const code = String(rawResponse.code || "").toLowerCase();
    const error = String(rawResponse.error || "").toLowerCase();
    if (code.includes("unexpected") || error.includes("unexpected") || code.includes("limit_unexpected_file")) {
      return "Image upload field mismatch. Please retry.";
    }
  }

  if (err?.message) {
    return err.message;
  }

  return "Failed to submit car";
};

const isFieldMismatchError = (err) => {
  const apiMessage = String(err?.response?.data?.message || "").toLowerCase();
  const rawResponse = err?.response?.data;
  const rawText = typeof rawResponse === "string" ? rawResponse.toLowerCase() : "";
  const code = String(rawResponse?.code || "").toLowerCase();
  const error = String(rawResponse?.error || "").toLowerCase();

  return (
    apiMessage.includes("unexpected field") ||
    rawText.includes("unexpected field") ||
    code.includes("limit_unexpected_file") ||
    code.includes("unexpected") ||
    error.includes("unexpected")
  );
};

const buildSellCarPayload = (
  form,
  parsedYear,
  parsedPrice,
  normalizedOwner,
  creatorPayload,
  appendImages
) => {
  const payload = new FormData();
  payload.append("brand", form.brand);
  payload.append("model", form.model);
  payload.append("city", form.city);
  payload.append("year", String(parsedYear));
  payload.append("owner", normalizedOwner);
  payload.append("mileage", form.mileage);
  payload.append("fuelType", form.fuelType);
  payload.append("transmission", form.transmission);
  payload.append("price", String(parsedPrice));
  payload.append(
    "description",
    form.description ||
      `${form.brand} ${form.model} in ${form.city}, ${normalizedOwner}, approx ${form.mileage}`
  );
  appendImages(payload, form.imageFiles);

  Object.entries(creatorPayload).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      payload.append(key, String(value));
    }
  });

  return payload;
};

const IMAGE_APPEND_STRATEGIES = [
  {
    label: "image",
    appendImages: (payload, files) => {
      files.forEach((file) => payload.append("image", file));
    },
  },
  {
    label: "images",
    appendImages: (payload, files) => {
      files.forEach((file) => payload.append("images", file));
    },
  },
  {
    label: "images[]",
    appendImages: (payload, files) => {
      files.forEach((file) => payload.append("images[]", file));
    },
  },
  {
    label: "image1-image3",
    appendImages: (payload, files) => {
      files.forEach((file, index) => payload.append(`image${index + 1}`, file));
    },
  },
  {
    label: "carImage1-carImage3",
    appendImages: (payload, files) => {
      files.forEach((file, index) => payload.append(`carImage${index + 1}`, file));
    },
  },
  {
    label: "image-image2-image3",
    appendImages: (payload, files) => {
      files.forEach((file, index) => {
        const fieldName = index === 0 ? "image" : `image${index + 1}`;
        payload.append(fieldName, file);
      });
    },
  },
  {
    label: "images[0]-images[2]",
    appendImages: (payload, files) => {
      files.forEach((file, index) => payload.append(`images[${index}]`, file));
    },
  },
];

const SellCarModel = ({ isOpen, onClose, onSuccess }) => {
  const MotionDiv = motion.div;
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const profile = getAuthProfile();
  const userId = getAuthUserId();
  const session = readAuthSession();

  const selectedStep = stepConfig[step];

  const getOptionVisual = (stepKey, item) => {
    const text = String(item || "").toLowerCase();

    if (stepKey === "fuelType") {
      if (text.includes("electric")) {
        return { Icon: FaBolt, iconClass: "bg-violet-100 text-violet-700" };
      }
      if (text.includes("cng")) {
        return { Icon: FaLeaf, iconClass: "bg-emerald-100 text-emerald-700" };
      }
      return { Icon: FaGasPump, iconClass: "bg-amber-100 text-amber-700" };
    }

    if (stepKey === "transmission") {
      return { Icon: FaCogs, iconClass: "bg-indigo-100 text-indigo-700" };
    }

    if (stepKey === "owner") {
      return { Icon: FaUserTag, iconClass: "bg-cyan-100 text-cyan-700" };
    }

    if (stepKey === "mileage") {
      return { Icon: FaRoad, iconClass: "bg-orange-100 text-orange-700" };
    }

    if (stepKey === "city") {
      return { Icon: FaMapMarkerAlt, iconClass: "bg-rose-100 text-rose-700" };
    }

    if (stepKey === "year") {
      return { Icon: FaCalendarAlt, iconClass: "bg-blue-100 text-blue-700" };
    }

    return { Icon: FaCarSide, iconClass: "bg-slate-200 text-slate-700" };
  };

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
    setStep(0);
    setForm(initialForm);
    setSubmitting(false);
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
    form.imageFiles.length === 3;

  const submitListing = async () => {
    if (!canSubmit || submitting) {
      return;
    }

    if (form.imageFiles.length !== 3) {
      toast.error("Please upload exactly 3 car images");
      return;
    }

    const parsedYear = Number(form.year);
    if (!Number.isFinite(parsedYear) || parsedYear <= 0) {
      toast.error("Year must be a valid number");
      return;
    }

    const parsedPrice = Number(form.price);
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      toast.error("Price must be greater than 0");
      return;
    }

    const normalizedOwner = normalizeOwnerForApi(form.owner);
    if (!normalizedOwner) {
      toast.error("Please select a valid owner count");
      return;
    }

    setSubmitting(true);

    const creatorPayload = buildCarCreatorPayload({
      userId,
      role: session?.role,
      name: profile.name,
      email: profile.email,
    });

    try {
      let response;
      let lastError;
      let usedSingleImageFallback = false;

      for (const strategy of IMAGE_APPEND_STRATEGIES) {
        const payload = buildSellCarPayload(
          form,
          parsedYear,
          parsedPrice,
          normalizedOwner,
          creatorPayload,
          strategy.appendImages
        );

        try {
          response = await sellCarApi(payload);
          break;
        } catch (attemptError) {
          lastError = attemptError;

          // Retry alternate field names only for multipart field mismatch scenarios.
          if (!isFieldMismatchError(attemptError)) {
            throw attemptError;
          }
        }
      }

      if (!response && isFieldMismatchError(lastError)) {
        const singleImagePayload = buildSellCarPayload(
          form,
          parsedYear,
          parsedPrice,
          normalizedOwner,
          creatorPayload,
          (payload, files) => {
            if (files[0]) {
              payload.append("image", files[0]);
            }
          }
        );
        response = await sellCarApi(singleImagePayload);
        usedSingleImageFallback = true;
      }

      if (!response) {
        throw lastError || new Error("Failed to submit car");
      }

      const createdCarId = response?.data?._id || response?._id || response?.car?._id || "";

      if (createdCarId) {
        await saveLocalCarImageGalleryOverride(createdCarId, form.imageFiles);
      }

      saveCarCreatorMeta(createdCarId, {
        name: profile.name,
        email: profile.email,
        userId,
        role: session?.role,
      });

      if (usedSingleImageFallback) {
        toast.info("Listing submitted. Backend accepted one image; extra images are saved locally for details view.");
      }

      toast.success(response?.message || "Car listed successfully");
      if (typeof onSuccess === "function") {
        onSuccess();
      }
      closeAndReset();
    } catch (err) {
      toast.error(getSubmissionErrorMessage(err));
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
            (() => {
              const { Icon, iconClass } = getOptionVisual("year", item);
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => selectValue("year", item)}
                  className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition flex items-center gap-2.5 ${
                    form.year === item
                      ? "bg-cyan-50 border-cyan-500 text-cyan-800"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <span className={`h-8 w-8 rounded-lg flex items-center justify-center text-sm ${iconClass}`}>
                    <Icon />
                  </span>
                  <span>{item}</span>
                </button>
              );
            })()
          ))}
        </div>
      );
    }

    if (selectedStep.key === "price") {
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Car image</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => {
                const incomingFiles = Array.from(e.target.files || []);

                setForm((prev) => {
                  const mergedFiles = [...prev.imageFiles, ...incomingFiles];
                  const uniqueFiles = mergedFiles.filter(
                    (file, index, self) =>
                      index ===
                      self.findIndex(
                        (candidate) =>
                          candidate.name === file.name &&
                          candidate.size === file.size &&
                          candidate.lastModified === file.lastModified
                      )
                  );

                  if (uniqueFiles.length > 3) {
                    toast.error("You can upload a maximum of 3 images");
                    return prev;
                  }

                  return { ...prev, imageFiles: uniqueFiles };
                });

                // Reset input value so selecting the same file again still triggers onChange.
                e.target.value = "";
              }}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-cyan-400"
            />
            <p className="mt-1 text-xs text-slate-500">Upload exactly 3 images. You can select all at once or one by one.</p>
            {form.imageFiles.length > 0 && (
              <p className="mt-1 text-xs text-slate-500">
                Selected ({form.imageFiles.length}/3): {form.imageFiles.map((file) => file.name).join(", ")}
              </p>
            )}
          </div>

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
          <button
            type="button"
            onClick={submitListing}
            disabled={!canSubmit || submitting}
            className="w-full rounded-xl bg-cyan-700 hover:bg-cyan-800 disabled:bg-slate-300 text-white py-3 font-semibold"
          >
            {submitting ? "Submitting..." : "Submit Listing"}
          </button>
        </div>
      );
    }

    if (selectedStep.key === "city") {
      return (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          {options.city.map((item) => (
            (() => {
              const { Icon, iconClass } = getOptionVisual("city", item);
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => selectValue("city", item)}
                  className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition flex items-center gap-2.5 ${
                    form.city === item
                      ? "bg-cyan-50 border-cyan-500 text-cyan-800"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <span className={`h-8 w-8 rounded-lg flex items-center justify-center text-sm ${iconClass}`}>
                    <Icon />
                  </span>
                  <span className="truncate">{item}</span>
                </button>
              );
            })()
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
        {stepOptions.map((item) => {
          const { Icon, iconClass } = getOptionVisual(selectedStep.key, item);

          return (
            <button
              key={item}
              type="button"
              onClick={() => selectValue(selectedStep.key, item)}
              className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition flex items-center gap-2.5 ${
                form[selectedStep.key] === item
                  ? "bg-cyan-50 border-cyan-500 text-cyan-800"
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
            >
              <span className={`h-8 w-8 rounded-lg flex items-center justify-center text-sm ${iconClass}`}>
                <Icon />
              </span>
              <span className="truncate">{item}</span>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <MotionDiv
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm p-3 sm:p-6"
        >
          <div className="h-full w-full flex items-center justify-center">
            <MotionDiv
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
            </MotionDiv>
          </div>
        </MotionDiv>
      )}
    </AnimatePresence>
  );
};

export default SellCarModel;
