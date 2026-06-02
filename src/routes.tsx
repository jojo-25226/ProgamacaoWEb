import { BrowserRouter, Routes, Route } from "react-router-dom"
import RegisterAndLogin from "./Pages/RegisterAndLogin.tsx";
import Home from "./Pages/Home.tsx";

function RoutesApp() {
  return (
    <BrowserRouter>
      <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<RegisterAndLogin />} />
      </Routes>
    </BrowserRouter>
  )
}

export default RoutesApp;