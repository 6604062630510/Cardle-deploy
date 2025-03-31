import{ useEffect, useState } from "react";
import { supabase } from "../database/client";
import { useNavigate} from "react-router-dom";
import CardFactory from './CardFactory';
function Fav() {
  const [activeTab, setActiveTab] = useState<"trade" | "sell">("trade");
  const [tradeProducts, setTradeProducts] = useState<any[]>([]);
  const [sellProducts, setSellProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [noPostsFound, setNoPostsFound] = useState<boolean>(false);
  const [visibleProducts, setVisibleProducts] = useState<number>(6);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    } else {
        navigate("/signin");
    }
  }, []);

  const fetchTradeProducts = async () => {
    setLoading(true);
    setNoPostsFound(false);

    if (!currentUser) {
      setLoading(false);
      return;
    }

    let favPosts: number[] = currentUser.fav_post_trade || [];

    let query = supabase
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
        Users:by_userid(acc_name, username)`
      )
      .in("id_post", favPosts.length > 0 ? favPosts : [-1])
      .order("created_at", { ascending: false });

    const { data, error } = await query;
    if (error) {
      console.error("Error fetching trade products:", error.message);
    } else {
      if (data && data.length === 0) {
        setNoPostsFound(true);
      }
      setTradeProducts( data?.map((product: any) => ({
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
      })));
    }
    setLoading(false);
  };

  const fetchSellProducts = async () => {
    setLoading(true);
    setNoPostsFound(false);
    if (!currentUser) {
      setLoading(false);
      return;
    }
    let favPosts: number[] = currentUser.fav_post_sell || [];
    let query = supabase
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
      .in("id_post", favPosts.length > 0 ? favPosts : [-1])
      .order("created_at", { ascending: false });


    const { data, error } = await query;
    if (error) {
      console.error("Error fetching sell products:", error.message);
    } else {
      if (data && data.length === 0) {
        setNoPostsFound(true);
      }
      setSellProducts( data?.map((product: any) => ({
        type: 'sell', 
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
      })));
    }
    setLoading(false);
  };


  useEffect(() => {

    fetchSellProducts();
    if (activeTab === "trade") {
      fetchTradeProducts();
    } else {
      fetchSellProducts();
    }

  }, [activeTab, currentUser]);

  const onToggleFavorite = async (id_post: number) => {
    if (!currentUser) {
      alert("กรุณาเข้าสู่ระบบก่อนเพิ่มรายการโปรด");
      return;
    }
    let favPosts: number[] =
      activeTab === "trade"
        ? currentUser.fav_post_trade || []
        : currentUser.fav_post_sell || [];
    if (favPosts.includes(id_post)) {
      favPosts = favPosts.filter((item) => item !== id_post);

    } else {
      favPosts.push(id_post);

    }
    const { error } = await supabase
      .from("Users")
      .update(
        activeTab === "trade"
          ? { fav_post_trade: favPosts }
          : { fav_post_sell: favPosts }
      )
      .eq("id", currentUser.id);
    if (error) {
      console.error("Error updating favorites:", error.message);
      alert("เกิดข้อผิดพลาดในการอัปเดตรายการโปรด");
    } else {

      const updatedUser = { ...currentUser };
      if (activeTab === "trade") {
        updatedUser.fav_post_trade = favPosts;
      } else {
        updatedUser.fav_post_sell = favPosts;
      }
      setCurrentUser(updatedUser);
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
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

  const visibleProductsArr =
    activeTab === "trade"
      ? tradeProducts.slice(0, visibleProducts)
      : sellProducts.slice(0, visibleProducts);
  const totalCount =
    activeTab === "trade" ? tradeProducts.length : sellProducts.length;

  return (
    <div className="container mt-5 ">
          <div className="d-flex justify-content-center">
      <h2 className="text-center mb-4 rounded-circle Fav-logo ">Favorite</h2>
      </div>
      {/* แท็บเลือกประเภทโพสต์ */}
      <div className="d-flex justify-content-start ms-5 container-fav mb-4">
      <div className="btn-group  justify-content-start " role="group">
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
          } `}
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
    </div>
  );
}

export default Fav;
