import { BrowserRouter, Routes, Route } from "react-router-dom"
import App from "./App.tsx";
import Cadastro from "./Pages/Cadastro/cadastro.tsx";

function RoutesApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/criar-conta" element={<Cadastro />} />
      </Routes>
    </BrowserRouter>
  )
}

export default RoutesApp;