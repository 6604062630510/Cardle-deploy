import { useEffect, useRef, useState } from "react";
import headImg from "../assets/se-pic 2.svg";

import { supabase } from "../database/client";
import CardFactory from './CardFactory';
import { Link, useNavigate} from "react-router-dom";

function Home() {
  const scrollRefTrade = useRef<HTMLDivElement>(null); 
  const scrollRefSell = useRef<HTMLDivElement>(null);  
  const [tradeProducts, setTradeProducts] = useState<any[]>([]);
  const [sellProducts, setSellProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [noPostsFound, setNoPostsFound] = useState<boolean>(false);

  // state สำหรับเก็บข้อมูลผู้ใช้ที่ล็อกอินแล้ว
  const [currentUser, setCurrentUser] = useState<any>(null);

  const navigate = useNavigate();

  // ดึงข้อมูลผู้ใช้จาก localStorage
  useEffect(() => {
    console.log(loading); 
    console.log(noPostsFound); 
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  // เรียก fetch posts เมื่อ currentUser ถูกตั้งค่า
  useEffect(() => {

    fetchTradeProducts();
    fetchSellProducts();
    
  }, [currentUser]);

  const fetchTradeProducts = async () => {
    setLoading(true);
    setNoPostsFound(false);


    const { data, error } = await supabase
      .from("Posts-trade")
      .select(`
        id_post,
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
        Users:by_userid(acc_name, username, status)
      `)
      .eq("status", "posted")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching trade products:", error.message);
    } else {
      if (data && data.length === 0) {
        setNoPostsFound(true);
      }

      const approvedData = data.filter((product: any) => product.Users?.status === "approved");

        
      setTradeProducts(
        approvedData.map((product: any) => ({
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
          isFavorite: isFavorite(product.id_post, "trade"),
          onToggleFavorite: (id_post: number) => onToggleFavorite(id_post, "trade"), // ส่งฟังก์ชัน
        }))
      );
    }
    setLoading(false);
  };

  const fetchSellProducts = async () => {
    setLoading(true);
    setNoPostsFound(false);

    const { data, error } = await supabase
      .from("Posts-sell")
      .select(`
        id_post,
        created_at,
        title,
        type,
        flaw,
        hashtag,
        description,
        price,
        post_img,
        status,
        Users:by_userid(acc_name, username, status)
      `)
      .eq("status", "selling")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching sell products:", error.message);
    } else {
      if (data && data.length === 0) {
        setNoPostsFound(true);
      }

      const approvedData = data.filter((product: any) => product.Users?.status === "approved");

  
              
      setSellProducts(
        approvedData.map((product: any) => ({
          type: 'sell',
          id_post: product.id_post,
          title: product.title,
          description: product.description,
          image: product.post_img ? product.post_img[0] : headImg,
          username: product.Users?.username || 'ไม่ระบุชื่อผู้โพสต์',
          acc_name: product.Users?.acc_name || 'ไม่ระบุชื่อผู้โพสต์',
          created_at: product.created_at,
          hashtags: product.hashtag || [],
          price: product.price,
          isFavorite: isFavorite(product.id_post,  "sell"),
          onToggleFavorite: (id_post: number) => onToggleFavorite(id_post, "sell"), // ส่งฟังก์ชัน
        }))
      );
    }
    setLoading(false);
  };

const onToggleFavorite = async (id_post: number, type: "trade" | "sell") => {
    if (!currentUser) {
        navigate("/signin")
      return;
    }
    if(type === "trade"){
      let favPosts: number[] = currentUser.fav_post_trade || [];
      if (favPosts.includes(id_post)) {
        // ถ้ามีอยู่แล้ว ให้ลบออก
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
    }else {
      let favPosts: number[] = currentUser.fav_post_sell|| [];
      if (favPosts.includes(id_post)) {
        // ถ้ามีอยู่แล้ว ให้ลบออก
        favPosts = favPosts.filter((item) => item !== id_post);
  
      } else {
        favPosts.push(id_post);
    
      }
      const { error } = await supabase
        .from('Users')
        .update({ fav_post_sell: favPosts })
        .eq('id', currentUser.id);
  
      if (error) {
        console.error('Error updating favorites:', error.message);
        alert('เกิดข้อผิดพลาดในการอัปเดตรายการโปรด');
      } else {

        const updatedUser = { ...currentUser, fav_post_sell: favPosts };
        setCurrentUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      }
    }
    

  };

  const isFavorite = (id_post: number, type: "trade" | "sell") => {
    if (!currentUser) return false;
    if(type === "trade"){

   const favPosts: number[] = currentUser.fav_post_trade || [];
    return favPosts.includes(id_post);
    }else{
      const favPosts: number[] = currentUser.fav_post_sell || [];
    return favPosts.includes(id_post);   
    }
   
  };

  const scroll = (direction: "left" | "right", type: "trade" | "sell") => {
    const scrollRef = type === "trade" ? scrollRefTrade : scrollRefSell;
    if (scrollRef.current) {
      scrollRef.current.scrollLeft += direction === "left" ? -500 : 500;
    }
  };

  return (
    <div>
      {currentUser && (
        <div className="container mt-3">
          <h5 className="text-center">Hello, {currentUser.acc_name}!</h5>
        </div>
      )}
      
      {/*{error && <div className="alert alert-danger">{error}</div>}*/}

      <header className="bg-primary text-white py-5 bodyhead">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6 text-md-start text-center">
              <h1>
                Trade your <br />
                <span className="textCard">CARDS</span> HERE!
              </h1>
              <p className="lead">
                Join our community of card collectors and traders
                <br />
                Let’s make your collection grow!
              </p>
              <Link className="btn btn-dark-custom btn-lg" to="/learnmore">
  Learn more
</Link>
            </div>
            <div className="col-md-6 text-center">
              <img src={headImg} alt="Shopping" className="img-fluid rounded" />
            </div>
          </div>
        </div>
      </header>

      <div className="content-bg">
        <div className="container my-5">
          <div className="d-flex justify-content-center">
            <h2 className="rounded-circle text-center mb-4 Recently-logo">Recently Posts</h2>
          </div>
          
          <div className="container mt-4">
            <h2 className="text-start mb-4">Trade</h2>
            <div className="position-relative">
              <div 
            ref={scrollRefTrade} 
            className="trade-container" 
            style={{
              display: "flex",
              flexWrap: "nowrap",
              gap: "1rem",
              overflowX: "auto",
              paddingBottom: "30px",
              scrollbarWidth: "none"
            }}
          >
            {tradeProducts.length > 0 ? (
              tradeProducts.map((product) => (
                <CardFactory key={product.id_post} {...product} />
              ))
            ) : (
              <p>No trade posts found.</p>
            )}
          </div>

              <button onClick={() => scroll("left", "trade")}
                className="btn btn-dark position-absolute top-50 start-0 translate-middle-y rounded-circle"
                style={{
                  padding: "10px",
                  left: "-30px",
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {"<"}
              </button>
              <button onClick={() => scroll("right", "trade")}
                className="btn btn-dark position-absolute top-50 end-0 translate-middle-y rounded-circle"
                style={{
                  padding: "10px",
                  right: "-30px",
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {">"}
              </button>
            </div>
          </div>

        </div>

        <div className="container mt-5">
        <div className="container mt-4">
  <h2 className="text-start mb-4">Shop</h2>
  <div className="position-relative">
  <div 
  ref={scrollRefSell} 
  className="sell-container" 
  style={{
    display: "flex",
    flexWrap: "nowrap",
    gap: "1rem",
    overflowX: "auto",
    paddingBottom: "30px",
    scrollbarWidth: "none"
  }}
>
  {sellProducts.length > 0 ? (
    sellProducts.map((product) => (
      <CardFactory key={product.id_post} {...product} />
    ))
  ) : (
    <p>No sell posts found.</p>
  )}
</div>

    <button onClick={() => scroll("left", "sell")}
      className="btn btn-dark position-absolute top-50 start-0 translate-middle-y rounded-circle"
      style={{
        padding: "10px",
        left: "-30px",
        width: "40px",
        height: "40px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {"<"}
    </button>
    <button onClick={() => scroll("right", "sell")}
      className="btn btn-dark position-absolute top-50 end-0 translate-middle-y rounded-circle"
      style={{
        padding: "10px",
        right: "-30px",
        width: "40px",
        height: "40px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {">"}
    </button>
  </div>
</div>

        </div>
      </div>
    </div>
  );
}

export default Home;
