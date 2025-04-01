import { useEffect, useState } from "react";
import { PostTradeStrategy } from "./StrategyMyDeal/PostTradeStrategy";
import { PostSellStrategy } from "./StrategyMyDeal/PostSellStrategy";
import { OfferStrategy } from "./StrategyMyDeal/OfferStrategy";
import { ShopStrategy } from "./StrategyMyDeal/ShopStrategy";
import { Link, useNavigate } from "react-router-dom";
import warn from "../assets/waiting.png";
import deal from "../assets/dealed.png";
import reject from "../assets/rejected.png";
import complete from "../assets/completed.png";

function MyDeal() {
  const [postTrade, setPostTrade] = useState<any[]>([]);
  const [postSell, setPostSell] = useState<any[]>([]);
  const [myOffer, setMyOffer] = useState<any[]>([]);
  const [myShop, setMyShop] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("post-trade");
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");

  const strategyMap: { [key: string]: any } = {
    "post-trade": new PostTradeStrategy(),
    "post-sell": new PostSellStrategy(),
    "offer": new OfferStrategy(),
    "shop": new ShopStrategy(),
  };

  const currentStrategy = strategyMap[typeFilter] || null;
  const navigate = useNavigate();
  useEffect(() => {
    if (!currentUser.id) {
      navigate("/signin");
    }
    const fetchMyDeals = async () => {
      
      if (currentUser && currentStrategy) {
        try {
          const data = await currentStrategy.fetchPosts(currentUser.id);
          if (typeFilter === "post-trade") {
            setPostTrade(data);
          } else if (typeFilter === "post-sell") {
            setPostSell(data);
          } else if (typeFilter === "offer") {
            setMyOffer(data);
          } else if (typeFilter === "shop") {
            setMyShop(data);
          }
        } catch (error) {
          console.error("Error fetching posts:", error);
        }
      }
    };

    fetchMyDeals();
  }, [currentUser, typeFilter]);

  const statusMap: Record<string, Record<string, string>> = {
    "trade": {
      "posted": "โพสต์แล้ว",
      "dealed": "ดีลแล้ว",
      "completed": "การแลกเปลี่ยนสมบูรณ์",
    },
    "sell": {
      "selling": "กำลังขาย",
      "sold": "ขายแล้ว",
      "completed": "การขายสมบูรณ์",
    },
    "offer": {
      "waiting": "รอผู้ขายตัดสินใจ",
      "dealed": "ดีลแล้ว",
      "rejected": "เอาไว้ครั้งหน้านะ",
      "completed": "การแลกเปลี่ยนสมบูรณ์",
    },
    "shop": {
      "waiting": "รอผู้ขายยืนยัน",
      "dealed": "ผู้ขายยืนยันแล้ว",
      "completed": "การขายสมบูรณ์",
      "rejected": "เอาไว้ครั้งหน้านะ",
    },
  };
  

  const mapStatusToThai = (type: string, status: string) => {
    return statusMap[type]?.[status] || status;
  };
  
  const filterByStatus = (data: any[]) => {
    console.log("Status Filter:", statusFilter);
    console.log("Available Statuses in Data:", data.map(item => item.status));
    if (statusFilter === "all") return data;
    return data.filter((item) => item.status === statusFilter);
  };
  

  const getDataByType = () => {
    switch (typeFilter) {
      case "trade":
        return postTrade;
      case "sell":
        return postSell;
      case "offer":
        return myOffer;
      case "shop":
        return myShop;
      default:
        return [...postTrade, ...postSell, ...myOffer, ...myShop];
    }
  };



  const filteredData = filterByStatus(getDataByType());

  return (
    <div className="container mt-5">
      <h1 className="mb-5 custom-topic">My Deals</h1>

      <div className="row mb-3">
        <div className="col-md-6 mb-2">
          <label className="form-label">ประเภทกิจกรรม</label>
          <select
            className="form-select"
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setStatusFilter("all");
            }}
          >
            <option value="post-trade">โพสต์แลกเปลี่ยนการ์ดของฉัน</option>
            <option value="offer">ข้อเสนอของฉัน</option>
            <option value="post-sell">โพสต์ขายการ์ดของฉัน</option>
            <option value="shop">คำสั่งซื้อของฉัน</option>
          </select>
        </div>
        <div className="col-md-6 mb-2">
          <label className="form-label">สถานะ</label>
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">ทั้งหมด</option>
            {Object.keys(statusMap[typeFilter] || {}).map((statusKey) => (
              <option key={statusKey} value={statusKey}>
                {statusMap[typeFilter][statusKey]} {/* แสดงภาษาไทย */}
              </option>
            ))}
          </select>


        </div>
      </div>

      <div className="mt-4">
        {filteredData.length > 0 ? (
          filteredData.map((post) => (
            <div key={post.id} className="card p-3 mb-4">
  <div className="d-flex">
    {/* ส่วนรูปทางด้านซ้าย */}
    <div className="me-3">
    {/* เช็คค่าของ title, offer_title, product_name etc*/}
    {post.type === "shop" ? (
      <img 
        src={ post.status === "waiting"
          ? warn
          : post.status === "dealed"
          ? deal
          : post.status === "rejected"
          ? reject
          : complete

        }
        alt="Shop Status Image"
        className="img-fluid rounded"
        style={{ width: "150px", height: "120px", objectFit: "contain"}}
      />
    ) : post.type === "trade" || post.type === "sell" ? (
          <img
            src={post.pic[0]}
            alt="Post Image"
            className="img-fluid rounded"
            style={{ width: "150px", height: "120px", objectFit: "cover" }}
          />
        ) : post.type === "offer" ? (
          <img
            src={post.pic}
            alt="Offer Image"
            className="img-fluid rounded"
            style={{ width: "150px", height: "120px", objectFit: "cover" }}
          />
    ) : (
      <p>No image available</p>
    )}

    </div>
    <div className="flex-grow-1">
    <div className="d-flex justify-content-between align-items-center">
      <div>
        <h5 className="card-title">
          {post.type === "shop" ? (
            <>โพสต์ : {post.title?.length > 70 ? post.title.slice(0, 67) + "..." : post.title}</>
          ) : (
            <>{post.title?.length > 70 ? post.title.slice(0, 67) + "..." : post.title}</>
          )}
        </h5>
        <p className="card-text">
          {post.description?.length > 80
            ? post.description.slice(0, 77) + "..."
            : post.description}
        </p>
        <p>● {mapStatusToThai(post.type, post.status)}</p>

        <small className="card-text">
          {new Date(post.created_at).toLocaleString()}
        </small>
      </div>

    {(post.type === "trade" || post.type === "offer") ? ( //สำหรับโพสต์แลกเปลี่ยยนการ์ดหรือข้อเสนอจะไปหน้ารายละเอียดสินค้าประเภท trade
  <div className="d-grid d-md-block">
    <Link to={`/trade/product/${post.id_post}`} className="text-decoration-none">
      <button className="btn btn-light me-2">
        View Post
      </button>
    </Link>
    {/*เจ้าของโพสต์แลกจะเห็นปุ่มหลังเลือกข้อเสนอแแล้ว ส่วนเจ้าของข้อเสนอจะเห็นเมื่อหลังถูกเลือก (สถานะข้อเสนอและโพสต์เป็น dealed หรือ completed)*/}
    {(post.status !== "waiting" && post.status !== "rejected" && post.status !== "posted")? (
      <Link to={`/trade/product-tracking/${post.id_post}`} className="text-decoration-none">
        <button className="btn btn-warning me-2">Tracking</button>
      </Link>
    ) : null}
    {/*เจ้าของโพสต์จะเลือกข้อเสนอได้ */}
    {post.type === "trade" && (
      <Link to={`/trade/product-offer/${post.id_post}`} className="text-decoration-none">
        <button className="btn btn-primary me-2">View Offer</button>
      </Link>
    )}
  </div>
) : (//สำหรับโพสต์ซื้อขายการ์ดหรือคำสั่งซื้อจะไปหน้ารายละเอียดสินค้าประเภท sell
  <div className="d-grid d-md-block">
    <Link to={`/shop/product/${post.id_post}`} className="text-decoration-none">
      <button className="btn btn-light me-2">
        View Post
      </button>
    </Link>

        {/*เจ้าของคำสั่งซื้อจะเห็นปุ่มหลังถูกยืนยันออเดอร์*/}
    {(post.type === "shop" && post.status !== "waiting" && post.status !== "rejected")&& (
      <Link to={`/shop/product-tracking/${post.id_post}`} className="text-decoration-none">
        <button className="btn btn-warning me-2">Tracking</button>
      </Link>
    )} 

    {/*เจ้าของโพสต์ซื้อขายจะเห็นปุ่มหลังเลือกผู็ขายแล้ว*/}
    {post.status !== "selling" && post.type === "sell" ? (
      <Link to={`/shop/product-tracking/${post.id_post}`} className="text-decoration-none">
      <button className="btn btn-warning me-2">Tracking</button>
    </Link>
    ) : null}
    {/*เจ้าของโพสต์จะเลือกผู้ขายได้ */}
    {(post.type === "sell")&& (
      <Link to={`/shop/product-waiting/${post.id_post}`} className="text-decoration-none">
        <button className="btn btn-primary me-2">View Buyer</button>
      </Link>
    )}
  </div>
)}


  </div>
</div>

  </div>
</div>

          ))
        ) : (
          <p>No posts available based on your filter</p>
        )}
      </div>
    </div>
  );
}

export default MyDeal;
