import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Login } from "../components/Login";
import { Signup } from "../components/Signup";
import { CustomerNavbar, CarList, CarDetails, GetApiDemo, UseEffectDemo } from "../components/customer/index.js";
import { AdminSidebar, AllUsers } from "../components/admin/index.js";
import Found404 from "../pages/404Found";

const router = createBrowserRouter([
   {path:'/login', element:<Login/>},
   {path:'/signup', element: <Signup/>},
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
      path:'/admin', element:<AdminSidebar></AdminSidebar>,
      children: [
         {path:'allusers', element:<AllUsers></AllUsers>}
      ]
   },
   { path:'*', element: <Found404/> }
])

const AppRouter =  () => {
   return <RouterProvider router={router}></RouterProvider>
}
export default AppRouter