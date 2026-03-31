import axios from "axios";
import { readAuthSession } from "../utils/auth";

const REPORT_BASE_URL = "http://localhost:4444/report";

const getAuthHeaders = () => {
  const token = readAuthSession()?.token;

  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
};

export const createReportApi = async (payload) => {
  const response = await axios.post(`${REPORT_BASE_URL}/add`, payload, {
    headers: getAuthHeaders(),
  });

  return response.data;
};

export const getUserReportsApi = async (userId) => {
  const response = await axios.get(`${REPORT_BASE_URL}/user/${userId}`, {
    headers: getAuthHeaders(),
  });

  return response.data;
};

export const getAllReportsApi = async () => {
  const response = await axios.get(`${REPORT_BASE_URL}/all`, {
    headers: getAuthHeaders(),
  });

  return response.data;
};

export const updateReportStatusApi = async (id, status) => {
  const response = await axios.patch(
    `${REPORT_BASE_URL}/${id}/status`,
    { status },
    {
      headers: getAuthHeaders(),
    }
  );

  return response.data;
};

export const deleteReportApi = async (id) => {
  const response = await axios.delete(`${REPORT_BASE_URL}/${id}`, {
    headers: getAuthHeaders(),
  });

  return response.data;
};
