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

  const getAvailableStatuses = (type: string) => {
    switch (type) {
      case "post-trade":
        return ["posted", "dealed", "completed"];
      case "post-sell":
        return ["waiting","selling", "sold", "completed"];
      case "offer":
        return ["offered", "dealed", "rejected", "completed"];
      case "shop":
        return ["waiting", "dealed", "completed", "rejected"];
      default:
        return [];
    }
  };

  const filterByStatus = (data: any[]) => {
    if (statusFilter === "all") return data;
    return data.filter((item) => item.status === statusFilter);
  };

  const getDataByType = () => {
    switch (typeFilter) {
      case "post-trade":
        return postTrade;
      case "post-sell":
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
            <option value="all">ทั้งหมด</option>
            <option value="post-trade">My Post Trade</option>
            <option value="offer">My Offer</option>
            <option value="post-sell">My Post Sell</option>
            <option value="shop">My Shopping</option>
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
            {getAvailableStatuses(typeFilter).map((status) => (
              <option key={status} value={status}>
                {status}
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

    โพสต์ : {post.title?.length > 70
      ? post.title.slice(0, 67) + "..."
      : post.title}
</h5>


<p className="card-text">
  {post.description?.length > 80
    ? post.description.slice(0, 77) + "..."
    : post.description}
</p>



      <p>○ {post.status}</p>


      <small className="card-text">
      {new Date(post.created_at).toLocaleString()}
</small>
    </div>
    {(post.type === "trade" || post.type === "offer") ? (
  <div className="d-grid d-md-block">
    <Link to={`/trade/product/${post.id_post}`} className="text-decoration-none">
      <button className="btn btn-light me-2">
        View Post
      </button>
    </Link>

    {(post.status !== "waiting" && post.status !== "rejected" && post.status !== "posted")? (
      <Link to={`/trade/product-tracking/${post.id_post}`} className="text-decoration-none">
        <button className="btn btn-warning me-2">Tracking</button>
      </Link>
    ) : null}

    {post.type === "trade" && (
      <Link to={`/trade/product-offer/${post.id_post}`} className="text-decoration-none">
        <button className="btn btn-primary me-2">View Offer</button>
      </Link>
    )}
  </div>
) : (
  <div className="d-grid d-md-block">
    <Link to={`/shop/product/${post.id_post}`} className="text-decoration-none">
      <button className="btn btn-light me-2">
        View Post
      </button>
    </Link>
    {(post.type === "shop" && post.status !== "waiting" && post.status !== "rejected")&& (
      <Link to={`/shop/product-tracking/${post.id_post}`} className="text-decoration-none">
        <button className="btn btn-warning me-2">Tracking</button>
      </Link>
    )} 
    {post.status !== "waiting" && post.status !== "selling" && post.type === "sell" ? (
      <Link to={`/shop/product-tracking/${post.id_post}`} className="text-decoration-none">
      <button className="btn btn-warning me-2">Tracking</button>
    </Link>
    ) : null}

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
