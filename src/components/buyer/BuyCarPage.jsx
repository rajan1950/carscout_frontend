import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { getAuthProfile, getAuthUserId } from "../../utils/auth";
import { CAR_IMAGE_FALLBACK, resolveCarImageFromCar } from "../../utils/carImage";
import { useNotifications } from "../../hooks/useNotifications";
import { createNotificationForUser } from "../../services/notificationService";
import { removeFromWishlistApi } from "../../services/wishlistService";
import { sendTransactionalEmailApi } from "../../services/emailService";
import { buildPurchaseSuccessMailTemplate } from "../../utils/mailTemplates";

const PURCHASE_STORAGE_KEY = "carscout.purchases";
const PURCHASED_CAR_STORAGE_KEY = "carscout.purchasedCarIds";
const PURCHASED_CARS_UPDATED_EVENT = "carscout-purchased-cars-updated";

const readPurchasedCarIds = () => {
  try {
    const raw = localStorage.getItem(PURCHASED_CAR_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const addPurchasedCarId = (carId) => {
  if (!carId) {
    return;
  }

  const current = readPurchasedCarIds();
  if (current.includes(carId)) {
    return;
  }

  localStorage.setItem(PURCHASED_CAR_STORAGE_KEY, JSON.stringify([carId, ...current]));
  window.dispatchEvent(new Event(PURCHASED_CARS_UPDATED_EVENT));
};

const readPurchases = () => {
  try {
    const raw = localStorage.getItem(PURCHASE_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const savePurchase = (record) => {
  const current = readPurchases();
  const next = [record, ...current];
  localStorage.setItem(PURCHASE_STORAGE_KEY, JSON.stringify(next));
  return record;
};

const formatPrice = (price) => {
  const numeric = Number(price || 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(numeric);
};

const stepLabels = [
  "Buyer Details",
  "Delivery And Documents",
  "Payment",
  "Review",
  "Confirmation",
];

const ID_TYPE_CONFIG = {
  Aadhaar: {
    placeholder: "Aadhaar Number (12 digits)",
    hint: "Enter 12 digits as per government ID.",
    maxLength: 12,
    normalize: (value) => String(value || "").replace(/\D/g, "").slice(0, 12),
    validate: (value) => /^\d{12}$/.test(value),
    error: "Enter a valid 12-digit Aadhaar number",
  },
  PAN: {
    placeholder: "PAN Number (ABCDE1234F)",
    hint: "Format: 5 letters + 4 digits + 1 letter.",
    maxLength: 10,
    normalize: (value) => String(value || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10),
    validate: (value) => /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(value),
    error: "Enter a valid PAN number (example: ABCDE1234F)",
  },
  Passport: {
    placeholder: "Passport Number (A1234567)",
    hint: "Format: 1 letter followed by 7 digits.",
    maxLength: 8,
    normalize: (value) => String(value || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8),
    validate: (value) => /^[A-Z][0-9]{7}$/.test(value),
    error: "Enter a valid passport number (example: A1234567)",
  },
  "Driving License": {
    placeholder: "Driving License Number",
    hint: "Format: state code + RTO + serial digits (example: MH1220230012345).",
    maxLength: 16,
    normalize: (value) => String(value || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 16),
    validate: (value) => /^[A-Z]{2}[0-9]{2}[0-9]{11,12}$/.test(value),
    error: "Enter a valid Indian driving license number",
  },
};

const PAYMENT_METHOD_CONFIG = {
  full: {
    label: "Full Payment",
    requiresDownPayment: false,
    minPercent: 100,
    maxPercent: 100,
  },
  emi: {
    label: "EMI Plan",
    requiresDownPayment: true,
    minPercent: 10,
    maxPercent: 60,
  },
  loan: {
    label: "Bank Loan",
    requiresDownPayment: true,
    minPercent: 15,
    maxPercent: 50,
  },
};

const PAYMENT_TENURE_OPTIONS = [12, 24, 36, 48, 60, 72, 84];

export const BuyCarPage = () => {
  const navigate = useNavigate();
  const { carId } = useParams();
  const profile = getAuthProfile();
  const userId = getAuthUserId();
  const { fetchUnreadCount } = useNotifications();

  const [car, setCar] = useState(null);
  const [loadingCar, setLoadingCar] = useState(true);
  const [carError, setCarError] = useState("");
  const [step, setStep] = useState(1);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const [buyerForm, setBuyerForm] = useState({
    fullName: profile.name || "",
    email: profile.email || "",
    mobile: profile.mobile || "",
  });

  const [deliveryForm, setDeliveryForm] = useState({
    address: profile.address || "",
    city: profile.city || "",
    pinCode: profile.pinCode || "",
    idType: "Aadhaar",
    idNumber: "",
  });

  const [paymentForm, setPaymentForm] = useState({
    paymentMethod: "full",
    downPayment: "",
    tenureMonths: "60",
    preferredBank: "",
    agreeTerms: false,
  });

  useEffect(() => {
    const fetchCar = async () => {
      setLoadingCar(true);
      setCarError("");

      try {
        const response = await axios.get("http://localhost:4444/car/all");
        const cars = Array.isArray(response?.data) ? response.data : [];
        const selectedCar = cars.find((item) => item?._id === carId);

        if (!selectedCar) {
          setCarError("Car not found for purchase");
          setCar(null);
          return;
        }

        setCar(selectedCar);
      } catch (err) {
        setCarError(err.response?.data?.message || "Unable to load car for purchase");
      } finally {
        setLoadingCar(false);
      }
    };

    fetchCar();
  }, [carId]);

  const amount = useMemo(() => Number(car?.price || 0), [car]);
  const paymentConfig = PAYMENT_METHOD_CONFIG[paymentForm.paymentMethod] || PAYMENT_METHOD_CONFIG.full;
  const minDownPaymentAmount = Math.ceil((amount * paymentConfig.minPercent) / 100);
  const maxDownPaymentAmount = Math.floor((amount * paymentConfig.maxPercent) / 100);
  const downPaymentAmount = Number(paymentForm.downPayment || 0);
  const effectiveDownPayment = paymentForm.paymentMethod === "full" ? amount : downPaymentAmount;
  const remainingAmount = Math.max(amount - effectiveDownPayment, 0);

  const updateBuyerForm = (event) => {
    const { name, value } = event.target;
    setBuyerForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const updateDeliveryForm = (event) => {
    const { name, value } = event.target;

    if (name === "idType") {
      setDeliveryForm((prev) => ({ ...prev, idType: value, idNumber: "" }));
      setFieldErrors((prev) => ({ ...prev, idType: "", idNumber: "" }));
      return;
    }

    if (name === "idNumber") {
      const idConfig = ID_TYPE_CONFIG[deliveryForm.idType] || ID_TYPE_CONFIG.Aadhaar;
      const normalized = idConfig.normalize(value);
      setDeliveryForm((prev) => ({ ...prev, idNumber: normalized }));
      setFieldErrors((prev) => ({ ...prev, idNumber: "" }));
      return;
    }

    setDeliveryForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const updatePaymentForm = (event) => {
    const { name, value, type, checked } = event.target;

    if (name === "paymentMethod") {
      setPaymentForm((prev) => ({
        ...prev,
        paymentMethod: value,
        downPayment: value === "full" ? "" : prev.downPayment,
        preferredBank: value === "loan" ? prev.preferredBank : "",
      }));
      setFieldErrors((prev) => ({
        ...prev,
        paymentMethod: "",
        downPayment: "",
        tenureMonths: "",
        preferredBank: "",
      }));
      return;
    }

    setPaymentForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateCurrentStep = () => {
    const errors = {};

    if (step === 1) {
      if (!buyerForm.fullName.trim()) {
        errors.fullName = "Full name is required";
      }
      if (!buyerForm.email.trim()) {
        errors.email = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyerForm.email.trim())) {
        errors.email = "Enter a valid email address";
      }
      if (!buyerForm.mobile.trim()) {
        errors.mobile = "Mobile number is required";
      } else if (!/^\d{10}$/.test(buyerForm.mobile.trim())) {
        errors.mobile = "Enter a valid 10-digit mobile number";
      }
    }

    if (step === 2) {
      const idConfig = ID_TYPE_CONFIG[deliveryForm.idType] || ID_TYPE_CONFIG.Aadhaar;
      const normalizedId = idConfig.normalize(deliveryForm.idNumber);

      if (!deliveryForm.address.trim()) {
        errors.address = "Delivery address is required";
      }
      if (!deliveryForm.city.trim()) {
        errors.city = "City is required";
      }
      if (!deliveryForm.pinCode.trim()) {
        errors.pinCode = "Pin code is required";
      } else if (!/^\d{6}$/.test(deliveryForm.pinCode.trim())) {
        errors.pinCode = "Enter a valid 6-digit pin code";
      }
      if (!normalizedId) {
        errors.idNumber = "ID number is required";
      } else if (!idConfig.validate(normalizedId)) {
        errors.idNumber = idConfig.error;
      }

      if (normalizedId && normalizedId !== deliveryForm.idNumber) {
        setDeliveryForm((prev) => ({ ...prev, idNumber: normalizedId }));
      }
    }

    if (step === 3) {
      if (!paymentForm.paymentMethod) {
        errors.paymentMethod = "Payment method is required";
      }

      if (paymentConfig.requiresDownPayment) {
        if (!paymentForm.downPayment || downPaymentAmount <= 0) {
          errors.downPayment = "Down payment is required";
        } else if (downPaymentAmount < minDownPaymentAmount) {
          errors.downPayment = `Minimum down payment is ${formatPrice(minDownPaymentAmount)}`;
        } else if (downPaymentAmount > maxDownPaymentAmount) {
          errors.downPayment = `Maximum down payment is ${formatPrice(maxDownPaymentAmount)}`;
        }

        if (!paymentForm.tenureMonths) {
          errors.tenureMonths = "Select a tenure for this payment plan";
        }
      }

      if (paymentForm.paymentMethod === "loan" && !paymentForm.preferredBank.trim()) {
        errors.preferredBank = "Preferred bank name is required for bank loan";
      }

      if (!paymentForm.agreeTerms) {
        errors.agreeTerms = "You must accept purchase terms";
      }
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      toast.error("Please complete all required fields");
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) {
      return;
    }

    setStep((prev) => Math.min(prev + 1, 4));
  };

  const handlePrevious = () => {
    setStep((prev) => Math.max(prev - 1, 1));
    setFieldErrors({});
  };

  const submitPurchase = async () => {
    if (!car || placingOrder) {
      return;
    }

    setPlacingOrder(true);

    try {
      const now = new Date();
      const orderId = `ORD-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${Math.floor(Math.random() * 9000 + 1000)}`;

      const order = {
        id: orderId,
        userId: userId || "guest",
        carId: car._id,
        carTitle: `${car.brand || "Car"} ${car.model || "Model"}`,
        carSnapshot: car,
        totalAmount: amount,
        paymentMethod: paymentForm.paymentMethod,
        paymentLabel: paymentConfig.label,
        downPayment: paymentForm.paymentMethod === "full" ? amount : downPaymentAmount,
        remainingAmount,
        tenureMonths: paymentConfig.requiresDownPayment ? Number(paymentForm.tenureMonths || 0) : null,
        preferredBank: paymentForm.paymentMethod === "loan" ? paymentForm.preferredBank.trim() : null,
        buyer: buyerForm,
        delivery: deliveryForm,
        status: "order_placed",
        placedAt: now.toISOString(),
      };

      const purchaseMailTemplate = buildPurchaseSuccessMailTemplate({
        customerName: buyerForm.fullName,
        customerEmail: buyerForm.email,
        orderId: order.id,
        carTitle: order.carTitle,
        totalAmount: order.totalAmount,
        paymentMethod: order.paymentMethod,
        downPayment: order.downPayment,
        remainingAmount: order.remainingAmount,
      });

      order.mailTemplate = {
        to: buyerForm.email || "",
        subject: purchaseMailTemplate.subject,
        text: purchaseMailTemplate.text,
        html: purchaseMailTemplate.html,
      };

      order.mailDeliveryStatus = "pending";

      // Keep purchased cars hidden in buyer inventory even if delete API is restricted.
      addPurchasedCarId(car._id);

      if (order.mailTemplate.to) {
        try {
          await sendTransactionalEmailApi({
            to: order.mailTemplate.to,
            subject: order.mailTemplate.subject,
            text: order.mailTemplate.text,
            html: order.mailTemplate.html,
            template: "purchase-success",
            metadata: {
              orderId: order.id,
              carId: order.carId,
              userId: order.userId,
            },
          });
          order.mailDeliveryStatus = "sent";
        } catch {
          order.mailDeliveryStatus = "failed";
        }
      } else {
        order.mailDeliveryStatus = "skipped";
      }

      savePurchase(order);

      if (userId) {
        try {
          await removeFromWishlistApi({ userId, carId: car._id });
        } catch {
          // Ignore wishlist cleanup failures to keep purchase flow successful.
        }

        try {
          await createNotificationForUser({
            recipientId: userId,
            title: purchaseMailTemplate.subject,
            body: purchaseMailTemplate.text,
            type: "system",
            priority: "high",
          });
          fetchUnreadCount();
        } catch {
          // Notification failures should not block order completion.
        }
      }

      setConfirmation(order);
      setStep(5);
      toast.success("Car purchase request submitted successfully");
    } catch {
      toast.error("Failed to submit purchase request");
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loadingCar) {
    return <p className="text-slate-600">Loading car purchase flow...</p>;
  }

  if (carError || !car) {
    return (
      <section className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <p className="text-red-700 font-semibold">{carError || "Car could not be loaded"}</p>
        <button
          type="button"
          onClick={() => navigate("/customer")}
          className="mt-4 rounded-lg bg-slate-900 text-white px-4 py-2"
        >
          Back to Buyer Dashboard
        </button>
      </section>
    );
  }

  const imageUrl = resolveCarImageFromCar(car) || CAR_IMAGE_FALLBACK;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-900 via-teal-800 to-cyan-800 text-white p-6 mb-6">
        <p className="text-xs uppercase tracking-[0.18em] text-emerald-200">Step-by-Step Checkout</p>
        <h1 className="text-3xl font-black mt-2">Buy {car.brand} {car.model}</h1>
        <p className="text-emerald-100 mt-2">
          Complete all steps to place your purchase request. Order confirmation appears instantly.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6">
        <section className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex flex-wrap gap-2 mb-6">
            {stepLabels.map((label, index) => {
              const stepNumber = index + 1;
              const isActive = stepNumber === step;
              const isComplete = stepNumber < step;

              return (
                <div
                  key={label}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold border ${
                    isActive
                      ? "bg-cyan-700 text-white border-cyan-700"
                      : isComplete
                        ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                        : "bg-slate-100 text-slate-600 border-slate-200"
                  }`}
                >
                  {stepNumber}. {label}
                </div>
              );
            })}
          </div>

          {step === 1 && (
            <div className="space-y-3">
              <h2 className="text-xl font-black text-slate-900">Buyer Details</h2>
              <input
                name="fullName"
                value={buyerForm.fullName}
                onChange={updateBuyerForm}
                placeholder="Full Name"
                className={`w-full border rounded-xl px-4 py-3 ${fieldErrors.fullName ? "border-red-400" : "border-slate-300"}`}
              />
              {fieldErrors.fullName ? <p className="text-xs text-red-600">{fieldErrors.fullName}</p> : null}
              <input
                name="email"
                type="email"
                value={buyerForm.email}
                onChange={updateBuyerForm}
                placeholder="Email"
                className={`w-full border rounded-xl px-4 py-3 ${fieldErrors.email ? "border-red-400" : "border-slate-300"}`}
              />
              {fieldErrors.email ? <p className="text-xs text-red-600">{fieldErrors.email}</p> : null}
              <input
                name="mobile"
                value={buyerForm.mobile}
                onChange={updateBuyerForm}
                placeholder="Mobile Number"
                className={`w-full border rounded-xl px-4 py-3 ${fieldErrors.mobile ? "border-red-400" : "border-slate-300"}`}
              />
              {fieldErrors.mobile ? <p className="text-xs text-red-600">{fieldErrors.mobile}</p> : null}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <h2 className="text-xl font-black text-slate-900">Delivery And Documents</h2>
              <textarea
                name="address"
                rows={3}
                value={deliveryForm.address}
                onChange={updateDeliveryForm}
                placeholder="Delivery Address"
                className={`w-full border rounded-xl px-4 py-3 ${fieldErrors.address ? "border-red-400" : "border-slate-300"}`}
              />
              {fieldErrors.address ? <p className="text-xs text-red-600">{fieldErrors.address}</p> : null}
              <div className="grid sm:grid-cols-2 gap-3">
                <input
                  name="city"
                  value={deliveryForm.city}
                  onChange={updateDeliveryForm}
                  placeholder="City"
                  className={`w-full border rounded-xl px-4 py-3 ${fieldErrors.city ? "border-red-400" : "border-slate-300"}`}
                />
                <input
                  name="pinCode"
                  value={deliveryForm.pinCode}
                  onChange={updateDeliveryForm}
                  placeholder="Pin Code"
                  className={`w-full border rounded-xl px-4 py-3 ${fieldErrors.pinCode ? "border-red-400" : "border-slate-300"}`}
                />
              </div>
              {fieldErrors.city ? <p className="text-xs text-red-600">{fieldErrors.city}</p> : null}
              {fieldErrors.pinCode ? <p className="text-xs text-red-600">{fieldErrors.pinCode}</p> : null}
              <div className="grid sm:grid-cols-2 gap-3">
                <select
                  name="idType"
                  value={deliveryForm.idType}
                  onChange={updateDeliveryForm}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3"
                >
                  <option value="Aadhaar">Aadhaar</option>
                  <option value="PAN">PAN</option>
                  <option value="Passport">Passport</option>
                  <option value="Driving License">Driving License</option>
                </select>
                <input
                  name="idNumber"
                  value={deliveryForm.idNumber}
                  onChange={updateDeliveryForm}
                  placeholder={(ID_TYPE_CONFIG[deliveryForm.idType] || ID_TYPE_CONFIG.Aadhaar).placeholder}
                  maxLength={(ID_TYPE_CONFIG[deliveryForm.idType] || ID_TYPE_CONFIG.Aadhaar).maxLength}
                  className={`w-full border rounded-xl px-4 py-3 ${fieldErrors.idNumber ? "border-red-400" : "border-slate-300"}`}
                />
              </div>
              <p className="text-xs text-slate-500">
                {(ID_TYPE_CONFIG[deliveryForm.idType] || ID_TYPE_CONFIG.Aadhaar).hint}
              </p>
              {fieldErrors.idNumber ? <p className="text-xs text-red-600">{fieldErrors.idNumber}</p> : null}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <h2 className="text-xl font-black text-slate-900">Payment Method</h2>
              <select
                name="paymentMethod"
                value={paymentForm.paymentMethod}
                onChange={updatePaymentForm}
                className={`w-full border rounded-xl px-4 py-3 ${fieldErrors.paymentMethod ? "border-red-400" : "border-slate-300"}`}
              >
                <option value="full">Full Payment</option>
                <option value="emi">EMI Plan</option>
                <option value="loan">Bank Loan</option>
              </select>
              {fieldErrors.paymentMethod ? <p className="text-xs text-red-600">{fieldErrors.paymentMethod}</p> : null}

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                <p className="font-semibold text-slate-900">{paymentConfig.label}</p>
                {paymentConfig.requiresDownPayment ? (
                  <p className="mt-1">
                    Down payment range: {formatPrice(minDownPaymentAmount)} to {formatPrice(maxDownPaymentAmount)}
                  </p>
                ) : (
                  <p className="mt-1">No EMI or loan processing. Full amount payable at confirmation.</p>
                )}
              </div>

              {paymentConfig.requiresDownPayment && (
                <>
                  <input
                    name="downPayment"
                    type="number"
                    min={minDownPaymentAmount}
                    max={maxDownPaymentAmount}
                    value={paymentForm.downPayment}
                    onChange={updatePaymentForm}
                    placeholder="Down Payment Amount"
                    className={`w-full border rounded-xl px-4 py-3 ${fieldErrors.downPayment ? "border-red-400" : "border-slate-300"}`}
                  />

                  <select
                    name="tenureMonths"
                    value={paymentForm.tenureMonths}
                    onChange={updatePaymentForm}
                    className={`w-full border rounded-xl px-4 py-3 ${fieldErrors.tenureMonths ? "border-red-400" : "border-slate-300"}`}
                  >
                    {PAYMENT_TENURE_OPTIONS.map((months) => (
                      <option key={months} value={String(months)}>{months} months</option>
                    ))}
                  </select>
                  {fieldErrors.tenureMonths ? <p className="text-xs text-red-600">{fieldErrors.tenureMonths}</p> : null}
                </>
              )}

              {paymentForm.paymentMethod === "loan" && (
                <>
                  <input
                    name="preferredBank"
                    value={paymentForm.preferredBank}
                    onChange={updatePaymentForm}
                    placeholder="Preferred Bank Name"
                    className={`w-full border rounded-xl px-4 py-3 ${fieldErrors.preferredBank ? "border-red-400" : "border-slate-300"}`}
                  />
                  {fieldErrors.preferredBank ? <p className="text-xs text-red-600">{fieldErrors.preferredBank}</p> : null}
                </>
              )}

              {fieldErrors.downPayment ? <p className="text-xs text-red-600">{fieldErrors.downPayment}</p> : null}

              <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input
                  name="agreeTerms"
                  type="checkbox"
                  checked={paymentForm.agreeTerms}
                  onChange={updatePaymentForm}
                />
                I confirm details are correct and agree to purchase terms.
              </label>
              {fieldErrors.agreeTerms ? <p className="text-xs text-red-600">{fieldErrors.agreeTerms}</p> : null}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-xl font-black text-slate-900">Review Order</h2>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-sm">
                <p><span className="font-semibold">Buyer:</span> {buyerForm.fullName}</p>
                <p><span className="font-semibold">Email:</span> {buyerForm.email}</p>
                <p><span className="font-semibold">Mobile:</span> {buyerForm.mobile}</p>
                <p><span className="font-semibold">Delivery:</span> {deliveryForm.address}, {deliveryForm.city} - {deliveryForm.pinCode}</p>
                <p><span className="font-semibold">Document:</span> {deliveryForm.idType} - {deliveryForm.idNumber}</p>
                <p><span className="font-semibold">Payment:</span> {paymentConfig.label}</p>
                {paymentConfig.requiresDownPayment ? (
                  <p><span className="font-semibold">Tenure:</span> {paymentForm.tenureMonths} months</p>
                ) : null}
                {paymentForm.paymentMethod === "loan" ? (
                  <p><span className="font-semibold">Preferred Bank:</span> {paymentForm.preferredBank}</p>
                ) : null}
                <p><span className="font-semibold">Down Payment:</span> {formatPrice(effectiveDownPayment)}</p>
                <p><span className="font-semibold">Remaining:</span> {formatPrice(remainingAmount)}</p>
              </div>
            </div>
          )}

          {step === 5 && confirmation && (
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-emerald-700">Purchase Confirmed</h2>
              <p className="text-slate-700">
                Your order request has been placed successfully. Our team will contact you for verification and final invoice.
              </p>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm space-y-1">
                <p><span className="font-semibold">Order ID:</span> {confirmation.id}</p>
                <p><span className="font-semibold">Car:</span> {confirmation.carTitle}</p>
                <p><span className="font-semibold">Amount:</span> {formatPrice(confirmation.totalAmount)}</p>
                <p><span className="font-semibold">Status:</span> Order Placed</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => navigate("/customer")}
                  className="rounded-lg bg-slate-900 text-white px-4 py-2"
                >
                  Back to Buyer Dashboard
                </button>
                <Link
                  to="/notifications"
                  className="rounded-lg bg-cyan-700 hover:bg-cyan-800 text-white px-4 py-2"
                >
                  Open Notifications
                </Link>
              </div>
            </div>
          )}

          {step < 5 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="rounded-lg border border-slate-300 text-slate-700 px-4 py-2"
                >
                  Previous
                </button>
              )}

              {step < 4 && (
                <button
                  type="button"
                  onClick={handleNext}
                  className="rounded-lg bg-slate-900 text-white px-4 py-2"
                >
                  Continue
                </button>
              )}

              {step === 4 && (
                <button
                  type="button"
                  onClick={submitPurchase}
                  disabled={placingOrder}
                  className="rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white px-4 py-2"
                >
                  {placingOrder ? "Placing Order..." : "Confirm Purchase"}
                </button>
              )}
            </div>
          )}
        </section>

        <aside className="bg-white rounded-2xl border border-slate-200 p-5 h-fit">
          <h3 className="text-lg font-black text-slate-900 mb-3">Selected Car</h3>
          <img
            src={imageUrl}
            alt={`${car.brand || "Car"} ${car.model || ""}`}
            className="h-44 w-full object-cover rounded-xl border border-slate-200"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = CAR_IMAGE_FALLBACK;
            }}
          />
          <p className="text-xl font-black text-slate-900 mt-3">{car.brand || "Unknown"} {car.model || "Model"}</p>
          <p className="text-sm text-slate-600 mt-1">{car.year || "N/A"} | {car.fuelType || "N/A"} | {car.transmission || "N/A"}</p>
          <p className="text-2xl font-black text-emerald-700 mt-3">{formatPrice(car.price)}</p>

          <div className="mt-4 rounded-xl border border-cyan-100 bg-cyan-50 p-3 text-sm text-slate-700">
            <p className="font-semibold text-cyan-800">Checkout Summary</p>
            <p className="mt-1">Method: {paymentConfig.label}</p>
            {paymentConfig.requiresDownPayment ? (
              <p>Tenure: {paymentForm.tenureMonths} months</p>
            ) : null}
            <p>Down Payment: {formatPrice(effectiveDownPayment)}</p>
            <p>Balance: {formatPrice(remainingAmount)}</p>
          </div>
        </aside>
      </div>
    </div>
  );
};
