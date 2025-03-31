import React, { useEffect, useRef, useState } from "react";
import headImg from "../assets/se-pic 2.svg";
import { supabase } from "../database/client";

import { useNavigate} from "react-router-dom";

function Home() {


  const [error, setError] = useState<string | null>(null);



  const [currentUser, setCurrentUser] = useState<any>(null);

  const navigate = useNavigate();


  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);




  return (
    <div>
      {currentUser && (
        <div className="container mt-3">
          <h5 className="text-center">Hello, {currentUser.acc_name}!</h5>
        </div>
      )}
      
      {error && <div className="alert alert-danger">{error}</div>}

      <header className="bg-primary text-white py-5 bodyhead">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6 text-md-start text-center">
              <h1>
                Trade your <br />
                <span className="textCard">CARDS</span> HERE!
              </h1>
              <p className="lead">
                Join our community of card collectors and traders
                <br />
                Let’s make your collection grow!
              </p>
              <a className="btn btn-dark-custom btn-lg" href="#">
                Learn more
              </a>
            </div>
            <div className="col-md-6 text-center">
              <img src={headImg} alt="Shopping" className="img-fluid rounded" />
            </div>
          </div>
        </div>
      </header>

      <div className="content-bg">
        <div className="container my-5">
          <div className="d-flex justify-content-center">
            <h2 className="rounded-circle text-center mb-4 Recently-logo">Recently Posts</h2>
          </div>
          

        </div>


      </div>
    </div>
  );
}

export default Home;
