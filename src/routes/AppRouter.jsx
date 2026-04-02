import { Navigate, RouterProvider, createBrowserRouter, useLocation } from "react-router-dom";
import { isAuthenticated } from "../utils/auth";

// 🔹 Seller / Home
import Home from "../pages/seller/Home";
import Services from "../pages/seller/Services";

// 🔹 Auth Pages
import { Login } from "../pages/auth/Login";
import { Signup } from "../pages/auth/Signup";
import { ForgotPassword } from "../pages/auth/forgotpassword";
import { ResetPassword } from "../pages/auth/ResetPassword";

// 🔹 Common Pages
import ProfilePage from "../pages/ProfilePage";
import NotificationsPage from "../pages/NotificationsPage";
import Found404 from "../pages/404Found";

// 🔹 Buyer
import { BuyCarPage } from "../components/buyer/BuyCarPage";
import { CompareInsightsPage } from "../components/buyer/CompareInsightsPage";

// 🔹 Customer
import { CustomerHome } from "../components/customer";
import { CustomerNavbar } from "../layouts/CustomerNavbar";

// 🔹 Admin
import {
  AdminCars,
  AdminDashboard,
  AdminDefaultRoute,
  AdminInquiries,
  AdminMessages,
  AdminPurchases,
  AdminReports,
  AdminReviews,
  AdminRouteGuard,
  AdminSettings,
  AdminSidebar,
  AdminTestDrives,
  AdminUsers,
  AdminWishlists,
} from "../components/admin";

const AuthRouteGuard = ({ children }) => {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};

const router = createBrowserRouter([
  // 🔥 HOME
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/services",
    element: (
      <AuthRouteGuard>
        <Services />
      </AuthRouteGuard>
    ),
  },

  // 🔐 AUTH
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/forgotpassword",
    element: <ForgotPassword />,
  },
  {
    path: "/resetpassword/:token",
    element: <ResetPassword />,
  },

  // 👤 USER
  {
    path: "/profile",
    element: (
      <AuthRouteGuard>
        <ProfilePage />
      </AuthRouteGuard>
    ),
  },
  {
    path: "/notifications",
    element: (
      <AuthRouteGuard>
        <NotificationsPage />
      </AuthRouteGuard>
    ),
  },

  // 🚗 BUY
  {
    path: "/buy/:carId",
    element: (
      <AuthRouteGuard>
        <BuyCarPage />
      </AuthRouteGuard>
    ),
  },

  // 👥 CUSTOMER
  {
    path: "/customer",
    element: (
      <AuthRouteGuard>
        <CustomerNavbar />
      </AuthRouteGuard>
    ),
    children: [
      {
        index: true,
        element: <CustomerHome />,
      },
      {
        path: "compare",
        element: <CompareInsightsPage />,
      },
    ],
  },

  // 🛠️ ADMIN
  {
    path: "/adminpanel",
    element: (
      <AdminRouteGuard>
        <AdminSidebar />
      </AdminRouteGuard>
    ),
    children: [
      { index: true, element: <AdminDefaultRoute /> },
      { path: "dashboard", element: <AdminDashboard /> },
      { path: "users", element: <AdminUsers /> },
      { path: "cars", element: <AdminCars /> },
      { path: "inquiries", element: <AdminInquiries /> },
      { path: "messages", element: <AdminMessages /> },
      { path: "reviews", element: <AdminReviews /> },
      { path: "reports", element: <AdminReports /> },
      { path: "testdrives", element: <AdminTestDrives /> },
      { path: "wishlists", element: <AdminWishlists /> },
      { path: "purchases", element: <AdminPurchases /> },
      { path: "settings", element: <AdminSettings /> },
    ],
  },

  // ❌ ERROR
  {
    path: "/404",
    element: <Found404 />,
  },
  {
    path: "*",
    element: <Navigate to="/404" replace />,
  },
]);

const AppRouter = () => <RouterProvider router={router} />;

export default AppRouter;