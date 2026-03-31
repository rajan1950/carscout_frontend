const PURCHASE_STORAGE_KEY = "carscout.purchases";

const parsePurchaseList = (raw) => {
  try {
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const getAllPurchasesLocal = () => {
  const raw = localStorage.getItem(PURCHASE_STORAGE_KEY);
  return parsePurchaseList(raw);
};

export const saveAllPurchasesLocal = (items) => {
  const safeItems = Array.isArray(items) ? items : [];
  localStorage.setItem(PURCHASE_STORAGE_KEY, JSON.stringify(safeItems));
  return safeItems;
};

export const updatePurchaseStatusLocal = (id, status) => {
  if (!id || !status) {
    return null;
  }

  const current = getAllPurchasesLocal();
  let updatedPurchase = null;

  const next = current.map((item) => {
    if (item?.id !== id) {
      return item;
    }

    updatedPurchase = {
      ...item,
      status,
      updatedAt: new Date().toISOString(),
    };

    return updatedPurchase;
  });

  saveAllPurchasesLocal(next);
  return updatedPurchase;
};

export const deletePurchaseLocal = (id) => {
  if (!id) {
    return false;
  }

  const current = getAllPurchasesLocal();
  const next = current.filter((item) => item?.id !== id);

  if (next.length === current.length) {
    return false;
  }

  saveAllPurchasesLocal(next);
  return true;
};

export const getPurchaseStatsLocal = () => {
  const purchases = getAllPurchasesLocal();
  const totalAmount = purchases.reduce((sum, item) => sum + Number(item?.totalAmount || 0), 0);

  const uniqueBuyers = new Set(
    purchases.map((item) => item?.userId || item?.buyer?.email || item?.id).filter(Boolean)
  );

  return {
    totalPurchases: purchases.length,
    uniqueBuyers: uniqueBuyers.size,
    totalAmount,
  };
};
