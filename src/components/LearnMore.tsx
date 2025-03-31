import c11 from "../assets/c11.png";
import c12 from "../assets/c12.png";
import c13 from "../assets/c13.png";
import emailpng from "../assets/email.png";


function LearnMore() {

  return (
    <div className="container my-5">
      {/* Section 1: What can you do on our site? */}
      <section className="mb-5">
        <div className="text-center mb-4">
          <h1 className="custom-topic">What can you do on our site?</h1>
        </div>
        <div className="row justify-content-center">
          <div className="col-md-4 text-center mb-3">
            <img src={c11} alt="Trade Cards" className="img-fluid" />
            <p className="fs-5 learn">You can trade your cards</p>
          </div>
          <div className="col-md-4 text-center mb-3">
            <img src={c12} alt="Community" className="img-fluid" />
            <p className="fs-5 learn">Community for all collectors</p>
          </div>
          <div className="col-md-4 text-center mb-3">
            <img src={c13} alt="Sell Cards" className="img-fluid" />
            <p className="fs-5 learn">You can sell your cards</p>
          </div>
        </div>
        <div className="d-flex justify-content-center mb-5"></div>
<div className="text-center w-75 mx-auto">
  <p className="fs-5 learn">
    Welcome to Cardle, the ultimate marketplace for buying, selling, and trading collectible cards!  </p>
    
    <p className="fs-5 learn"> Whether you're a K-pop fan, anime lover, or trading card enthusiast, our platform makes it easier than ever to find the cards you want and securely connect with other collectors.
  </p>
</div>

      </section>

      {/* Section 2: Contact Us */}
      <section className="border-top " >
        <div className="text-center mt-5 mb-4">
          <p className="section--text--p1 fs-5">Get in touch</p>
          <p className="custom-topic fs-1 fw-bold">Contact Us</p>
        </div>
        <div className="row justify-content-center mb-3">
          <div className="col-md-6 text-center">
            <div
              className="d-flex justify-content-center align-items-center"
              style={{
                border: "5px solid #ccc",
                borderRadius: "90px",
                padding: "4rem",
                display: "inline-block",
                background: "#ffffff",
              }}
            >
              <img
                src={emailpng}
                alt="email icon"
                className="contact-icon me-2"
                style={{ width: "40px", height: "40px" }}
              />
              <p className="mb-0 fs-3">cardle.help@gmail.com</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LearnMore;
