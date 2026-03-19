import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { AUTH_SESSION_EVENT, readAuthSession } from "../utils/auth";
import {
  deleteNotificationById,
  getMyNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../services/notificationService";

export const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [list, setList] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
  });

  const fetchUnreadCount = useCallback(async () => {
    if (!readAuthSession()?.token) {
      setUnreadCount(0);
      return 0;
    }

    try {
      const response = await getUnreadNotificationCount();
      const nextCount = Number(response?.unreadCount || 0);
      setUnreadCount(nextCount);
      return nextCount;
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load unread count");
      return 0;
    }
  }, []);

  const fetchNotifications = useCallback(async ({ page = 1, limit = 20 } = {}) => {
    if (!readAuthSession()?.token) {
      setList([]);
      setPagination({ page: 1, limit, total: 0 });
      return null;
    }

    setLoading(true);
    setError("");

    try {
      const response = await getMyNotifications({ page, limit });
      const nextList = Array.isArray(response?.data) ? response.data : [];
      setList(nextList);
      setPagination({
        page: Number(response?.page || page),
        limit: Number(response?.limit || limit),
        total: Number(response?.total || 0),
      });
      return response;
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load notifications");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const markOneAsRead = useCallback(async (id) => {
    if (!id) {
      return null;
    }

    setLoading(true);
    setError("");

    try {
      const response = await markNotificationAsRead(id);
      let decremented = false;
      setList((prev) =>
        prev.map((item) => {
          if (item._id !== id) {
            return item;
          }

          if (!item.isRead) {
            decremented = true;
          }

          return {
            ...item,
            isRead: true,
            readAt: new Date().toISOString(),
          };
        })
      );

      if (decremented) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      return response;
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to mark notification as read");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await markAllNotificationsAsRead();
      setList((prev) => prev.map((item) => ({ ...item, isRead: true, readAt: item.readAt || new Date().toISOString() })));
      setUnreadCount(0);
      return response;
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to mark all notifications as read");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteOne = useCallback(async (id) => {
    if (!id) {
      return null;
    }

    setLoading(true);
    setError("");

    try {
      await deleteNotificationById(id);

      let removedUnread = false;
      setList((prev) =>
        prev.filter((item) => {
          const isTarget = item._id === id;
          if (isTarget && !item.isRead) {
            removedUnread = true;
          }
          return !isTarget;
        })
      );

      if (removedUnread) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      setPagination((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }));
      return true;
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete notification");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();

    const intervalId = window.setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [fetchUnreadCount]);

  useEffect(() => {
    const syncSession = () => {
      if (!readAuthSession()?.token) {
        setList([]);
        setUnreadCount(0);
        setError("");
        return;
      }

      fetchUnreadCount();
    };

    window.addEventListener(AUTH_SESSION_EVENT, syncSession);
    window.addEventListener("storage", syncSession);

    return () => {
      window.removeEventListener(AUTH_SESSION_EVENT, syncSession);
      window.removeEventListener("storage", syncSession);
    };
  }, [fetchUnreadCount]);

  const value = useMemo(
    () => ({
      list,
      unreadCount,
      loading,
      error,
      pagination,
      fetchUnreadCount,
      fetchNotifications,
      markOneAsRead,
      markAllAsRead,
      deleteOne,
    }),
    [
      list,
      unreadCount,
      loading,
      error,
      pagination,
      fetchUnreadCount,
      fetchNotifications,
      markOneAsRead,
      markAllAsRead,
      deleteOne,
    ]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};
