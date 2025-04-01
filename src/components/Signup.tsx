import React, { useState } from "react";
import { supabase } from "../database/client";
import bcrypt from "bcryptjs";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import imgSignUp from "../assets/signup.png";
import { Link } from "react-router-dom";
import { useNavigate} from 'react-router-dom';
function Signup() {
  const navigate = useNavigate();
  const [isOldEnough, setIsOldEnough] = useState(false);
  const [acceptPolicy, setAcceptPolicy] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
    accname: "",
    birthDate: "",
    idcardNum: "",
    idcardImage: null as File | null,
    Fname: "",
    lastname: "",
    contact: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  console.log(formData);
  console.log(loading); 

  function handleChange(event: React.ChangeEvent<HTMLInputElement| HTMLTextAreaElement>) {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [event.target.name]: event.target.value,
    }));
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    setFormData((prevFormData) => ({
      ...prevFormData,
      idcardImage: file,
    }));
  };

  const uploadImage = async (file: File) => {
    try {
      const filePath = `id_cards/${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage
        .from("idcard_pic")
        .upload(filePath, file);
        console.log(data); 
      if (error) throw error;
      return filePath;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const handleBirthDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const birthDate = new Date(event.target.value);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
  

    setIsOldEnough(age > 15 || (age === 15 && today >= new Date(birthDate.setFullYear(today.getFullYear()))));
    
    setFormData((prevFormData) => ({
      ...prevFormData,
      birthDate: event.target.value,
    }));
  };
  
  const validateForm = () => {
    const { idcardNum, username, email, password, accname, birthDate, idcardImage, contact, Fname, lastname } = formData;
  
    if (!accname.trim() || !idcardNum.trim() || !contact.trim() || !email.trim() || !password.trim() || !birthDate || !idcardImage || !Fname.trim() || !lastname.trim()) {
      return "กรุณากรอกข้อมูลให้ครบถ้วน";
    }
  
    // ตรวจสอบ username (6-20 ตัวอักษร, ห้ามมีช่องว่าง)
    if (username.length < 5 || username.length > 21 || /[^a-zA-Z0-9]/.test(username) || /\s/.test(username)) {
      return "Username ต้องมีตัวอักษรภาษาอังกฤษและตัวเลขเท่านั้น ยาว 6-20 ตัว และห้ามมีช่องว่าว";
    }
  
    // ตรวจสอบ accname (3-60 ตัวอักษร)
    if (accname.length < 2 || accname.length > 61) {
      return "ชื่อแอคเคาน์ต้องมีความยาว 3-50 ตัวอักษร";
    }
  
    // ตรวจสอบอีเมล ตรวจ @
    if (!/\S+@\S+\.\S+/.test(email)) {
      return "กรุณากรอกอีเมลที่ถูกต้อง";
    }
  
    // ตรวจสอบรหัสผ่าน (อย่างน้อย 6 ตัวอักษร และมีทั้งตัวอักษร+ตัวเลข)
    if (!/(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}/.test(password)) {
      return "รหัสผ่านต้องมีตัวอักษรและตัวเลขอย่างน้อย 6 ตัว";
    }

  
    // ตรวจสอบชื่อ-นามสกุล (ต้องเป็นภาษาไทย)
    if (!/^[\u0E00-\u0E7F]+$/.test(Fname)) {
      return "กรุณากรอกชื่อภาษาไทย";
    }
    if (!/^[\u0E00-\u0E7F]+$/.test(lastname)) {
      return "กรุณากรอกนามสกุลภาษาไทย";
    }
  
    // ตรวจสอบเลขบัตรประชาชน (13 หลัก ตัวเลขเท่านั้น)
    if (!/^\d{13}$/.test(idcardNum)) {
      return "เลขบัตรประชาชนต้องเป็นตัวเลข 13 หลัก";
    }
    if (!isOldEnough) {
      return "คุณต้องมีอายุอย่างน้อย 15 ปี";
    }
  
    if (!acceptPolicy) {
      return "กรุณายอมรับนโยบายความเป็นส่วนตัว";
    }
  
  
    return null;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      setLoading(true);

      // ค้นหาผู้ใช้ที่มีข้อมูลซ้ำ
      const { data: existingUsers, error: fetchError } = await supabase
        .from("Users")
        .select("id, username, idcard_num, email, status")
        .or(`username.eq.${formData.username},idcard_num.eq.${formData.idcardNum},email.eq.${formData.email}`);

      if (fetchError) throw fetchError;

      if (existingUsers.length > 0) {
        let errorMessage = "";

// ตรวจสอบว่ามี record ที่มีข้อมูลทั้งสามตรงกันหรือไม่
const fullMatchUser = existingUsers.find(user => 
    user.username === formData.username &&
    user.idcard_num === formData.idcardNum &&
    user.email === formData.email
);

if (fullMatchUser) {
  // ถ้าข้อมูลทั้งสามตรงกัน ให้แสดงข้อความรวมตามสถานะ
  if (fullMatchUser.status === "approved") errorMessage = "บัญชีนี้ถูกใช้งานแล้ว";
  else if (fullMatchUser.status === "waiting") errorMessage = "บัญชีนี้กำลังรอการพิจารณา";
  else if (fullMatchUser.status === "banned") errorMessage = "บัญชีนี้ถูกแบนอยู่";
} else {
  // ถ้าไม่มี record ที่ข้อมูลทั้งสามตรงกัน ให้เช็คทีละฟิลด์
  existingUsers.forEach((user) => {
    if (user.username === formData.username) {
      if (user.status === "approved") errorMessage += "ยูสเซอร์เนมนี้ถูกใช้งานแล้ว\n";
      else if (user.status === "waiting") errorMessage += "ยูสเซอร์เนมนี้กำลังรอการพิจารณา\n";
      else if (user.status === "banned") errorMessage += "ยูสเซอร์เนมนี้ถูกแบนอยู่\n";
    }
    if (user.idcard_num === formData.idcardNum) {
      if (user.status === "approved") errorMessage += "เลขบัตรประชาชนนี้ถูกใช้งานแล้ว\n";
      else if (user.status === "waiting") errorMessage += "เลขบัตรประชาชนนี้กำลังรอการพิจารณา\n";
      else if (user.status === "banned") errorMessage += "เลขบัตรประชาชนนี้ถูกแบนอยู่\n";
    }
    if (user.email === formData.email) {
      if (user.status === "approved") errorMessage += "อีเมลนี้ถูกใช้งานแล้ว\n";
      else if (user.status === "waiting") errorMessage += "อีเมลนี้กำลังรอการพิจารณา\n";
      else if (user.status === "banned") errorMessage += "อีเมลนี้ถูกแบนอยู่\n";
    }
  });
}


        // กรณีที่สถานะเป็น rejected ให้เขียนทับข้อมูลเดิม
        const rejectedUser = existingUsers.find(user => user.status === "rejected");
        if (rejectedUser) {
          const filePath = formData.idcardImage ? await uploadImage(formData.idcardImage) : "";
          const hashedPassword = await bcrypt.hash(formData.password, 10);

          const { error: updateError } = await supabase
            .from("Users")
            .update({
              idcard_num: formData.idcardNum,
              email: formData.email,
              username: formData.username,
              acc_name: formData.accname,
              date_of_birth: formData.birthDate,
              idcard_pic: filePath,
              password: hashedPassword,
              Fname: formData.Fname,
              lastname: formData.lastname,
              contact: formData.contact,
              role: "user",
              status: "waiting",
            })
            .eq("id", rejectedUser.id);

          if (updateError) throw updateError;
          toast.success("ส่งคำขอสมัครสมาชิกใหม่สำเร็จ! รอการอนุมัติจากแอดมิน");
          navigate("/signin")
          return;
        }

        toast.error(errorMessage.trim());
        return;
      }

      // ถ้าไม่มีข้อมูลซ้ำ → สมัครใหม่ได้
      const filePath = formData.idcardImage ? await uploadImage(formData.idcardImage) : "";
      const hashedPassword = await bcrypt.hash(formData.password, 10);

      const { error } = await supabase.from("Users").insert([
        {
          idcard_num: formData.idcardNum,
          email: formData.email,
          username: formData.username,
          acc_name: formData.accname,
          date_of_birth: formData.birthDate,
          idcard_pic: filePath,
          password: hashedPassword,
          Fname: formData.Fname,
          lastname: formData.lastname,
          contact: formData.contact,
          role: "user",
          status: "waiting",
        },
      ]);

      if (error) throw error;
      toast.success("สมัครสมาชิกสำเร็จ! รอการอนุมัติจากแอดมิน");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <ToastContainer position="top-center" toastStyle={{ width: '500px' }} />
      <div className="row justify-content-center">
        <div className="col-md-6">
          <img
                src={imgSignUp}
                width="60%"
                height="auto"
                className="d-block mx-auto"
                style={{ marginBottom: "4rem" }}
                alt=""
            />
          <form onSubmit={handleSubmit} className="p-4 border rounded-3 shadow-sm bg-white mb-5">
            {/* Account Name */}
            <div className="mb-3">
              <input
                className="form-control"
                placeholder="Account name เช่น มัมหมีน้องเจโน่"
                name="accname"
                onChange={handleChange}
              />
            </div>
            {/* Username */}
            <div className="mb-3">
              <input
                className="form-control"
                placeholder="Username"
                name="username"
                onChange={handleChange}
              />
            </div>
            {/* Email */}
            <div className="mb-3">
              <input
                className="form-control"
                type="email"
                placeholder="Email"
                name="email"
                onChange={handleChange}
              />
            </div>
            {/* Password + Toggle Button */}
            <div className="mb-3">
              <div className="input-group">
                <input
                  className="form-control"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  name="password"
                  onChange={handleChange}
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
            {/* ID Card Number */}
            <div className="mb-3">
              <input
                className="form-control"
                placeholder="ID card number"
                name="idcardNum"
                onChange={handleChange}
              />
            </div>
            {/* Name & Lastname */}
            <div className="row">
              <div className="col-md-6 mb-3">
                <input
                  className="form-control"
                  placeholder="ชื่อตามบัตรประชาชน"
                  name="Fname"
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-6 mb-3">
                <input
                  className="form-control"
                  placeholder="นามสกุลตามบัตรประชาชน"
                  name="lastname"
                  onChange={handleChange}
                />
              </div>
            </div>
            {/* Birthdate */}
            <div className="mb-3">
              <label className="form-label">Date of Birth</label>
              <input
                type="date"
                name="birthDate"
                onChange={handleBirthDateChange}
                className="form-control"
              />
              {!isOldEnough && formData.birthDate && (
                <div className="text-danger mt-1">คุณต้องมีอายุอย่างน้อย 15 ปี</div>
              )}
            </div>

            {/* Contact */}
            <div className="mb-3">
              <label className="form-label">Contact</label>
              <textarea className="form-control" name="contact" placeholder="เช่น Twitter : @123asd, Facebook : สมชายเองนะ"
              onChange={handleChange} required />
            </div>

            {/* Upload ID Card Image */}
            <div className="mb-3">
              <label htmlFor="idcardImage" className="form-label fw-bold">
                Upload ID Card Image
              </label>
              <div className="input-group">
                <input
                  type="file"
                  id="idcardImage"
                  name="idcardImage"
                  accept="image/*"
                  className="form-control"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            {/* Preview Image */}
            {formData.idcardImage && (
              <div className="mb-3 text-center">
                <h5>Preview:</h5>
                <img
                  src={URL.createObjectURL(formData.idcardImage)}
                  alt="Preview"
                  width="200"
                  className="rounded border"
                />
              </div>
            )}

            <div className="form-check mt-3">
              <input
                type="checkbox"
                id="acceptPolicy"
                className="form-check-input"
                checked={acceptPolicy}
                onChange={() => setAcceptPolicy(!acceptPolicy)}
              />
              <label className="form-check-label" htmlFor="acceptPolicy">
                ฉันยอมรับ <Link to="/privacy-policy" target="_blank">นโยบายความเป็นส่วนตัว</Link>
              </label>
            </div>

            <div className="d-flex justify-content-center mt-3">
              <button className="btn btn-dark-custom" type="submit">
                Create Account
              </button>
            </div>
          </form>
          <div className="d-flex justify-content-center align-items-center"  style={{ marginBottom: "10rem" }}>
            <span>Already have an account? </span>
            <Link to="/signin" className="text-dark fs-5 ms-2">Sign in here!</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
