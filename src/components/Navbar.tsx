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
        navigate("/");
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


                    {currentUser ? (
                        <>
                        <button className="btn btn-custom me-2" onClick={handleLogout}>
                                Logout
                            </button>
                            {currentUser.role === "admin" && currentUser.status === "approved" && (
                                <Link to="admin" className="btn btn-custom me-2" role="button">
                                Admin
                            </Link>
                            )}
                            
                            <button className="btn btn-custom me-2" onClick={handleMyDeal}>
                                Me
                            </button>
                            <Link to="myfav" className="btn btn-custom me-2" role="button">
  <img src={fullfav} alt="Favorite" style={{ width: '30px' }} />
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
        </nav>
    );
}

export default Navbar;
