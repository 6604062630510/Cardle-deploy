import  { useEffect, useState } from "react";
import { supabase } from "../database/client";
import { useNavigate, useParams } from "react-router-dom";
import CardFactory from './CardFactory';

function UserProfile() {
  const [activeTab, setActiveTab] = useState<"trade" | "sell">("trade");
  const [tradeProducts, setTradeProducts] = useState<any[]>([]);
  const [sellProducts, setSellProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [noPostsFound, setNoPostsFound] = useState<boolean>(false);
  const [visibleProducts, setVisibleProducts] = useState<number>(6);
  const [user, setUser] = useState<any>(null);
  const { username } = useParams();
  const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState<any>(null);
    useEffect(() => {
      const storedUser = localStorage.getItem('currentUser');
      console.log("Current User: ", storedUser);
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
    }, []);
    
    useEffect(() => {
      if (!username) {
        navigate("/");
      } else {
        fetchUserPosts(username);
      }
    }, [username]);

  const fetchUserPosts = async (username: string) => {
    setLoading(true);
    setNoPostsFound(false); 
    const { data: userData, error: userError } = await supabase
      .from("Users")
      .select("*")
      .eq("username", username)
      .single();

    if (userError || !userData) {
      console.error("Error fetching user:", userError?.message);
     setNoPostsFound(true);
      setLoading(false);
      return;
    }

    setUser(userData);

    const tradeData = await fetchTradeProducts(userData.id);
    const sellData = await fetchSellProducts(userData.id);
    if (tradeData.length === 0 && sellData.length === 0) {
      setNoPostsFound(true);
    }
  
    setLoading(false);

  };

  const fetchTradeProducts = async (userId: number) => {
    const { data, error } = await supabase
      .from("Posts-trade")
      .select(
        `id_post,
               created_at,
               title,
               type,
               flaw,
               hashtag_i_have,
               hashtag_i_want,
               description_i_have,
               description_i_want,
               post_img_i_have,
               post_img_i_want,
               has_want,
               status,
               Users:by_userid(acc_name, username, status)`
      )
      .eq("by_userid", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching trade products:", error.message);
      return [];
    } else {
      
     const mappedData = data?.map((product: any) => ({
        type: 'trade', 
        id_post: product.id_post,
        title: product.title,
        description: product.description_i_have,
        image: product.post_img_i_have?.[0],
        username: product.Users?.username || 'ไม่ระบุชื่อผู้โพสต์',
        acc_name: product.Users?.acc_name || 'ไม่ระบุชื่อผู้โพสต์',
        created_at: product.created_at,
        hashtags: product.hashtag_i_have || [],
        hashtags_want: product.hashtag_i_want || [],
        has_want: product.has_want,
        isFavorite: isFavorite(product.id_post),
        onToggleFavorite: (id_post: number) => onToggleFavorite(id_post),
      }));
      setTradeProducts(mappedData);
  return mappedData;
    }
    
  };

  const fetchSellProducts = async (userId: number) => {
    const { data, error } = await supabase
      .from("Posts-sell")
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
             Users:by_userid(acc_name, username)`
      )
      .eq("by_userid", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching sell products:", error.message);
      return [];
    } else {

      const mappedData = data?.map((product: any) => ({
        type: 'sell', // กำหนด type เป็น 'trade'
        id_post: product.id_post,
        title: product.title,
        description: product.description,
        image: product.post_img[0],
        username: product.Users?.username || 'ไม่ระบุชื่อผู้โพสต์',
        acc_name: product.Users?.acc_name || 'ไม่ระบุชื่อผู้โพสต์',
        created_at: product.created_at,
        hashtags: product.hashtag || [],
        price: product.price,
        isFavorite: isFavorite(product.id_post),
        onToggleFavorite: (id_post: number) => onToggleFavorite(id_post),
      }));
       setSellProducts(mappedData);
  return mappedData;
    }
    
  };

  const isFavorite = (id_post: number) => {
    if (!currentUser) return false;
    const favPosts: number[] =
      activeTab === "trade"
        ? currentUser.fav_post_trade || []
        : currentUser.fav_post_sell || [];
    return favPosts.includes(id_post);
  };

  const onToggleFavorite = async (id_post: number) => {
      if (!currentUser) {
          navigate("/signin")
        return;
      }
      let favPosts: number[] = currentUser.fav_post_trade || [];

      if (favPosts.includes(id_post)) {
        favPosts = favPosts.filter((item) => item !== id_post);
      } else {

        favPosts.push(id_post);
      }
      const { error } = await supabase
        .from('Users')
        .update({ fav_post_trade: favPosts })
        .eq('id', currentUser.id);
  
      if (error) {
        console.error('Error updating favorites:', error.message);
        alert('เกิดข้อผิดพลาดในการอัปเดตรายการโปรด');
      } else {

 
        const updatedUser = { ...currentUser, fav_post_trade: favPosts };
        setCurrentUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      }
    };

  const visibleProductsArr =
    activeTab === "trade" ? tradeProducts.slice(0, visibleProducts) : sellProducts.slice(0, visibleProducts);

  const totalCount = activeTab === "trade" ? tradeProducts.length : sellProducts.length;

  return<div className="container mt-5 position-relative">
  {currentUser && currentUser.username === username && (
    <button
      className="btn btn-warning position-absolute top-0 end-0 m-3"
      onClick={() => navigate(`/edit-profile/${username}`)}
    >
      แก้ไขข้อมูล
    </button>
  )}

  <div className="d-flex justify-content-center">
    <div className="text-center">
    {user && (<>
      <h1 className="custom-topic mb-2 acc-name">
        {user?.acc_name || username}
      </h1>
    
      <h2 className="custom-topic mb-3">
        ( @{username} )
      </h2></>
)}
      {user?.about && (
        <h4 className="about-text mx-auto px-3 mt-4 mb-4">
          {user.about}
        </h4>
      )}

{user && user.status !== "approved" && (
  <h2 className="text-danger fw-bold mx-auto px-3 mt-4 mb-4">
    {username} ถูกแบน
  </h2>
)}

    </div>
  </div>

  {user?.status === "approved" && (
    <>
      <div className="d-flex justify-content-start ms-5 container-fav mb-4">
        <div className="btn-group justify-content-start" role="group">
          <button
            className={`btn ${
              activeTab === "trade" ? "btn-fav-click" : "btn-fav-unclick"
            } me-0`}
            onClick={() => {
              setActiveTab("trade");
              setVisibleProducts(6);
            }}
          >
            Trade Posts ({tradeProducts.length})
          </button>
          <button
            className={`btn ${
              activeTab === "sell" ? "btn-fav-click" : "btn-fav-unclick"
            }`}
            onClick={() => {
              setActiveTab("sell");
              setVisibleProducts(6);
            }}
          >
            Sell Posts ({sellProducts.length})
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-center">กำลังโหลด...</p>
      ) : noPostsFound ? (
        <p className="text-center">ไม่พบโพสต์ที่ตรงกับการค้นหา</p>
      ) : (
        <div className="row">
          {visibleProductsArr.map((product: any) => (
            <CardFactory key={product.id_post} {...product} />
          ))}
        </div>
      )}

      {visibleProducts < totalCount && (
        <div className="text-center mt-3">
          <button
            className="btn btn-more btn-lg mb-5"
            onClick={() => setVisibleProducts(visibleProducts + 6)}
          >
            Show More
          </button>
        </div>
      )}
    </>
  )}
</div>

}

export default UserProfile;
