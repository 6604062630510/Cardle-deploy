import { useEffect, useState } from "react";
import { useParams} from "react-router-dom";
import { supabase } from "../database/client";

function ViewOffer() {
  const { id } = useParams();
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");


  useEffect(() => {
    const fetchOffers = async () => {
      setLoading(true);
      try {
        const { data: postTrade, error: postError } = await supabase
          .from("Posts-trade")
          .select("by_userid")
          .eq("id_post", id)
          .single();

        if (postError) throw postError;

        if (postTrade?.by_userid !== currentUser.id) {
          console.error("You are not authorized to view these offers.");
          setOffers([]);
          return;
        }

        // Use JOIN to fetch data from Users
        const { data: offerData, error: offerError } = await supabase
          .from("Offer")
          .select("*, Users (acc_name, username)")
          .eq("id_post", id)
          .order("created_at", { ascending: true });

        if (offerError) throw offerError;

        setOffers(offerData);
      } catch (error) {
        console.error("Error fetching offers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, [id, currentUser.id]);

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };
  
  const handleCloseModal = () => {
    setSelectedImage(null);
  };
  

  const handleChooseOffer = async (offerId: number) => {
    const confirmation = window.confirm("Are you sure you want to choose this offer?");
    if (!confirmation) return;
  

    const finalConfirmation = window.confirm(
      "You can't change your mind once you've chosen this offer. Are you sure?"
    );
    if (!finalConfirmation) return;
  
    setIsProcessing(true);
  
    try {

      await supabase
        .from("Offer")
        .update({ status: "rejected" })
        .eq("id_post", id);
  
  
      const { data: chosenOffer, error: offerError } = await supabase
        .from("Offer")
        .select("by_userid")
        .eq("id_offer", offerId)
        .single();
  
      if (offerError) throw offerError;
  

      await supabase
        .from("Offer")
        .update({ status: "dealed" })
        .eq("id_offer", offerId);

      await supabase
        .from("Posts-trade")
        .update({ status: "dealed", statusDeliveryPoster:"waiting",statusDeliveryOffer:"waiting", dealed_userid: chosenOffer.by_userid })
        .eq("id_post", id);
  

      const { data: updatedOffers, error } = await supabase
        .from("Offer")
        .select("*, Users (acc_name, username)")
        .eq("id_post", id)
        .order("created_at", { ascending: true });
  
      if (error) {
        console.error("Error fetching updated offers:", error);
        return;
      }
  
      setOffers(updatedOffers || []);
    } catch (error) {
      console.error("Error updating offer status:", error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleResetOffers = async () => {
    const confirmation = window.confirm("Are you sure you want to reset all offers?");
    if (!confirmation) return;

    setIsProcessing(true);

    try {

      await supabase
        .from("Offer")
        .update({ status: "offered" })
        .eq("id_post", id);


      await supabase
        .from("Posts-trade")
        .update({ status: "posted" })
        .eq("id_post", id);

      const { data: resetOffers, error } = await supabase
        .from("Offer")
        .select("*, Users (acc_name, username)")
        .eq("id_post", id)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching reset offers:", error);
        return;
      }

      setOffers(resetOffers || []);
    } catch (error) {
      console.error("Error resetting offer status:", error);
    } finally {
      setIsProcessing(false);
    }
  };


  const isPostDealed = offers.every((offer) => offer.status === "waiting");

  if (loading) return <p>Loading...</p>;

  return (
    <div className="container mt-5">
      <div className="d-flex mb-5 justify-content-between align-items-center">
        <h1 className="custom-topic">The offers of this post</h1>

        {isPostDealed && (
          <button
            className="btn btn-danger mt-auto"
            onClick={handleResetOffers}
            disabled={isProcessing}
          >
            Reset All Offers
          </button>
        )}
      </div>

      {offers.length > 0 ? (
        <div className="list-group">
          {offers.map((offer) => (
            <div key={offer.id_offer} className="card mb-3 p-2 position-relative">
              <div className="d-flex">
                <div
                  className="me-3"
                  style={{
                    minHeight: "150px",
                    width: "300px",
                    flexShrink: 0,
                  }}
                >
                  {offer.pic && (
                    <img
                    src={offer.pic}
                    alt="Offer Image"
                    className="img-fluid rounded"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      cursor: "pointer",
                    }}
                    onClick={() => handleImageClick(offer.pic)}
                  />
                  
                  )}
                </div>

                <div
                  className="flex-grow-1 card-body"
                  style={{
                    overflow: "hidden",
                    whiteSpace: "pre-wrap",
                    wordWrap: "break-word",
                  }}
                >
                  <h5 className="card-title">{offer.title}</h5>
                  <p className="card-text">{offer.description}</p>
                  <p>
                    <strong>by </strong> {offer.Users?.acc_name} (@{offer.Users?.username})
                  </p>
                  <p>
                    <small>Offer at </small> {new Date(offer.created_at).toLocaleString()}
                  </p>
                  <div
                    className="d-flex justify-content-end position-absolute bottom-0 end-0 mb-3 me-3"
                    style={{
                      zIndex: 10,
                    }}
                  >
                    {offer.status === "dealed" ? (
                      <button className="btn btn-success" disabled>
                        Chosen
                      </button>
                    ) : offer.status !== "rejected" ? (
                      <button
                        className="btn btn-primary"
                        onClick={() => handleChooseOffer(offer.id_offer)}
                        disabled={isProcessing}
                      >
                        Choose this offer
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No offers available for this post.</p>
      )}

{selectedImage && (
  <div className="modal fade show d-block" tabIndex={-1} role="dialog" style={{ background: "rgba(0,0,0,0.5)" }}>
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Offer Image</h5>
          <button type="button" className="btn-close" onClick={handleCloseModal}></button>
        </div>
        <div className="modal-body text-center">
          <img src={selectedImage} alt="Selected Offer" className="img-fluid rounded" />
        </div>
      </div>
    </div>
  </div>
)}

    </div>
  );
}

export default ViewOffer;
