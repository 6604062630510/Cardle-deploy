import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";

import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import imagePath from "./assets/LogoCardle.png";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Admin from "./components/Admin";
import PrivacyPolicy from "./components/PrivacyPolicy";

function PageWrapper() {
  const location = useLocation();

  let pageClass = "";
  if (location.pathname === "/") {
    pageClass = "home-page"; }
    else if (location.pathname === "/admin") {
    pageClass = "admin-page";
  } else if (location.pathname === "/signin" || location.pathname === "/signup") {
    pageClass = "signin-page";
  } else if (location.pathname === "/privacy-policy" || location.pathname === "/signup") {
    pageClass = "privacy-policy-page";
  }
  
  let items = ["Home", "Trade", "Shop"];

  return (
    <div className={`app-container ${pageClass}`}>
      <Navbar brandName="Cardle" imageSrcPath={imagePath} navItems={items} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy/>} />

      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <PageWrapper />
    </Router>
  );
}

export default App;
