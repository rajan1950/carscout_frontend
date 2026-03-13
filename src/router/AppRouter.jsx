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
   { path:'/adminpanel', element:<AdminSidebar /> },
   { path:'*', element: <Found404/> }
])

const AppRouter =  () => {
   return <RouterProvider router={router}></RouterProvider>
}
export default AppRouter