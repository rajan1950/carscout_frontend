const BACKEND_ORIGIN = "http://localhost:4444";
const LOCAL_GALLERY_OVERRIDES_KEY = "carscout.localCarImageGalleryOverrides";

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

const toImageCandidates = (value) => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  return [value];
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

export const resolveCarImageGalleryFromCar = (car) => {
  if (!car || typeof car !== "object") {
    return [];
  }

  const sources = [
    ...toImageCandidates(car.images),
    ...toImageCandidates(car.photos),
    ...toImageCandidates(car.image),
    ...toImageCandidates(car.imageUrl),
    ...toImageCandidates(car.imageURL),
    ...toImageCandidates(car.thumbnail),
    ...toImageCandidates(car.photo),
  ];

  const remoteUrls = sources
    .map((item) => resolveCarImageUrl(item))
    .filter(Boolean)
    .filter((url, index, array) => array.indexOf(url) === index);

  const localUrls = (() => {
    if (!car?._id || typeof window === "undefined") {
      return [];
    }

    try {
      const raw = window.localStorage.getItem(LOCAL_GALLERY_OVERRIDES_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      const list = Array.isArray(parsed?.[car._id]) ? parsed[car._id] : [];
      return list
        .map((item) => String(item || "").trim())
        .filter(Boolean);
    } catch {
      return [];
    }
  })();

  const urls = [...remoteUrls, ...localUrls].filter(
    (url, index, array) => array.indexOf(url) === index
  );

  return urls;
};

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.readAsDataURL(file);
  });

export const saveLocalCarImageGalleryOverride = async (carId, files) => {
  if (!carId || !Array.isArray(files) || files.length === 0 || typeof window === "undefined") {
    return;
  }

  const dataUrls = (
    await Promise.all(
      files.map(async (file) => {
        try {
          return await fileToDataUrl(file);
        } catch {
          return "";
        }
      })
    )
  ).filter(Boolean);

  if (dataUrls.length === 0) {
    return;
  }

  try {
    const raw = window.localStorage.getItem(LOCAL_GALLERY_OVERRIDES_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    parsed[carId] = dataUrls.slice(0, 3);
    window.localStorage.setItem(LOCAL_GALLERY_OVERRIDES_KEY, JSON.stringify(parsed));
  } catch {
    // Ignore local override persistence failures.
  }
};
