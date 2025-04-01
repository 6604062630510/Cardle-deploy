import { useEffect, useState } from "react";
import { useParams} from "react-router-dom";
import { supabase } from "../database/client";
import contactImg from "../assets/contact.png";
function ViewConfirm() {
  const { id } = useParams();
  const [buyers, setBuyers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);

  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");


  useEffect(() => {
    const fetchMyShop= async () => {
      setLoading(true);
      try {
        const { data: postSell, error: postError } = await supabase
          .from("Posts-sell")
          .select("by_userid")
          .eq("id_post", id)
          .single();

        if (postError) throw postError;

        if (postSell?.by_userid !== currentUser.id) {
          console.error("You are not authorized to view these offers.");
          setBuyers([]);
          return;
        }

        const { data: buyerData, error: buyerError } = await supabase
          .from("MyShop")
          .select("*, Users (acc_name, username, contact)")
          .eq("id_post", id)
          .order("created_at", { ascending: true });

        if (buyerError) throw buyerError;

        setBuyers(buyerData);
      } catch (error) {
        console.error("Error fetching offers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyShop();
  }, [id, currentUser.id]);


  const handleCloseModal = () => {
    setSelectedContact(null);
  };
  

  const handleContactClick = (conractText: string) => {
    setSelectedContact(conractText);
  };
  const handleChooseBuyer = async (buyerId: number) => {
    const confirmation = window.confirm("คุณแน่ใจหรือไม่ว่าจะเลือกผู้ใช้คนนี้?");
    if (!confirmation) return;
  

    const finalConfirmation = window.confirm(
      "เมื่อคุณเลือกผู้ใช้คนนี้แล้วคุณจะแก้ขไม่ได้ คุณแน่ใจไหม Are you sure? super sure?"
    );
    if (!finalConfirmation) return;
  
    setIsProcessing(true);
  
    try {
      await supabase
        .from("MyShop")
        .update({ status: "rejected" })
        .eq("id_post", id);
  

      const { data: chosenBuyers, error: buyerError } = await supabase
        .from("MyShop")
        .select("by_userid")
        .eq("id", buyerId)
        .single();
  
        if (buyerError) {
            console.error("Error fetching chosen buyer:", buyerError.message);
            throw buyerError;
          }
          
          if (!chosenBuyers) {
            console.error("No buyer found with the given ID.");
            return;
          }
  

      await supabase
        .from("MyShop")
        .update({ status: "dealed" })
        .eq("id", buyerId);
      await supabase
        .from("Posts-sell")
        .update({ status: "sold", statusDeliveryPoster:"waiting",statusDeliveryOffer:"waiting", dealed_userid: chosenBuyers.by_userid })
        .eq("id_post", id);

      const { data: updatedBuyers, error } = await supabase
        .from("MyShop")
        .select("*, Users (acc_name, username, contact)")
        .eq("id_post", id)
        .order("created_at", { ascending: true });
  
      if (error) {
        console.error("Error fetching updated offers:", error);
        return;
      }
  
      setBuyers(updatedBuyers || []);
    } catch (error) {
      console.error("Error updating buyer status:", error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  /*const handleResetBuyers = async () => {
    const confirmation = window.confirm("Are you sure you want to reset all?");
    if (!confirmation) return;

    setIsProcessing(true);

    try {

      await supabase
        .from("MyShop")
        .update({ status: "waiting" })
        .eq("id_post", id);


      await supabase
        .from("Posts-sell")
        .update({ status: "selling" })
        .eq("id_post", id);


      const { data: resetBuyers, error } = await supabase
        .from("MyShop")
        .select("*, Users (acc_name, username, contact)")
        .eq("id_post", id)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching reset buyers:", error);
        return;
      }

      setBuyers(resetBuyers || []);
    } catch (error) {
      console.error("Error resetting buyer status:", error);
    } finally {
      setIsProcessing(false);
    }
  };*/


 // const isPostDealed = buyers.every((buyer) => buyer.status === "waiting");

  if (loading) return <p>Loading...</p>;

  return (
    <div className="container mt-5">
      <div className="d-flex mb-5 justify-content-between align-items-center">
        <h1 className="custom-topic">The Buyers of this post</h1>
        {/* Only show Reset button if post is not dealt */}
        {/*!isPostDealed && (
          <button
            className="btn btn-danger mt-auto"
            onClick={handleResetBuyers}
            disabled={isProcessing}
          >
            Reset All
          </button>
        )*/}
      </div>

      <div className="list-group">
        <div className="d-flex flex-wrap justify-content-center">
          {buyers.length > 0 ? (
            <div className="d-flex flex-wrap justify-content-center">
              {buyers.map((buyer) => (
                <div
                  key={buyer.id}
                  className="card mb-3 p-3 position-relative m-3"
                  style={{ maxWidth: "45%" }}
                >
                  <div className="d-flex align-items-start">
                    <div
                      className="me-3"
                      style={{
                        minHeight: "100px",
                        width: "150px",
                        flexShrink: 0,
                      }}
                    >
                      {buyer.Users?.contact && (
                        <img
                          src={contactImg}
                          alt="Contact Image"
                          className="img-fluid rounded"
                          style={{
                            width: "100%",
                            objectFit: "cover",
                            cursor: "pointer",
                          }}
                          onClick={() => handleContactClick(buyer.Users?.contact)}
                        />
                      )}
                    </div>

                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title">

                      
                        <strong>{buyer.Users.acc_name.length > 30 ? buyer.Users.acc_name.slice(0, 27) + "..." : buyer.Users.acc_name} (@{buyer.Users?.username})</strong>
                      </h5>

                      <div className="mt-auto d-flex justify-content-end">
                        {buyer.status === "dealed" ? (
                          <button className="btn btn-success" disabled>
                            Chosen
                          </button>
                        ) : buyer.status !== "rejected" ? (
                          <button
                            className="btn btn-primary"
                            onClick={() => handleChooseBuyer(buyer.id)}
                            disabled={isProcessing}
                          >
                            Choose this buyer
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted">ยังไม่มีผู้ซื้อสำหรับโพสต์นี้</p>
          )}
      </div>

    </div>



{selectedContact && (
  <div className="modal fade show d-block" tabIndex={-1} role="dialog" style={{ background: "rgba(0,0,0,0.5)" }}>
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Contact</h5>
          <button type="button" className="btn-close" onClick={handleCloseModal}></button>
        </div>
        <div className="modal-body text-center about-text">
          {selectedContact}
        </div>
      </div>
    </div>
  </div>
)}

    </div>
  );
}

export default ViewConfirm;
