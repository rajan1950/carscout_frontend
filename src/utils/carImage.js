const BACKEND_ORIGIN = "http://localhost:4444";

const ABSOLUTE_URL_PATTERN = /^https?:\/\//i;

export const CAR_IMAGE_FALLBACK =
  "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=900&q=80";

const pickImageValue = (image) => {
  if (Array.isArray(image)) {
    return image[0] || "";
  }

  if (image && typeof image === "object") {
    return image.url || image.path || image.secure_url || image.location || "";
  }

  return image;
};

export const resolveCarImageUrl = (image) => {
  const rawValue = pickImageValue(image);
  const value = String(rawValue || "").trim().replace(/\\/g, "/");

  if (!value) {
    return "";
  }

  if (ABSOLUTE_URL_PATTERN.test(value) || value.startsWith("data:") || value.startsWith("blob:")) {
    return value;
  }

  if (value.startsWith("/")) {
    return `${BACKEND_ORIGIN}${value}`;
  }

  return `${BACKEND_ORIGIN}/${value}`;
};

export const resolveCarImageFromCar = (car) => {
  if (!car || typeof car !== "object") {
    return "";
  }

  const candidate =
    car.image ||
    car.imageUrl ||
    car.imageURL ||
    car.thumbnail ||
    car.photo ||
    car.photos ||
    car.images;

  return resolveCarImageUrl(candidate);
};
