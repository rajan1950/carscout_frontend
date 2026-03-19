import axios from "axios";
import { readAuthSession } from "../utils/auth";

const NOTIFICATION_BASE_URL = "http://localhost:4444/notification";

const getAuthHeaders = () => {
  const token = readAuthSession()?.token;

  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
};

export const getMyNotifications = async ({ page = 1, limit = 20 } = {}) => {
  const response = await axios.get(`${NOTIFICATION_BASE_URL}/my`, {
    params: { page, limit },
    headers: getAuthHeaders(),
  });

  return response.data;
};

export const getUnreadNotificationCount = async () => {
  const response = await axios.get(`${NOTIFICATION_BASE_URL}/unread-count`, {
    headers: getAuthHeaders(),
  });

  return response.data;
};

export const markNotificationAsRead = async (id) => {
  const response = await axios.patch(
    `${NOTIFICATION_BASE_URL}/${id}/read`,
    {},
    {
      headers: getAuthHeaders(),
    }
  );

  return response.data;
};

export const markAllNotificationsAsRead = async () => {
  const response = await axios.patch(
    `${NOTIFICATION_BASE_URL}/read-all`,
    {},
    {
      headers: getAuthHeaders(),
    }
  );

  return response.data;
};

export const deleteNotificationById = async (id) => {
  const response = await axios.delete(`${NOTIFICATION_BASE_URL}/${id}`, {
    headers: getAuthHeaders(),
  });

  return response.data;
};

export const createNotificationForUser = async (payload) => {
  const response = await axios.post(`${NOTIFICATION_BASE_URL}/create`, payload, {
    headers: getAuthHeaders(),
  });

  return response.data;
};
