 import axios from "axios";
import { readAuthSession } from "../utils/auth";

const PROFILE_URL = "http://localhost:4444/user/profile";

const isDev = Boolean(import.meta.env.DEV);

const logProfileApi = ({ method, url, payloadKeys, status }) => {
  if (!isDev) {
    return;
  }

  const details = {
    method,
    url,
  };

  if (Array.isArray(payloadKeys)) {
    details.payloadKeys = payloadKeys;
  }

  if (typeof status === "number") {
    details.status = status;
  }

  console.debug("[profile-api]", details);
};

export const extractApiErrorMessage = (error) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Request failed"
  );
};

export const getAuthToken = () => {
  return readAuthSession()?.token || "";
};

export const getUserProfileApi = async (token) => {
  logProfileApi({
    method: "GET",
    url: PROFILE_URL,
  });

  const response = await axios.get(PROFILE_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  logProfileApi({
    method: "GET",
    url: PROFILE_URL,
    status: response.status,
  });

  return response;
};

export const updateUserProfileApi = async (token, payload) => {
  const payloadKeys = payload instanceof FormData ? Array.from(payload.keys()) : [];

  logProfileApi({
    method: "PUT",
    url: PROFILE_URL,
    payloadKeys,
  });

  const response = await axios.put(PROFILE_URL, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  logProfileApi({
    method: "PUT",
    url: PROFILE_URL,
    payloadKeys,
    status: response.status,
  });

  return response;
};
