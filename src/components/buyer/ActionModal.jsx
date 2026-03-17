import {
  FaCalendarCheck,
  FaCheckCircle,
  FaEnvelope,
  FaMapMarkerAlt,
  FaStar,
} from "react-icons/fa";

export const ActionModal = ({
  selectedCar,
  actionType,
  inquiryForm,
  setInquiryForm,
  testDriveForm,
  setTestDriveForm,
  reviewForm,
  setReviewForm,
  submitInquiry,
  submitTestDrive,
  submitReview,
  submittingAction,
  onClose,
  formatPrice,
}) => {
  if (!selectedCar || !actionType) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 p-4 flex items-center justify-center" onClick={onClose}>
      <div className="w-full max-w-xl rounded-2xl bg-white border border-slate-200 p-6" onClick={(event) => event.stopPropagation()}>
        <h3 className="text-xl font-black text-slate-900 mb-1">{selectedCar.brand} {selectedCar.model}</h3>
        <p className="text-sm text-slate-500 mb-4">{formatPrice(selectedCar.price)}</p>

        {actionType === "inquiry" && (
          <form onSubmit={submitInquiry} className="space-y-3">
            <p className="font-semibold text-cyan-800 inline-flex items-center gap-2"><FaEnvelope /> Send Inquiry</p>
            <input
              type="text"
              value={inquiryForm.name}
              onChange={(event) => setInquiryForm((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="Your name"
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2"
            />
            <input
              type="email"
              value={inquiryForm.email}
              onChange={(event) => setInquiryForm((prev) => ({ ...prev, email: event.target.value }))}
              placeholder="Your email"
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2"
            />
            <textarea
              value={inquiryForm.message}
              onChange={(event) => setInquiryForm((prev) => ({ ...prev, message: event.target.value }))}
              placeholder="Ask about price, condition, service history..."
              required
              rows={4}
              className="w-full rounded-lg border border-slate-200 px-3 py-2"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-100 font-semibold">Cancel</button>
              <button type="submit" disabled={submittingAction} className="px-4 py-2 rounded-lg bg-cyan-700 text-white font-semibold">
                {submittingAction ? "Sending..." : "Send Inquiry"}
              </button>
            </div>
          </form>
        )}

        {actionType === "testdrive" && (
          <form onSubmit={submitTestDrive} className="space-y-3">
            <p className="font-semibold text-emerald-800 inline-flex items-center gap-2"><FaCalendarCheck /> Book Test Drive</p>
            <input
              type="date"
              value={testDriveForm.date}
              onChange={(event) => setTestDriveForm((prev) => ({ ...prev, date: event.target.value }))}
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2"
            />
            <input
              type="text"
              value={testDriveForm.location}
              onChange={(event) => setTestDriveForm((prev) => ({ ...prev, location: event.target.value }))}
              placeholder="Preferred location"
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2"
            />
            <p className="text-xs text-slate-500 inline-flex items-center gap-1"><FaMapMarkerAlt /> Request will be created with pending status.</p>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-100 font-semibold">Cancel</button>
              <button type="submit" disabled={submittingAction} className="px-4 py-2 rounded-lg bg-emerald-700 text-white font-semibold">
                {submittingAction ? "Submitting..." : "Book Now"}
              </button>
            </div>
          </form>
        )}

        {actionType === "review" && (
          <form onSubmit={submitReview} className="space-y-3">
            <p className="font-semibold text-amber-800 inline-flex items-center gap-2"><FaStar /> Write Review</p>
            <select
              value={reviewForm.rating}
              onChange={(event) => setReviewForm((prev) => ({ ...prev, rating: event.target.value }))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2"
            >
              <option value="5">5 Star</option>
              <option value="4">4 Star</option>
              <option value="3">3 Star</option>
              <option value="2">2 Star</option>
              <option value="1">1 Star</option>
            </select>
            <textarea
              value={reviewForm.comment}
              onChange={(event) => setReviewForm((prev) => ({ ...prev, comment: event.target.value }))}
              placeholder="Share your buying experience"
              required
              rows={4}
              className="w-full rounded-lg border border-slate-200 px-3 py-2"
            />
            <div className="text-xs text-slate-500 inline-flex items-center gap-1"><FaCheckCircle /> Reviews help other buyers make decisions.</div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-100 font-semibold">Cancel</button>
              <button type="submit" disabled={submittingAction} className="px-4 py-2 rounded-lg bg-amber-600 text-white font-semibold">
                {submittingAction ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
