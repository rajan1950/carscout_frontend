import { Navigate, useLocation } from "react-router-dom";
import { isAdminAuthenticated, isAuthenticated } from "../../utils/auth";

export const AdminRouteGuard = ({ children }) => {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!isAdminAuthenticated()) {
    return <Navigate to="/" replace state={{ unauthorized: true }} />;
  }

  return children;
};
