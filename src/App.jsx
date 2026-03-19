import { Slide, ToastContainer } from "react-toastify"
import AppRouter from "./router/AppRouter"
import axios from "axios"
import { NotificationProvider } from "./context/NotificationContext"

function App() {

 //  axios.defaults.baseURL = "http://localhost:5555"

  return (
    <>
      <NotificationProvider>
        <AppRouter></AppRouter>
      </NotificationProvider>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        transition={Slide}
      />
    </>
  )
}

export default App
