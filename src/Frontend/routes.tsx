import { BrowserRouter, Routes, Route } from "react-router-dom"
import Authentication from "./Pages/Authentication.tsx";
import Home from "./Pages/Home.tsx";
import Feed from "./Pages/Feed.jsx";
import Profile from "./Pages/Profile.jsx";

function RoutesApp() {
  return (
    <BrowserRouter>
      <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Authentication />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/profile/:id" element={<Profile />} />

      </Routes>
    </BrowserRouter>
  )
}

export default RoutesApp;