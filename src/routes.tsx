import { BrowserRouter, Routes, Route } from "react-router-dom"
import App from "./App.tsx";
import Cadastro from "./Pages/Cadastro/cadastro.tsx";
import Login from "./Pages/Login.tsx";
import RegisterAndLogin from "./Pages/Register.tsx";

function RoutesApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/criar-conta" element={<Cadastro />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterAndLogin />} />
      </Routes>
    </BrowserRouter>
  )
}

export default RoutesApp;