import axios from "axios";
import { readAuthSession } from "../utils/auth";

const BOOKING_BASE_URL = "http://localhost:4444/testdrive";

const getAuthHeaders = () => {
  const token = readAuthSession()?.token;

  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
};

export const createBookingApi = async (payload) => {
  const normalizedPayload = {
    userId: payload?.userId,
    carId: payload?.carId,
    date: payload?.date || payload?.bookingDate,
    bookingDate: payload?.bookingDate || payload?.date,
    location: payload?.location,
    status: payload?.status || "pending",
  };

  const response = await axios.post(`${BOOKING_BASE_URL}/add`, normalizedPayload, {
    headers: getAuthHeaders(),
  });

  return response.data;
};

export const getUserBookingsApi = async (userId) => {
  const response = await axios.get(`${BOOKING_BASE_URL}/user/${userId}`, {
    headers: getAuthHeaders(),
  });

  return response.data;
};

export const getAllBookingsApi = async () => {
  const response = await axios.get(`${BOOKING_BASE_URL}/all`, {
    headers: getAuthHeaders(),
  });

  return response.data;
};

export const updateBookingStatusApi = async (id, status) => {
  const response = await axios.patch(
    `${BOOKING_BASE_URL}/${id}/status`,
    { status },
    {
      headers: getAuthHeaders(),
    }
  );

  return response.data;
};

export const deleteBookingApi = async (id) => {
  const response = await axios.delete(`${BOOKING_BASE_URL}/${id}`, {
    headers: getAuthHeaders(),
  });

  return response.data;
};
