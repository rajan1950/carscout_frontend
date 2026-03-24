import { createBrowserRouter, RouterProvider } from "react-router-dom";

// ==============================
// AUTH COMPONENTS
// ==============================
import { Login } from "../components/Login";
import { Signup } from "../components/Signup";
import { ForgotPassword } from "../components/forgotpassword";
import { ResetPassword } from "../components/resetpassword";

// ==============================
// CUSTOMER COMPONENTS
// ==============================
import { CustomerNavbar, CustomerHome } from "../components/customer/index.js";

// ==============================
// ADMIN COMPONENTS
// ==============================
import { AdminSidebar } from "../components/admin/AdminSidebar";
import { AdminDashboard } from "../components/admin/AdminDashboard";
import { AdminUsers } from "../components/admin/AdminUsers";
import { AdminCars } from "../components/admin/AdminCars";
import { AdminInquiries } from "../components/admin/AdminInquiries";
import { AdminMessages } from "../components/admin/AdminMessages";
import { AdminReviews } from "../components/admin/AdminReviews";
import { AdminTestDrives } from "../components/admin/AdminTestDrives";
import { AdminSettings } from "../components/admin/AdminSettings";
import { AdminDefaultRoute } from "../components/admin/AdminDefaultRoute";
import { AdminRouteGuard } from "../components/admin/AdminRouteGuard";

// ==============================
// SELLER PAGES
// ==============================
import Home from "../pages/seller/Home.jsx";
import SellCar from "../pages/seller/SellCar.jsx";
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
   {path:'/sellcar', element: <SellCar/>},
   {path:'/profile', element: <ProfilePage/>},
   {path:'/notifications', element: <NotificationsPage/>},
   // Customer
   {
      path:'/customer', element:<CustomerNavbar></CustomerNavbar>,
      children: [
         { index: true, element:<CustomerHome /> },
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
         { path:'testdrives', element:<AdminTestDrives /> },
         { path:'settings', element:<AdminSettings /> },
      ]
   },
   { path:'*', element: <Found404/> }
])

const AppRouter =  () => {
   return <RouterProvider router={router}></RouterProvider>
}
export default AppRouter