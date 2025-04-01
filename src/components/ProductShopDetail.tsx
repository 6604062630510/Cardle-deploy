import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../database/client';
import { useNavigate } from "react-router-dom"; 
import ShopComments from './ShopComments';
import fullfav from "../assets/fill-fav-icon.png";
import { Link } from 'react-router-dom';
import nofav from "../assets/emt-fav-icon.png";

function ProductShopDetail() {
  const { id } = useParams(); // ดึง id จาก URL
  const [product, setProduct] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false); // เปิด/ปิด modal
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [isConfirm, setIsConfirm] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("currentUser");
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    } 
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from('Posts-sell')
        .select(
            `id_post,
            created_at,
            title,
            type,
            flaw,
            hashtag,
            description,
            price,
            post_img,
            status,
            has_flaw,

            by_user:by_userid(acc_name, username, contact, status),
            dealed_user:dealed_userid(acc_name, username)`
        )
        .eq('id_post', id)
        .single();

      if (error) {
        console.error("Error fetching posts:", error.message);
        setError(`Failed to fetch posts: ${error.message}`);
      } else {
        setProduct(data);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id, navigate]);

  const openModal = (image: string) => {
    setCurrentImage(image);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentImage(null);
  };

  if (error) {
    console.log(setIsSubmitting)
    console.log(isConfirm)
    return <div>{error}</div>;
  }

const toggleFavorite = async (id_post: number) => {
    if (!currentUser) {
      alert("กรุณาเข้าสู่ระบบก่อนเพิ่มรายการโปรด");
      return;
    }
    let favPosts: number[] = currentUser.fav_post_sell || [];
    let action = "";
    if (favPosts.includes(id_post)) {

      favPosts = favPosts.filter(item => item !== id_post);
      action = "ลบออก";
    } else {
      favPosts.push(id_post);
      action = "เพิ่ม";
    }
    const { error } = await supabase
      .from('Users')
      .update({ fav_post_sell: favPosts })
      .eq('id', currentUser.id);

    if (error) {
      console.error("Error updating favorites:", error.message);
      alert("เกิดข้อผิดพลาดในการอัปเดตรายการโปรด");
    } else {
      alert(`${action}สินค้าในรายการโปรดเรียบร้อยแล้ว`);
      const updatedUser = { ...currentUser, fav_post_sell: favPosts };
      setCurrentUser(updatedUser);
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    }
  };

  const isFavorite = (id_post: number) => {
    if (!currentUser) return false;
    const favPosts: number[] = currentUser.fav_post_sell || [];
    return favPosts.includes(id_post);
  };
  console.log(isFavorite); 
  const openBuyModal = () => {
    if (!currentUser) {
      navigate("/signin", { state: { from: `/shop/product/${id}` } }); // ส่งสถานะของหน้าเดิมไปหน้า signin
      return;
    }
    setIsBuyModalOpen(true);
  };
  const handleConfirmSubmit = async () => {
    try {
      console.log("Current User:", currentUser);
      console.log("Post ID:", id);
  
      if (!currentUser || !id) {
        alert("ข้อมูลผู้ใช้หรือโพสต์ไม่ครบถ้วน");
        return;
      }
  
      const { error: postError } = await supabase
        .from("Posts-sell")
        .update({ status: "selling"})
        .eq("id_post", id);
      
      if (postError) {
        console.error("Error updating Posts-sell:", postError.message);
        throw postError;
      }
  
      console.log("Updated Posts-sell successfully");
  
      const { error: shopError } = await supabase
        .from("MyShop")
        .insert([
          {
            by_userid: currentUser.id,
            created_at: new Date().toISOString(),
            id_post: id,
          },
        ]);
  
      if (shopError) {
        console.error("Error inserting into MyShop:", shopError.message);
        throw shopError;
      }
  
      console.log("Inserted into MyShop successfully");
  
      setIsConfirm(true);
      setIsBuyModalOpen(false);
      navigate("/mydeal");
  
    } catch (error: any) {
      console.error("Error:", error.message);
      alert("An error occurred while updating the sell post. Please try again.");
    }
  };
  

  const closeBuyModal = () => {
    setIsBuyModalOpen(false);

  };


  return (
    <div className="container mt-5 bg-trade">
      {product ? (
        <div>
<div className="d-flex gap-3 align-items-stretch">
<div
  className="image-container d-flex flex-column"
  style={{ width: '50%' }}
>

  {product.post_img.length > 0 && (
    <div
      style={{
        flex: 1,
        overflow: 'hidden',
      }}
    >
      <img
        src={product.post_img[0]}
        alt={`Product Image 1`}
        className="img-fluid rounded"
        style={{
          width: '100%',
          height: '500px', 
          objectFit: 'cover',
          cursor: 'pointer',
          border: '2px solid #ddd', 
          borderRadius: '8px',     
        }}
        onClick={() => openModal(product.post_img[0])}
      />
    </div>
  )}
</div>

  <div className="product-info" style={{ width: '50%' }}>
    <h2 style={{ wordWrap: 'break-word' }}>{product.title}</h2>
    <div className="d-flex flex-wrap gap-2 mt-4">
      {product.hashtag?.map((hashtag: string, index: number) => (
        <span key={index} className="badge custom-badge ">
          #{hashtag}
        </span>
      ))}
    </div>
    <div className="p-3 mt-4 mb-4 border border-dark bg-white" style={{ wordWrap: 'break-word' }}>
      <h5 className="custom-line-height about-text">{product.description}</h5>
      {product.has_flaw && (
        <div>
          <h4 className="text-danger">* ตำหนิ *</h4>
          <h5 className="custom-line-height about-text">{product.flaw}</h5>
        </div>
      )}

        <div>
          <h4 className="text-dark mt-4">Contact</h4>
          <h5 className="custom-line-height about-text">{product.by_user.contact}</h5>
        </div>
      
      
    </div>
    
    <h4 style={{ marginRight: '10px' }}>Price: {product.price}</h4>
    <div className="mt-4 d-flex flex-wrap gap-2">
    <div>
    <Link to={`/profile/${product.by_user.username}`} className="no-link-style">
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <h5 style={{ marginRight: '10px' }}>Posted by: {product.by_user.acc_name}</h5>
    <small className="text-muted">@{product.by_user.username}</small>
  </div>
  </Link>
  <p>Created at: {new Date(product.created_at).toLocaleString()}</p>
</div>


    <div className="ms-auto">

    <button 
      className="btn btn-fav btn-lg me-3"
      onClick={(e) => {
        e.preventDefault();
        toggleFavorite(product.id_post);
      }}

    >
      {currentUser && currentUser.fav_post_sell && currentUser.fav_post_sell.includes(product.id_post)
        ? <img src={fullfav} alt="Remove Fav" style={{ width: '30px' }} />
        : <img src={nofav} alt="Add Fav" style={{ width: '30px' }} />}
    </button>
    {product.by_user?.status === "approved" && product.status === "selling" ? (
  <button 
    className="btn btn-detail" 
    onClick={openBuyModal} 
    style={{ fontSize: '30px', padding: '10px 50px', letterSpacing: '2px' }}
  >
    BUY
  </button>
) : product.by_user?.status === "banned" ? (
  <button 
    className="btn btn-danger" 
    disabled
    style={{ fontSize: '30px', padding: '10px 50px', letterSpacing: '3px' }}
  >
    เจ้าของโพสต์ถูกแบน
  </button>
) : null}

    
    </div>
    </div>
  </div>
</div>

<div className="mt-5">


              {product.post_img && product.post_img.length > 0 && (
                <div className="d-flex justify-content-center mt-5 mb-5" style={{ gap: '150px' }}>
                  {product.post_img.slice(1, 3).map((image: string, index: number) => (
                    <div
                      key={index}
                      className="image-container"
                      style={{
                        width: '500px', 
                        height: '350px',
                        overflow: 'hidden',
                        border: '2px solid #ddd',
                        borderRadius: '8px',
                        marginBottom: '10px',
                      }}
                    >
                      <img
                        src={image}
                        alt={`Wanted Image ${index + 1}`}
                        className="img-fluid rounded"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          cursor: 'pointer',
                        }}
                        onClick={() => openModal(image)}
                      />
                    </div>
                  ))}
                </div>
    )}
            </div>
            <ShopComments id_post={product.id_post} currentUser={currentUser} />
        </div>
      ) : (
        <p>Loading product details...</p>
      )}


      {isModalOpen && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal fade show d-block" tabIndex={-1} role="dialog">
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content">
                <div className="modal-body p-0">
                  {currentImage && (
                    <img
                      src={currentImage}
                      alt="Full view"
                      style={{
                        width: '100%',
                        objectFit: 'contain',
                      }}
                    />
                  )}
                </div>
                <div className="modal-footer">
                  <button onClick={closeModal} className="btn btn-light">
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

{isBuyModalOpen && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal fade show d-block" tabIndex={-1} role="dialog">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{currentUser.acc_name} คุณต้องการซื้อสินค้านี้ใช่หรือไม่</h5>

                </div>
                <div className="modal-body">
                  <div className="form-group d-flex">
                  <button className="btn btn-secondary" onClick={closeBuyModal}>ยกเลิก</button>
                  <button className="btn btn-primary ms-auto" onClick={handleConfirmSubmit} disabled={isSubmitting}>
                    {isSubmitting ? "กำลังยืนยัน..." : "ยืนยัน"}
                  </button>
                  </div>
                  
                </div>
                
              </div>
            </div>
          </div>
        </>
      )}



    </div>
  );
}


export default ProductShopDetail;
