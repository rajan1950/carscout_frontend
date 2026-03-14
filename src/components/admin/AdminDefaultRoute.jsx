import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { readAdminSettings } from "./adminPanelSettings";

export const AdminDefaultRoute = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const settings = readAdminSettings();
    const target = settings.defaultAdminRoute || "dashboard";
    navigate(target, { replace: true });
  }, [navigate]);

  return null;
};
