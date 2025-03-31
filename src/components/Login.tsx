import React, { useState } from "react";
import { supabase } from "../database/client";
import { Link, useNavigate, useLocation } from "react-router-dom";
import bcrypt from "bcryptjs";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import imgSignIn from "../assets/signin.png";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const from = location.state?.from || "/";

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    if (name === "email") {
      setEmail(value);
    } else if (name === "password") {
      setPassword(value);
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data: user, error: loginError } = await supabase
        .from("Users")
        .select("*")
        .eq("email", email)
        .single();

      if (loginError) {
        toast.error("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
        return;
      }
      if (!user) {
        toast.error("ไม่พบผู้ใช้ที่มีอีเมลนี้");
        return;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        toast.error("รหัสผ่านไม่ถูกต้อง");
        return;
      }

      if (user.status === "banned") {
        toast.error("บัญชีของคุณถูกแบน");
        return;
      } else if (user.status === "waiting") {
        toast.warning("บัญชีของคุณอยู่ในสถานะรอการอนุมัติ");

        return;
      } else if (user.status === "rejected") {
        toast.error("บัญชีของคุณถูกปฏิเสธ");

        return;
      } else if (user.status !== "approved") {
        toast.error("บัญชีของคุณยังไม่ได้รับการอนุมัติ");
 
        return;
      }

      localStorage.setItem("currentUser", JSON.stringify(user));


      if (user.role === "admin") {
        toast.success("ล็อกอินสำเร็จ! ยินดีต้อนรับเข้าสู่หน้า Admin");
        window.dispatchEvent(new Event("storage"));
        navigate("/");
      } else {
        toast.success("ล็อกอินสำเร็จ! ยินดีต้อนรับเข้าสู่ User Dashboard");
        window.dispatchEvent(new Event("storage"));
        navigate(from, { replace: true });
        window.location.reload();
      }
    } catch (error: any) {
      toast.error("เกิดข้อผิดพลาดในการล็อกอิน");
      console.error(error.message);
    }
  };

  return (
    <div className="container mt-5">
      <ToastContainer position="top-center" toastStyle={{ width: "500px" }} />
      <div className="row justify-content-center">
        <div className="col-md-6">
          <img
            src={imgSignIn}
            width="60%"
            height="auto"
            className="d-block mx-auto mt-5"
            style={{ marginBottom: "4rem" }}
            alt="Sign In"
          />
          <form onSubmit={handleLogin} className="p-4 border rounded-3 shadow-sm bg-white mb-5">

            <div className="mb-3">
              <input
                className="form-control"
                type="email"
                placeholder="Email"
                name="email"
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <div className="input-group">
                <input
                  className="form-control"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  name="password"
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            <div className="d-flex justify-content-center mt-3">
              <button className="btn btn-dark-custom" type="submit">
                Sign In
              </button>
            </div>
          </form>
          <div className="d-flex justify-content-center align-items-center">
            <span>You don't have an account? </span>
            <Link to="/signup" className="text-dark fs-5 ms-2">
              Let's create one!
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
