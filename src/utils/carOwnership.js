export const buildCarCreatorPayload = ({ userId, role, name, email } = {}) => {
  const normalizedRole = String(role || "").trim().toLowerCase();
  const payload = {};

  if (userId) {
    payload.createdBy = userId;
    payload.userId = userId;

    if (normalizedRole === "seller") {
      payload.sellerId = userId;
    }
  }

  if (normalizedRole) {
    payload.addedByRole = normalizedRole;
  }

  if (name) {
    payload.addedByName = String(name).trim();
  }

  if (email) {
    payload.addedByEmail = String(email).trim();
  }

  return payload;
};

const CAR_CREATOR_META_STORAGE_KEY = "carscout.carCreatorMeta";

const readCreatorMetaMap = () => {
  try {
    const raw = localStorage.getItem(CAR_CREATOR_META_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

export const saveCarCreatorMeta = (carId, meta = {}) => {
  if (!carId) {
    return;
  }

  const current = readCreatorMetaMap();
  current[carId] = {
    name: String(meta.name || "").trim(),
    email: String(meta.email || "").trim(),
    userId: String(meta.userId || "").trim(),
    role: String(meta.role || "").trim(),
  };

  localStorage.setItem(CAR_CREATOR_META_STORAGE_KEY, JSON.stringify(current));
};

export const getCarAddedByLabel = (car) => {
  const directName =
    car?.addedByName ||
    car?.createdByName ||
    car?.sellerName ||
    car?.ownerName ||
    car?.userName;

  if (directName) {
    return String(directName);
  }

  const email = car?.addedByEmail || car?.createdByEmail;
  if (email) {
    return String(email);
  }

  const createdBy = car?.createdBy || car?.userId || car?.sellerId || car?.addedBy;

  if (createdBy && typeof createdBy === "object") {
    return (
      createdBy.name ||
      createdBy.fullName ||
      createdBy.email ||
      createdBy.username ||
      createdBy._id ||
      createdBy.id ||
      "Legacy Record"
    );
  }

  if (createdBy && typeof createdBy === "string") {
    return createdBy;
  }

  return "Legacy Record";
};

export const getCarAddedByDetails = (car) => {
  const carId = car?._id || car?.id || "";
  const localMeta = carId ? readCreatorMetaMap()[carId] : null;
  const createdBy = car?.createdBy || car?.userId || car?.sellerId || car?.addedBy;

  const name =
    car?.addedByName ||
    car?.createdByName ||
    car?.sellerName ||
    car?.ownerName ||
    car?.userName ||
    (typeof createdBy === "object"
      ? createdBy?.name || createdBy?.fullName || createdBy?.username
      : "") ||
    localMeta?.name ||
    "-";

  const email =
    car?.addedByEmail ||
    car?.createdByEmail ||
    (typeof createdBy === "object" ? createdBy?.email : "") ||
    localMeta?.email ||
    "-";

  return {
    name: String(name),
    email: String(email),
  };
};
