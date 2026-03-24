import axios from "axios";
import { readAuthSession } from "../utils/auth";

const SELL_CAR_URL = "http://localhost:4444/car/add";

const getAuthHeaders = () => {
  const token = readAuthSession()?.token;

  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
};

export const sellCarApi = async (payload) => {
  const isFormData = payload instanceof FormData;

  const response = await axios.post(SELL_CAR_URL, payload, {
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...getAuthHeaders(),
    },
  });

  return response.data;
};
