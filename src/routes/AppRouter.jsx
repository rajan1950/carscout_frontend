import { Navigate, RouterProvider, createBrowserRouter } from "react-router-dom";
import { BuyCarPage } from "../components/buyer/BuyCarPage";
import { CompareInsightsPage } from "../components/buyer/CompareInsightsPage";
import { CustomerHome } from "../components/customer";
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
import { CustomerNavbar } from "../layouts/CustomerNavbar";
import Found404 from "../pages/404Found";
import NotificationsPage from "../pages/NotificationsPage";
import ProfilePage from "../pages/ProfilePage";
import { ForgotPassword } from "../pages/auth/forgotpassword";
import { Login } from "../pages/auth/Login";
import { ResetPassword } from "../pages/auth/ResetPassword";
import { Signup } from "../pages/auth/Signup";
import Home from "../pages/seller/Home";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
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
  {
    path: "/profile",
    element: <ProfilePage />,
  },
  {
    path: "/notifications",
    element: <NotificationsPage />,
  },
  {
    path: "/buy/:carId",
    element: <BuyCarPage />,
  },
  {
    path: "/customer",
    element: <CustomerNavbar />,
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
  {
    path: "/adminpanel",
    element: (
      <AdminRouteGuard>
        <AdminSidebar />
      </AdminRouteGuard>
    ),
    children: [
      {
        index: true,
        element: <AdminDefaultRoute />,
      },
      {
        path: "dashboard",
        element: <AdminDashboard />,
      },
      {
        path: "users",
        element: <AdminUsers />,
      },
      {
        path: "cars",
        element: <AdminCars />,
      },
      {
        path: "inquiries",
        element: <AdminInquiries />,
      },
      {
        path: "messages",
        element: <AdminMessages />,
      },
      {
        path: "reviews",
        element: <AdminReviews />,
      },
      {
        path: "reports",
        element: <AdminReports />,
      },
      {
        path: "testdrives",
        element: <AdminTestDrives />,
      },
      {
        path: "wishlists",
        element: <AdminWishlists />,
      },
      {
        path: "purchases",
        element: <AdminPurchases />,
      },
      {
        path: "settings",
        element: <AdminSettings />,
      },
    ],
  },
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
