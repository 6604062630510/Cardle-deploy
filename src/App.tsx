import { HashRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Trade from "./components/Trade";
import Shop from "./components/Shop";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import imagePath from "./assets/LogoCardle.png";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Admin from "./components/Admin";
import LearnMore from "./components/LearnMore";
import CreatePost from "./components/Create-post";
import ProductTradeDetail from "./components/ProductTradeDetail";
import MyDeal from "./components/MyDeal";
import ViewOffer from "./components/ViewOffer";
import Tracking from "./components/Tracking";
import ProductShopDetail from "./components/ProductShopDetail";
import ViewConfirm from "./components/ViewConfirm";
import TrackingSell from "./components/TrackingSell";
import Fav from "./components/Fav";
import UserProfile from "./components/UserProfile";
import EditPro from "./components/EditPro";
import PrivacyPolicy from "./components/PrivacyPolicy";
import Report from "./components/Report";

function PageWrapper() {
  const location = useLocation();

  let pageClass = "";
  if (location.pathname === "/") {
    pageClass = "home-page";
  } else if (location.pathname === "/trade") {
    pageClass = "trade-page";
  } else if (location.pathname === "/shop") {
    pageClass = "shop-page";
  } else if (location.pathname.startsWith("/trade/product")) {
    pageClass = "product-trade-detail-page";
  } else if (location.pathname.startsWith("/shop/product")) {
    pageClass = "product-sell-detail-page";
  } else if (location.pathname === "/admin") {
    pageClass = "admin-page";
  }  else if (location.pathname === "/myfav") {
    pageClass = "fav-page";
  } else if (location.pathname === "/mydeal") {
    pageClass = "mydeal-page";
  } else if (location.pathname === "/create-post") {
    pageClass = "create-post-page";
  } else if (location.pathname === "/signin" || location.pathname === "/signup") {
    pageClass = "signin-page";
  } else if (location.pathname.startsWith("/profile")) {
    pageClass = "profile-page";
  }else if (location.pathname.startsWith("/edit-profile")) {
    pageClass = "signin-page";
  } else if (location.pathname === "/privacy-policy" || location.pathname === "/signup") {
    pageClass = "privacy-policy-page";
  }else if (location.pathname === "/learnmore") {
    pageClass = "learn-page"
  }
  
  let items = ["Home", "Trade", "Shop", "My Deal"];

  return (
    <div className={`app-container ${pageClass}`}>
      <Navbar brandName="Cardle" imageSrcPath={imagePath} navItems={items} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/trade" element={<Trade />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/signin" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/create-post" element={<CreatePost />} />
        <Route path="/myfav" element={<Fav />} />
        <Route path="/trade/product/:id" element={<ProductTradeDetail />} />
        <Route path="/shop/product/:id" element={<ProductShopDetail />} />
        <Route path="/trade/product-offer/:id" element={<ViewOffer />} />
        <Route path="/shop/product-waiting/:id" element={<ViewConfirm />} />
        <Route path="/trade/product-tracking/:id" element={<Tracking/>} />
        <Route path="/shop/product-tracking/:id" element={<TrackingSell/>} />
        <Route path="/profile/:username" element={<UserProfile/>} />
        <Route path="/edit-profile/:username" element={<EditPro/>} />
        <Route path="/privacy-policy" element={<PrivacyPolicy/>} />
        <Route path="/mydeal" element={<MyDeal/>}/>
        <Route path="/learnmore" element={<LearnMore/>}/>
        <Route path="/report" element={<Report/>}/>
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
