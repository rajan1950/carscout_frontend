import { useEffect, useRef, useState } from "react";
import { Navigate, Outlet, RouterProvider, createBrowserRouter, useLocation } from "react-router-dom";
import { isAuthenticated } from "../utils/auth";
import { GlobalCarLoader } from "../components/common/GlobalCarLoader";

// 🔹 Seller / Home
import Home from "../pages/seller/Home";
import Services from "../pages/seller/Services";

// 🔹 Auth Pages
import { Login } from "../pages/auth/Login";
import { Signup } from "../pages/auth/Signup";
import { ForgotPassword } from "../pages/auth/forgotpassword";
import { ResetPassword } from "../pages/auth/ResetPassword";
import { SignupOtpVerify } from "../pages/auth/SignupOtpVerify";

// 🔹 Common Pages
import ProfilePage from "../pages/ProfilePage";
import NotificationsPage from "../pages/NotificationsPage";
import Found404 from "../pages/404Found";

// 🔹 Buyer
import { BuyCarPage } from "../components/buyer/BuyCarPage";
import { CarDetailsPage } from "../components/buyer/CarDetailsPage";
import { CompareInsightsPage } from "../components/buyer/CompareInsightsPage";
import { OffersPage } from "../components/buyer/OffersPage";

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
  AdminOffers,
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

const AppRouteTransitionShell = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const isFirstLoadRef = useRef(true);

  useEffect(() => {
    const duration = isFirstLoadRef.current ? 1300 : 650;
    setLoading(true);

    const timer = window.setTimeout(() => {
      setLoading(false);
      isFirstLoadRef.current = false;
    }, duration);

    return () => {
      window.clearTimeout(timer);
    };
  }, [location.pathname, location.search]);

  return (
    <>
      <GlobalCarLoader visible={loading} />
      <Outlet />
    </>
  );
};

const router = createBrowserRouter([
  {
    element: <AppRouteTransitionShell />,
    children: [
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
        path: "/signup/verify-otp",
        element: <SignupOtpVerify />,
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
          {
            path: "car/:carId",
            element: <CarDetailsPage />,
          },
          {
            path: "offers",
            element: <OffersPage />,
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
          { path: "offers", element: <AdminOffers /> },
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
    ],
  },
]);

const AppRouter = () => <RouterProvider router={router} />;

export default AppRouter;