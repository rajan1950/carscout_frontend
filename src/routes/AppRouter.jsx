import { createBrowserRouter, RouterProvider } from "react-router-dom";

// ==============================
// AUTH COMPONENTS
// ==============================
import { Login } from "../pages/auth/Login";
import { Signup } from "../pages/auth/Signup";
import { ForgotPassword } from "../pages/auth/forgotpassword";
import { ResetPassword } from "../pages/auth/ResetPassword";

// ==============================
// CUSTOMER COMPONENTS
// ==============================
import { CustomerNavbar } from "../layouts/CustomerNavbar";
import { CustomerHome } from "../components/customer/CustomerHome";
import { CompareInsightsPage } from "../components/buyer/CompareInsightsPage";
import { BuyCarPage } from "../components/buyer/BuyCarPage";

// ==============================
// ADMIN COMPONENTS
// ==============================
import { AdminSidebar } from "../layouts/AdminSidebar";
import { AdminDashboard } from "../components/admin/AdminDashboard";
import { AdminUsers } from "../components/admin/AdminUsers";
import { AdminCars } from "../components/admin/AdminCars";
import { AdminInquiries } from "../components/admin/AdminInquiries";
import { AdminMessages } from "../components/admin/AdminMessages";
import { AdminReviews } from "../components/admin/AdminReviews";
import { AdminReports } from "../components/admin/AdminReports";
import { AdminTestDrives } from "../components/admin/AdminTestDrives";
import { AdminWishlists } from "../components/admin/AdminWishlists";
import { AdminPurchases } from "../components/admin/AdminPurchases";
import { AdminSettings } from "../components/admin/AdminSettings";
import { AdminDefaultRoute } from "../components/admin/AdminDefaultRoute";
import { AdminRouteGuard } from "../components/admin/AdminRouteGuard";

// ==============================
// SELLER PAGES
// ==============================
import Home from "../pages/seller/Home.jsx";
import Services from "../pages/seller/Services.jsx";
import ProfilePage from "../pages/ProfilePage.jsx";
import NotificationsPage from "../pages/NotificationsPage.jsx";

// ==============================
// ERROR PAGE
// ==============================
import Found404 from "../pages/404Found";

// ======================================================
// ROUTER CONFIGURATION
// ======================================================

const router = createBrowserRouter([
   {path:'/login', element:<Login/>},
   {path:'/signup', element: <Signup/>},
   {path:'/forgotpassword', element: <ForgotPassword/>},
   {path:'/resetpassword/:token', element: <ResetPassword/>},
   {path:'/', element: <Home/>},
   {path:'/services', element: <Services/>},
   {path:'/profile', element: <ProfilePage/>},
   {path:'/notifications', element: <NotificationsPage/>},
   // Customer
   {
      path:'/customer', element:<CustomerNavbar></CustomerNavbar>,
      children: [
         { index: true, element:<CustomerHome /> },
         { path:'compare', element:<CompareInsightsPage /> },
         { path:'buy/:carId', element:<BuyCarPage /> },
      ]
   },
   // Admin
   {
      path:'/adminpanel', element:(
         <AdminRouteGuard>
            <AdminSidebar />
         </AdminRouteGuard>
      ),
      children: [
         { index: true, element:<AdminDefaultRoute /> },
         { path:'dashboard', element:<AdminDashboard /> },
         { path:'users', element:<AdminUsers /> },
         { path:'cars', element:<AdminCars /> },
         { path:'inquiries', element:<AdminInquiries /> },
         { path:'messages', element:<AdminMessages /> },
         { path:'reviews', element:<AdminReviews /> },
         { path:'reports', element:<AdminReports /> },
         { path:'testdrives', element:<AdminTestDrives /> },
         { path:'wishlists', element:<AdminWishlists /> },
         { path:'purchases', element:<AdminPurchases /> },
         { path:'settings', element:<AdminSettings /> },
      ]
   },
   { path:'*', element: <Found404/> }
])

const AppRouter =  () => {
   return <RouterProvider router={router}></RouterProvider>
}
export default AppRouter