import { useState, useEffect } from "react";
import "../App.css";
import { Link, useNavigate } from "react-router-dom";
import fullfav from "../assets/fill-fav-icon.png";
interface NavbarProps {
    brandName: string;
    imageSrcPath: string;
    navItems: string[];
}

function Navbar({ brandName, imageSrcPath, navItems }: NavbarProps) {
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const links = ["/", "/trade", "/shop","/mydeal"];
    const navigate = useNavigate();

    useEffect(() => {
      const checkUser = () => {
          const userData = localStorage.getItem("currentUser");
          setCurrentUser(userData ? JSON.parse(userData) : null);
      };
  
      checkUser();

      window.addEventListener("storage", checkUser);
  
      return () => {
          window.removeEventListener("storage", checkUser);
      };
  }, []);
  
    const handleLogout = () => {
        localStorage.removeItem("currentUser");
        setCurrentUser(null);
        navigate("");
        window.location.reload()
    };

    const handleMyDeal = () => {
        navigate(`/profile/${currentUser.username}`);
    };

    

    return (
        <nav className="navbar navbar-expand-md navbar-light bg-white ">
            <div className="container-fluid">
                <Link className="navbar-brand" to="/">
                    <img
                        src={imageSrcPath}
                        width="60"
                        height="60"
                        className="d-inline-block align-center me-2"
                        alt=""
                    />
                    <span className="fw-bolder fs-4 ">{brandName}</span>
                </Link>

                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarSupportedContent"
                    aria-controls="navbarSupportedContent"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse align-items-start flex-column flex-md-row" id="navbarSupportedContent">
                    <ul className="navbar-nav me-auto mb-2 mb-md-1">
                        {navItems.map((item, index) => (
                            <li key={item} className="nav-item" onClick={() => setSelectedIndex(index)}>
                                <Link
                                    className={selectedIndex === index ? "nav-link active fw-bold" : "nav-link"}
                                    to={links[index]}
                                >
                                    {item}
                                </Link>
                            </li>
                        ))}
                    </ul>

                    <div className="align-middle">
                    {currentUser ? (
                        <>
                        
                        <button className="btn btn-custom me-2" onClick={handleLogout}>
                                Logout
                            </button>

                            <Link to="mailto:cardle.help@gmail.com?subject=%E0%B9%82%E0%B8%9B%E0%B8%A3%E0%B8%94%E0%B8%87%E0%B8%B2%E0%B8%99%E0%B8%9B%E0%B8%B1%E0%B8%8D%E0%B8%AB%E0%B8%B2%E0%B8%82%E0%B8%AD%E0%B8%87%E0%B8%84%E0%B8%B8%E0%B8%93&body=%E0%B9%82%E0%B8%9B%E0%B8%A3%E0%B8%94%E0%B8%A3%E0%B8%B0%E0%B8%9A%E0%B8%B8%E0%B8%9B%E0%B8%B1%E0%B8%8D%E0%B8%AB%E0%B8%B2%E0%B9%83%E0%B8%AB%E0%B9%89%E0%B8%A5%E0%B8%B0%E0%B9%80%E0%B8%AD%E0%B8%B5%E0%B8%A2%E0%B8%94%E0%B8%9E%E0%B8%A3%E0%B9%89%E0%B8%AD%E0%B8%A1%E0%B8%A3%E0%B8%B9%E0%B8%9B%20%E0%B8%A0%E0%B8%B2%E0%B8%9E%E0%B8%AB%E0%B8%A3%E0%B8%B7%E0%B8%AD%E0%B8%9A%E0%B8%B1%E0%B8%99%E0%B8%97%E0%B8%B6%E0%B8%81%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B8%AA%E0%B8%99%E0%B8%97%E0%B8%99%E0%B8%B2%20%E0%B8%A3%E0%B8%A7%E0%B8%A1%E0%B8%96%E0%B8%B6%E0%B8%87%E0%B8%A3%E0%B8%B0%E0%B8%9A%E0%B8%B8%20username%20%E0%B8%82%E0%B8%AD%E0%B8%87%E0%B8%84%E0%B8%B8%E0%B8%93%20%E0%B9%81%E0%B8%A5%E0%B8%B0%E0%B8%84%E0%B8%B9%E0%B9%88%E0%B8%81%E0%B8%A3%E0%B8%93%E0%B8%B5%20(%E0%B8%96%E0%B9%89%E0%B8%B2%E0%B8%A1%E0%B8%B5)%20%E0%B9%80%E0%B8%9E%E0%B8%B7%E0%B9%88%E0%B8%AD%E0%B9%83%E0%B8%AB%E0%B9%89%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B8%8A%E0%B9%88%E0%B8%A7%E0%B8%A2%E0%B9%80%E0%B8%AB%E0%B8%A5%E0%B8%B7%E0%B8%AD%E0%B8%A3%E0%B8%A7%E0%B8%94%E0%B9%80%E0%B8%A3%E0%B9%87%E0%B8%A7%E0%B8%82%E0%B8%B6%E0%B9%89%E0%B8%99" className="btn btn-custom-red me-2" role="button">
                                report
                            </Link>
                            {currentUser.role === "admin" && currentUser.status === "approved" && (
                                <Link to="admin" className="btn btn-custom me-2" role="button">
                                Admin
                            </Link>
                            )}
                            
                            <button className="btn btn-custom me-2" onClick={handleMyDeal}>
                                Me
                            </button> 
                            <Link to="myfav" className="btn btn-custom me-2" role="button">
                                <img src={fullfav} alt="Favorite" style={{ width: '25px' }} />
                            </Link>

                        </>
                    ) : (
                        <Link to="/signin" className="btn btn-custom me-2" role="button">
                            Login
                        </Link>
                    )}
                    <Link to="create-post" className="btn btn-custom" role="button">
                        Post
                    </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
