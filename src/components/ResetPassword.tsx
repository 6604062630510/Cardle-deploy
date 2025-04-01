import { useState, useEffect } from "react";
import { supabase } from "../database/client";
import { useNavigate, useParams } from "react-router-dom";
import bcrypt from 'bcryptjs';

function ResetPassword() {
  const [email, setEmail] = useState("");
  const [verifyData, setVerifyData] = useState({ idcard_num: "", Fname: "", date_of_birth: "" });
  const [canReset, setCanReset] = useState(false);
  const [newPassword, setNewPassword] = useState(""); 
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleVerify = async () => {
    const { data, error } = await supabase
      .from("Users")
      .select("id")
      .eq("idcard_num", verifyData.idcard_num)
      .eq("Fname", verifyData.Fname)
      .eq("date_of_birth", verifyData.date_of_birth)
      .eq("email", email)
      .single();

    if (error || !data) {
      alert("Verification failed. Please check your details.");
      setCanReset(false);
    } else {
      setCanReset(true);
    }
  };

  const handleResetPassword = async () => {
    if (!canReset) return;
    
    if (!newPassword) return alert("Password cannot be empty.");
    const passwordPattern = /(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}/;
    if (!passwordPattern.test(newPassword)) {
      return alert("รหัสผ่านต้องมีตัวอักษรและตัวเลขอย่างน้อย 6 ตัว");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10); 
    
    const { error } = await supabase
      .from("Users")
      .update({ password: hashedPassword })
      .eq("email", email); // Update password based on email verification
  
    if (error) {
      alert("Error updating password: " + error.message);
    } else {
      alert("Password updated successfully.");
      navigate("/signin"); // Redirect to sign-in page after successful password reset
    }
  };


  if (loading) return <div>Loading...</div>;

  return (
    <div className="container my-4 w-75">
      <div className="card shadow-sm p-4">
        <div className=" text-center">
          <h1 className="card-title custom-topic">Reset Password</h1>
          <p>If you forgot your password, please verify your identity below.</p>
        </div>

        <div className="mb-3">
          <label>Email</label>
          <input 
            type="email" 
            className="form-control" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="Enter your email" 
          />
        </div>

        <div className="mb-3">
          <label>ID Card</label>
          <input 
            type="text" 
            className="form-control" 
            value={verifyData.idcard_num} 
            onChange={(e) => setVerifyData({ ...verifyData, idcard_num: e.target.value })} 
            placeholder="Enter your ID card number"
          />
        </div>
        <div className="mb-3">
          <label>ชื่อจริงตามบัตรประชาชน</label>
          <input 
            type="text" 
            className="form-control" 
            value={verifyData.Fname} 
            onChange={(e) => setVerifyData({ ...verifyData, Fname: e.target.value })} 
            placeholder="เช่น สุชาติ"
          />
        </div>
        <div className="mb-3">
          <label>Birth Date</label>
          <input 
            type="date" 
            className="form-control" 
            value={verifyData.date_of_birth} 
            onChange={(e) => setVerifyData({ ...verifyData, date_of_birth: e.target.value })} 
          />
        </div>

        <div className="d-flex justify-content-center mb-4">
          <button className="btn btn-warn-custom" onClick={handleVerify}>Verify Identity</button>
        </div>

        {canReset && (
          <>
            <div className="mb-3">
              <label>New Password</label>
              <input 
                type="password" 
                className="form-control" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                placeholder="Enter your new password"
              />
            </div>
            <div className="d-flex justify-content-center mb-4">
              <button className="btn btn-red-custom" onClick={handleResetPassword}>Reset Password</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;
