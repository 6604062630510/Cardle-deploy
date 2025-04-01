import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../database/client";
import { useNavigate } from "react-router-dom";

function TrackingSell() {
  const { id } = useParams();
  const [trackingData, setTrackingData] = useState<any>(null);
  const [partnerData, setPartnerData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deliveryComp, setDeliveryComp] = useState<string>("");
  const [trackingNum, setTrackingNum] = useState<string>(""); 
  const [showDeliveryInputs, setShowDeliveryInputs] = useState<boolean>(false); 


  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
  const navigate = useNavigate();
  useEffect(() => {
    if (!currentUser.id) {
      navigate("/signin"); 
      return;
    }
  
    const fetchTrackingData = async () => {
      try {
        const { data: post, error: postError } = await supabase
          .from("Posts-sell")
          .select(`
            title,
            statusDeliveryPoster,
            by_userid,
            status,
            dealed_userid,
            price,
            deliver_comp_poster,
            tracking_num_poster,
            by_user:by_userid(acc_name, username),
            dealed_user:dealed_userid(acc_name, username)
          `)
          .eq("id_post", id)
          .single();
        
        if (postError) throw postError;
        setTrackingData(post);

        if (currentUser.id !== post.by_userid && currentUser.id !== post.dealed_userid) {
          alert("คุณไม่มีสิทธิ์เข้าถึงข้อมูลการติดตามนี้");
          navigate("/");
          return;
        }
  
        if (currentUser.id === post.by_userid) {
          const { data: partner, error: partnerError } = await supabase
            .from("Users")
            .select("contact, username, acc_name")
            .eq("id", post.dealed_userid)
            .single();
          if (partnerError) throw partnerError;
          setPartnerData(partner);
        } else if (currentUser.id === post.dealed_userid) {
          const { data: partner, error: partnerError } = await supabase
            .from("Users")
            .select("contact, username, acc_name")
            .eq("id", post.by_userid)
            .single();
          if (partnerError) throw partnerError;
          setPartnerData(partner);
        }
      } catch (error) {
        console.error("Error fetching tracking data:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchTrackingData();
  }, [id, currentUser, navigate]);
  
  

  const getButtonColor = (status: string, step: string) => {
    if (status.toLowerCase() === step.toLowerCase()) {
      switch (status.toLowerCase()) {
        case "waiting":
          return "btn-warning"; // สีเหลืองสำหรับ Waiting
        case "packing":
          return "btn-info"; // สีฟ้าสำหรับ Packing
        case "delivered":
          return "btn-success"; // สีเขียวสำหรับ Delivered
        case "received":
          return "btn-primary"; // สีน้ำเงินสำหรับ Received
        default:
          return "btn-light"; // สีเทาในกรณีที่ไม่มีสถานะที่ตรงกับปุ่ม
      }
    }
    return "btn-light"; // สีเทาหากสถานะไม่ตรงกับปุ่ม
  };

  const handleUpdate = async () => {

    const confirmation = window.confirm("คุณแน่ใจหรือไม่ว่าต้องการอัปเดตสถานะและข้อมูล?");

    if (!confirmation) return;

    try {
      if (currentUser.id === trackingData.by_userid) {
        if (trackingData.statusDeliveryPoster === "waiting") {
          // อัปเดตสถานะเป็น "packing"
          await supabase
            .from("Posts-sell")
            .update({ statusDeliveryPoster: "packing" })
            .eq("id_post", id);
        } else if (trackingData.statusDeliveryPoster === "packing") {
          // สร้างช่องอินพุต delivery_comp_poster และ tracking_num_poster
          if (!deliveryComp || !trackingNum) {
            alert("กรุณากรอกข้อมูลบริษัทจัดส่งและหมายเลขติดตาม");
            return;
          }
          // บันทึกข้อมูลและอัปเดตสถานะ
          await supabase
            .from("Posts-sell")
            .update({
              statusDeliveryPoster: "delivered",
              deliver_comp_poster: deliveryComp,
              tracking_num_poster: trackingNum,
            })
            .eq("id_post", id);
          setShowDeliveryInputs(false); // ซ่อนช่องกรอกข้อมูลหลังจากอัปเดต
        } 
      } else if (currentUser.id === trackingData.dealed_userid) {
        if (trackingData.statusDeliveryPoster === "delivered") {
          // อัปเดตสถานะเป็น "received"
          await supabase
          .from("Posts-sell")
          .update({ statusDeliveryPoster: "received", status: "completed"})
          .eq("id_post", id);

          await supabase
          .from("MyShop")
          .update({ status: "completed" })
          .eq("id_post", id);
        }}
    } catch (error) {
      console.error("Error updating tracking status:", error);
    }
  };

  useEffect(() => {
    if (trackingData && trackingData.statusDeliveryPoster === "packing") {
      setShowDeliveryInputs(true);
    }

  }, [trackingData]);


  if (loading) return <p>Loading tracking details...</p>;

  return (
    <div className="container mt-5">
      <h1 className="mb-5 custom-topic text-center">Tracking Information</h1>

      {trackingData ? (
        <div className="card p-5 mb-5">
<h2 className="mb-4yyy text-center">{trackingData.title} : {trackingData.price} บาท</h2>
          {partnerData ? (
  <div className="text-center border p-3 rounded shadow-sm bg-light mb-4 col-md-6 mx-auto">
    <h5 className="mb-3">{partnerData.acc_name} (@{partnerData.username})'s Contact Information</h5>

    <p>{partnerData.contact}</p>
  </div>
) : (
  <p className="text-muted text-center">No dealed user for this post.</p>
)}


          {/* Step Progress Bar */}
          <div className="text-center mt-4">
  <p>
    {trackingData.by_user?.acc_name} (@{trackingData.by_user?.username})'s delivery status
  </p>
  <div className="d-flex justify-content-center align-items-center mb-5">
    <div className="d-flex align-items-center">
      {["Waiting", "Packing", "Delivered"].map((step, index) => (
        <React.Fragment key={`poster-${step}`}>
          <button
            className={`btn px-3 py-2 border-3 fw-bold text-dark ${getButtonColor(trackingData.statusDeliveryPoster, step)}`}
            style={{ borderColor: "black", color: "black" }}
            disabled
          >
            {step}
          </button>
          {index !== 2 && (
           <div className="mx-2" style={{ width: "40px", height: "2px", borderTop: "3px solid black" }}></div>

          )}
        </React.Fragment>
      ))}
    </div>
  </div>
</div>

<div className="text-center mt-4">
  <p>
    {trackingData.dealed_user?.acc_name} (@{trackingData.dealed_user?.username})'s delivery status
  </p>
  <div className="d-flex justify-content-center align-items-center mb-5">
    <div className="d-flex align-items-center">
      {["Received"].map((step, index) => (
        <React.Fragment key={`offer-${step}`}>
          <button
            className={`btn px-3 py-2 border-3 fw-bold text-dark ${getButtonColor(trackingData.statusDeliveryPoster, step)}`}
            style={{ borderColor: "black", color: "black" }}
            disabled
          >
            {step}
          </button>

        </React.Fragment>
      ))}
    </div>
  </div>
</div>

{showDeliveryInputs && (
  <>
    <div className="mb-3 d-flex justify-content-center">
      <input
        type="text"
        placeholder="Delivery Company (เช่น Flash)"
        className="form-control"
        style={{ width: '50%' }}
        value={deliveryComp}
        onChange={(e) => setDeliveryComp(e.target.value)}
      />
    </div>
    <div className="mb-3 d-flex justify-content-center">
      <input
        type="text"
        placeholder="Tracking Number"
        className="form-control"
        style={{ width: '50%' }}
        value={trackingNum}
        onChange={(e) => setTrackingNum(e.target.value)}
      />
    </div>
  </>
)}
{trackingData && trackingData.statusDeliveryPoster === "delivered" && (
  <div className="text-center mt-3 mb-4">
    <h5 className=" mb-3"><strong>{trackingData.by_user?.acc_name}'s</strong></h5>
    <p className=" mb-2"><strong>Delivery Company:</strong> {trackingData.deliver_comp_poster || "ข้อมูลบริษัทจัดส่งไม่พบ"}</p>
    <p><strong>Tracking Number:</strong> {trackingData.tracking_num_poster || "หมายเลขติดตามไม่พบ"}</p>
  </div>
)}


{(currentUser.id === trackingData.by_userid && trackingData.statusDeliveryPoster !== "delivered") ||
  (currentUser.id === trackingData.dealed_userid && trackingData.statusDeliveryPoster === "delivered") ? (
  <div className="d-flex justify-content-center mb-5 mt-3" style={{ width: '100%' }}>
    <button className="btn btn-dark" style={{ width: '20%' }} onClick={handleUpdate}>
      Update
    </button>
  </div>
) : null}




        </div>
      ) : (
        <p className="text-muted text-center">No tracking data available.</p>
      )}
    </div>
  );
}

export default TrackingSell;
