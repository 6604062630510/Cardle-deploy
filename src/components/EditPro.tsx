import { useState, useEffect } from "react";
import { supabase } from "../database/client";
import { useNavigate, useParams } from "react-router-dom";
import bcrypt from 'bcryptjs';

function EditPro() {
  const [userData, setUserData] = useState<any>(null); 
  const [editData, setEditData] = useState({ acc_name: "", contact: "", about: "" });
  const [loading, setLoading] = useState(true);
  const [verifyData, setVerifyData] = useState({ idcard_num: "", Fname: "", date_of_birth: "" });
  const [canReset, setCanReset] = useState(false);
  const navigate = useNavigate();
  const { username } = useParams(); 

  useEffect(() => {
    const fetchUserData = async () => {
        const storedUser = localStorage.getItem("currentUser");
        const user = storedUser ? JSON.parse(storedUser) : null;

        if (!user) {
          navigate("/signin");
          return;
        }


        const { data, error } = await supabase.from("Users").select("* ").eq("id", user.id).single();
        
        if (error) {
          console.error("Error fetching user data:", error.message);
        } else {
          setUserData(data);
          setEditData({ acc_name: data.acc_name, contact: data.contact, about: data.about });
          

          if (data.username !== username) {
            navigate("/");
            return;
          }
        }
        setLoading(false);
    };
    fetchUserData();
  }, [username, navigate]); 

  const handleUpdate = async () => {

    if (editData.acc_name.length < 0 || editData.acc_name.length > 61 ) {
      return alert("ชื่อแอคเคาน์ต้องมีความยาว 1-60 ตัวอักษร");
    }
    if (editData.contact.length < 0) {
      return alert("กรุณากรอกข้อมูลการติดต่อ");
    }
    if (editData.about.length > 201) {
      return alert("About ต้องมีความยาวน้อยกว่า 200 ตัวอักษร");
    }
    const { error } = await supabase
      .from("Users")
      .update(editData)
      .eq("id", userData.id);
  
    if (error) {
      alert("Error updating profile: " + error.message);
    } else {
      alert("Profile updated successfully!");
    }
  };
  
  const handleVerify = async () => {
    const { data, error } = await supabase
      .from("Users")
      .select("id")
      .eq("idcard_num", verifyData.idcard_num)
      .eq("Fname", verifyData.Fname)
      .eq("date_of_birth", verifyData.date_of_birth)
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
    
    const newPassword = prompt("Enter your new password:");
    if (!newPassword) return alert("Password cannot be empty.");
    

    const passwordPattern = /(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}/;
    if (!passwordPattern.test(newPassword)) {
      return alert("รหัสผ่านต้องมีตัวอักษรและตัวเลขอย่างน้อย 6 ตัว");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10); 
    
    const { error } = await supabase
      .from("Users")
      .update({ password: hashedPassword })
      .eq("id", userData.id);
  
    if (error) {
      alert("Error updating password: " + error.message);
    } else {
      alert("Password updated successfully.");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container my-4 w-75">

      <div className="card shadow-sm p-4">
      <div className=" text-center">
        <h1 className="card-title custom-topic">Profile</h1>
        <p><strong>Username:</strong> {userData.username}</p>
        <p><strong>Email:</strong> {userData.email}</p>
        <p><strong>Created At:</strong> {new Date(userData.created_at).toLocaleDateString()}</p>
</div>
        <div className="mb-3">
          <label>Display Name</label>
          <input type="text" className="form-control" value={editData.acc_name} onChange={(e) => setEditData({ ...editData, acc_name: e.target.value })} />
        </div>

        <div className="mb-3">
          <label>Contact</label>
          <input type="text" className="form-control" value={editData.contact} onChange={(e) => setEditData({ ...editData, contact: e.target.value })} />
        </div>

        <div className="mb-3">
          <label>About</label>
          <textarea className="form-control" value={editData.about} onChange={(e) => setEditData({ ...editData, about: e.target.value })}></textarea>
        </div>
        <div className="d-flex justify-content-center mb-4">
        <button className="btn btn-dark-custom" onClick={handleUpdate}>Update Profile</button></div>
        
        <hr />

        <h3>Reset Password</h3>
        <div className="mb-3 mt-2">
          <label>ID Card</label>
          <input type="text" className="form-control" value={verifyData.idcard_num} onChange={(e) => setVerifyData({ ...verifyData, idcard_num: e.target.value })} />
        </div>
        <div className="mb-3">
          <label>ชื่อจริง (ไม่ต้องใส่นามสกุล)</label>
          <input type="text" className="form-control" value={verifyData.Fname} onChange={(e) => setVerifyData({ ...verifyData, Fname: e.target.value })} />
        </div>
        <div className="mb-3">
          <label>Birth Date</label>
          <input type="date" className="form-control" value={verifyData.date_of_birth} onChange={(e) => setVerifyData({ ...verifyData, date_of_birth: e.target.value })} />
        </div>

        <div className="d-flex justify-content-center mb-4">
        <button className="btn btn-warn-custom" onClick={handleVerify}>Verify Identity</button>
        {canReset && <button className="btn btn-red-custom ms-3" onClick={handleResetPassword}>Reset Password</button>}</div>
      </div>
    </div>
  );
}

export default EditPro;
