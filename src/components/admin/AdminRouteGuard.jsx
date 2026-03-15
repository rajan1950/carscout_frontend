import { Navigate, useLocation } from "react-router-dom";
import { isAdminAuthenticated } from "../../utils/auth";

export const AdminRouteGuard = ({ children }) => {
  const location = useLocation();

  if (!isAdminAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};
