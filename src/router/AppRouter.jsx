import { createBrowserRouter, RouterProvider } from "react-router-dom";

// ==============================
// AUTH COMPONENTS
// ==============================
import { Login } from "../components/Login";
import { Signup } from "../components/Signup";

// ==============================
// CUSTOMER COMPONENTS
// ==============================
import { CustomerNavbar, CarList, CarDetails, GetApiDemo, UseEffectDemo } from "../components/customer/index.js";

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

// ==============================
// SELLER PAGES
// ==============================
import Home from "../pages/seller/Home.jsx";
import SellCar from "../pages/seller/SellCar.jsx";

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
   {path:'/', element: <Home/>},
   {path:'/sellcar', element: <SellCar/>},
   // Customer
   {
      path:'/customer', element:<CustomerNavbar></CustomerNavbar>,
      children: [
         {path:'carlist', element:<CarList></CarList>},
         {path:'cardetails', element:<CarDetails></CarDetails>},
         {path:'getapidemo', element:<GetApiDemo></GetApiDemo>},
         {path:'useeffectdemo', element:<UseEffectDemo></UseEffectDemo>},
      ]
   },
   // Admin
   {
      path:'/adminpanel', element:<AdminSidebar />,
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