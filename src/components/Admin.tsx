import { useEffect, useState } from "react";
import { supabase } from "../database/client";

import { useNavigate } from "react-router-dom";

function Admin() {
  //import { toast } from "react-toastify";
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("waiting");
  const [roleFilter, setRoleFilter] = useState<string>("user");
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");

  const navigate = useNavigate();

  const getSignedUrl = async (filePath: string) => {
    try {

      const { data, error } = await supabase
        .storage
        .from("idcard_pic")
        .createSignedUrl(filePath, 60 * 5); // URL valid for 5 minutes
  
      if (error) throw error;
      return data.signedUrl;
    } catch (error) {
      console.error("Error generating signed URL:", error);
      return null;
    }
  };
  
  useEffect(() => {
    if (!((currentUser.role === "admin") &&  (currentUser.status === "approved"))){
 
      navigate("/signin"); 
    }
    const fetchUsers = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("Users")
        .select("*")
        .order("created_at", { ascending: true});

      if (error) {
        setError(error.message);
      } else {
        // ดึง Signed URL สำหรับรูปภาพ
        const updatedUsers = await Promise.all(
          (data || []).map(async (user: any) => {
            const signedUrl = await getSignedUrl(user.idcard_pic);

            return { ...user, idcard_pic: signedUrl }; // แทนที่ path ด้วย Signed URL
          })
        );
        setUsers(updatedUsers);
      }
      setLoading(false);
    };

    fetchUsers();
  }, []);

  const approveUser = async (id: string, email: string) => {
    console.log(email); 
    try {
      const { error } = await supabase
        .from("Users")
        .update({ status: "approved" })
        .eq("id", id);

      if (error) throw error;

      setUsers(
        users.map((user) =>
          user.id === id ? { ...user, status: "approved" } : user
        )
      );
    } catch (error: any) {
      setError(error.message);
    }
  };

  const rejecteUser = async (id: string) => {
    try {
      const { error } = await supabase
        .from("Users")
        .update({ status: "rejected" })
        .eq("id", id);

      if (error) throw error;

      setUsers(
        users.map((user) =>
          user.id === id ? { ...user, status: "rejected" } : user
        )
      );
    } catch (error: any) {
      setError(error.message);
    }
  };

  // ฟังก์ชันแบนผู้ใช้
  const banUser = async (id: string) => {
    try {
      const { error } = await supabase
        .from("Users")
        .update({ status: "banned" })
        .eq("id", id);

      if (error) throw error;

      // อัปเดต UI
      setUsers(
        users.map((user) =>
          user.id === id ? { ...user, status: "banned" } : user
        )
      );
    } catch (error: any) {
      setError(error.message);
    }
  };
  
  const unbanUser = async (id: string) => {
    try {
      const { error } = await supabase
        .from("Users")
        .update({ status: "approved" })
        .eq("id", id);

      if (error) throw error;

      // อัปเดต UI
      setUsers(
        users.map((user) =>
          user.id === id ? { ...user, status: "approved" } : user
        )
      );
    } catch (error: any) {
      setError(error.message);
    }
  };

  const addToAdmin = async (id: string) => {
    const confirmation = window.confirm("คุณแน่ใจหรือไม่ว่าจะให้สถานะแอดมินกับผู้ใช้คนนี้?");
    if (!confirmation) return;
  

    const finalConfirmation = window.confirm(
      "คุณแน่ใจจริง ๆ ใช่ไหม ถ้าแน่ใจครั้งนี้ให้กดยกเลิก"
    );
    if (finalConfirmation) return;

    const superfinalConfirmation = window.confirm(
      "ถ้าคุณแน่ใจจริง ๆ กดยืนยันเป็นครั้งสุดท้าย"
    );
    if (!superfinalConfirmation) return;
    try {
      const { error } = await supabase
        .from("Users")
        .update({ role: "admin" })
        .eq("id", id);

      if (error) throw error;

      setUsers(
        users.map((user) =>
          user.id === id ? { ...user, role: "admin" } : user
        )
      );
    } catch (error: any) {
      setError(error.message);
    }
  };
  const deleteAdmin = async (id: string) => {
    const confirmation = window.confirm("คุณแน่ใจหรือไม่ว่าจะยกเลิกสถานะแอดมินของผู้ใช้คนนี้?");
    if (!confirmation) return;
  

    const finalConfirmation = window.confirm(
      "คุณแน่ใจจริง ๆ ใช่ไหม ถ้าแน่ใจครั้งนี้ให้กดยกเลิก"
    );
    if (finalConfirmation) return;

    const superfinalConfirmation = window.confirm(
      "ถ้าคุณแน่ใจจริง ๆ กดยืนยันเป็นครั้งสุดท้าย"
    );
    if (!superfinalConfirmation) return;
    try {
      const { error } = await supabase
        .from("Users")
        .update({ role: "user" })
        .eq("id", id);

      if (error) throw error;

      setUsers(
        users.map((user) =>
          user.id === id ? { ...user, role: "user" } : user
        )
      );
    } catch (error: any) {
      setError(error.message);
    }
  };

  // ฟังก์ชันลบผู้ใช้
 /* const deleteUser = async (id: string) => {
    try {
      // ตรวจสอบว่าเป็นแอดมินหรือไม่
      const user = users.find((u) => u.id === id);
      if (user && user.role === "admin") {
        toast.error("ไม่สามารถลบแอดมิน");
        return;
      }

      const { error } = await supabase
        .from("Users")
        .delete()
        .eq("id", id);

      if (error) throw error;

      // อัปเดต UI
      setUsers(users.filter((user) => user.id !== id));
    } catch (error: any) {
      setError(error.message);
    }
  };*/



  const ImageModal = ({
    imageUrl,
    onClose,
  }: {
    imageUrl: string | null;
    onClose: () => void;
  }) => {
    if (!imageUrl) return null;

    return (
        
      <div className=" inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="relative max-w-2xl w-full bg-white p-4 rounded">

          <img
            src={imageUrl}
            alt="ID Card"
            className="w-100 h-auto object-contain"
          />
          <div className="d-flex d-flex justify-content-end mt-2">
          <button
            onClick={onClose}
            className="btn bg-danger text-white rounded-circle "
          >
            ✕
          </button></div>
        </div>
      </div>
    );
  };


  const filterUsers = (users: any[]) => {
    let filteredUsers = users;
    if (statusFilter !== "all") {
      filteredUsers = filteredUsers.filter(
        (user) => user.status === statusFilter
      );
    }
    if (roleFilter !== "all") {
      filteredUsers = filteredUsers.filter(
        (user) => user.role === roleFilter
      );
    }
    return filteredUsers;
  };

  return (
    <div className="container py-6">
      <h1 className="mb-4 custom-topic">Manage Users</h1>
      {error && <p className="text-danger">{error}</p>}
      <ImageModal
        imageUrl={selectedImage}
        onClose={() => setSelectedImage(null)}
      />

      {/* Dropdown สำหรับกรองผู้ใช้ */}
      <div className="row mb-3">
        <div className="col-md-6 mb-2">
          <label className="form-label">สถานะ</label>
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="waiting">Waiting</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="banned">Banned</option>
          </select>
        </div>
        <div className="col-md-6 mb-2">
          <label className="form-label">ประเภทผู้ใช้</label>
          <select
            className="form-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">ทั้งหมด</option>
            <option value="user">ผู้ใช้ทั่วไป</option>
            <option value="admin">แอดมิน</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="table table-bordered table-striped">
          <thead>
            <tr>
              <th>Username</th>
              <th>Name</th>
              <th>Lastname</th>
              <th>ID card number</th>
              <th>ID card photo</th>
              <th>Day of birth</th>
              <th>Status</th>
              <th>Manage</th>
              
            </tr>
          </thead>
          <tbody>
            {filterUsers(users).map((user) => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>{user.Fname}</td>
                <td>{user.lastname}</td>
                <td>{user.idcard_num}</td>
                <td>
                  <button
                    onClick={() => setSelectedImage(user.idcard_pic)}
                    className="btn btn-admin btn-sm"
                  >
                    View ID card
                  </button>
                </td>
                <td>{user.date_of_birth}</td>
                <td>
                  <span
                    className={`badge ${
                      user.status === "approved"
                        ? "bg-success text-white"
                        : user.status === "banned"
                        ? "bg-danger text-white"
                        : user.status === "rejected"
                        ? "bg-secondary text-white"
                        : "bg-warning text-dark"
                    }`}
                  >
                    {user.status === "approved"
                      ? "approved"
                      : user.status === "banned"
                      ? "banned"
                      : user.status === "rejected"
                      ? "rejected"
                      : "waiting"}
                  </span>
                </td>
                <td>
                  {user.status === "waiting" && (
                    <button
                      onClick={() => approveUser(user.id, user.email)}
                      className="btn btn-outline-success btn-sm m-1"
                    >
                      approve
                    </button>
                  )}
                  {user.status === "waiting" && (
                    <button
                      onClick={() => rejecteUser(user.id)}
                      className="btn btn-outline-danger btn-sm m-1"
                    >
                      reject
                    </button>
                  )}
                  {user.status === "approved" && (
                  <>
                    <button
                      onClick={() => banUser(user.id)}
                      className="btn btn-outline-danger btn-sm m-1"
                    >
                      Ban
                    </button>

                    {user.role === "user" ? (

                    <button
                      onClick={() => addToAdmin(user.id)}
                      className="btn btn-outline-dark ms-4 btn-sm m-1"
                    >
                      Add to Admin
                    </button>

                    ) : (<button
                      onClick={() => deleteAdmin(user.id)}
                      className="btn btn-outline-dark ms-4 btn-sm m-1"
                    >
                      Cancel Admin
                      
                    </button>)}

                    
                  </>
                )}

                  {user.status === "banned" && (

                    <button
                      onClick={() => unbanUser(user.id)}
                      className="btn btn-outline-success btn-sm m-1"
                    >
                      unban
                    </button>

                  )}
                  
                  {/*<button
                    onClick={() => deleteUser(user.id)}
                    className="btn btn-secondary btn-sm m-1"
                  >
                    delete
                  </button>*/}
                </td>
                
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>

  );
}

export default Admin;
