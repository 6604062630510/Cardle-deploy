import React, { useState, useEffect } from "react";
import { supabase } from "../database/client";
import { useNavigate } from "react-router-dom"; // ใช้ useNavigate แทน useHistory

interface TradePost {
  title: string;
  type: string;
  status:string;
  has_flaw: boolean;
  flaw: string;
  has_want: boolean;
  hashtag_i_have: string;
  hashtag_i_want: string;
  description_i_have: string;
  description_i_want: string;
  post_img_i_have: FileList;
  post_img_i_want: FileList | null;
  by_userid: BigInteger;
}

interface SellPost {
  title: string;
  type: string;
  status:string;
  price: number;
  has_flaw: boolean;
  flaw: string;
  description: string;
  post_img: FileList;
  by_userid: BigInteger;
  hashtag: string;
}

function CreatePost() {
  const [postType, setPostType] = useState<"trade" | "sell">("trade");
  const [hasWantedCard, setHasWantedCard] = useState<boolean>(true);
  const [hasFlaw, setHasFlaw] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [tradeData, setTradeData] = useState<TradePost>({
    title: "",
    type: "trade",
    status: "posted",
    has_flaw: false,
    flaw: "",
    has_want: false,
    hashtag_i_have: "",
    hashtag_i_want: "",
    description_i_have: "",
    description_i_want: "",
    post_img_i_have: new DataTransfer().files,
    post_img_i_want: null,
    by_userid: currentUser?.id,
  });


  const [sellData, setSellData] = useState<SellPost>({
    title: "",
    type: "sell",
    status:"selling",
    has_flaw: false,
    flaw: "",
    price: 0,
    description: "",
    hashtag: "",
    post_img: new DataTransfer().files,
    by_userid: currentUser?.id,
  });

  const navigate = useNavigate(); 

  useEffect(() => {
    const userData = localStorage.getItem("currentUser");
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    } else {

      navigate("/signin");
    }
  }, [navigate]); 

  // ฟังก์ชันการอัพโหลดรูป
  const uploadImage = async (file: File, folder: string) => {
    const timestamp = new Date().getTime();
    const uniqueFileName = `${timestamp}-${file.name}`;
    const filePath = `${folder}/${uniqueFileName}`;
    
    const { data, error } = await supabase.storage
      .from("post_pic")
      .upload(filePath, file);
  
    if (error) {
      alert("Error uploading file: " + error.message);
      return null;
    }
  
    if (data?.path) {
      const { data: publicData } = supabase.storage
        .from("post_pic")
        .getPublicUrl(data.path); 
      return publicData.publicUrl; 
    }
  
    return null;
  };

const handleImageChange = async (
  e: React.ChangeEvent<HTMLInputElement>,
  key: keyof TradePost | keyof SellPost,
  folder: "Have" | "Want" | null
) => {
  if (e.target.files && e.target.files.length > 3) {
    alert("You can upload up to 3 images only!");
    return;
  }

  const fileUrls: string[] = [];
  for (let i = 0; i < e.target.files!.length; i++) {
    const file = e.target.files![i];
    const fileUrl = await uploadImage(file, postType === "sell" ? "Sell" : `Trade/${folder}`);
    if (fileUrl) {
      fileUrls.push(fileUrl);
    }
  }

  if (postType === "trade") {
    setTradeData({
      ...tradeData,
      [key]: fileUrls,
    });
  } else if (postType === "sell") {
    setSellData({
      ...sellData,
      [key]: fileUrls,
    });
  }
};


  const handleTradeChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTradeData({ ...tradeData, [e.target.name]: e.target.value });
  };

  const handleSellChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSellData({ ...sellData, [e.target.name]: e.target.value });
  };

  const handleHashtagChange = (e: React.ChangeEvent<HTMLInputElement>, key: "hashtag_i_have" | "hashtag_i_want" | "hashtag") => {
    const value = e.target.value;
    if(postType === "trade"){
      setTradeData({
      ...tradeData,
      [key]: value,
      });
    } else if(postType === "sell"){
      setSellData({
      ...sellData,
      [key]: value,
      });
    }
    
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (postType === "trade") {
      const updatedTradeData = {
        ...tradeData,
        has_flaw: hasFlaw ? true : false,
        has_want: hasWantedCard ? true: false,
        hashtag_i_have: tradeData.hashtag_i_have.split(/\s*,\s*/).map((tag) => tag.trim()).filter((tag) => tag !== ""),
        hashtag_i_want: tradeData.hashtag_i_want.split(/\s*,\s*/).map((tag) => tag.trim()).filter((tag) => tag !== ""),
        created_at: new Date().toISOString(),
        by_userid: currentUser.id,
      };

      const { data, error } = await supabase.from("Posts-trade").insert([updatedTradeData]);

      console.log(data); 
      if (error) {
        alert("Error submitting trade post: " + error.message);
      } else {
        alert("Trade post submitted successfully!");
      }
    } else if (postType === "sell") {
      const updatedSellData = {
        ...sellData,
        has_flaw: hasFlaw,
        hashtag: sellData.hashtag.split(/\s*,\s*/).filter((tag) => tag !== ""),
        created_at: new Date().toISOString(),
        by_userid: currentUser.id,
      };
  

      
      
      
      const { data, error } = await supabase.from("Posts-sell").insert([updatedSellData]);
      console.log(data); 
      if (error) {
        alert("Error submitting sell post: " + error.message);
      } else {
        alert("Sell post submitted successfully!");
      }
    }
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container my-4">
      <div className="d-flex mb-3">
        <button className={`btn ${postType === "trade" ? "btn-success" : "btn-outline-success"} mx-1`} onClick={() => setPostType("trade")}>
          Trade Post
        </button>
        <button className={`btn ${postType === "sell" ? "btn-success" : "btn-outline-success"} mx-1`} onClick={() => setPostType("sell")}>
          Sell Post
        </button>
      </div>

      {postType === "trade" && (
        <div className="card p-4">
        <form onSubmit={handleSubmit}>
          {/* แสดงฟอร์ม */}
          <div className="mb-3">
            <label>Title</label>
            <input type="text" className="form-control" name="title" value={tradeData.title} onChange={handleTradeChange} required />
          </div>

          {/* ฟอร์มการโพสต์ */}
          <div className="row">
            {/* ฟอร์มการโพสต์สำหรับการ์ดที่มี */}
            <div className="col-md-6">
              <div className="card p-3 mb-3">
                <h5>การ์ดที่คุณมี</h5>
                <div className="mb-3">
                  <label>รายละเอียด</label>
                  <textarea className="form-control" name="description_i_have" value={tradeData.description_i_have} onChange={handleTradeChange} required />
                </div>

                {/* การ์ดมีตำหนิหรือไม่ */}
                <div className="mb-3">
                  <label>การ์ดมีตำหนิหรือไม่?</label>
                  <div>
                    <input type="radio" name="hasFlaw" value="yes" checked={hasFlaw} onChange={() => setHasFlaw(true)} /> ใช่
                    <input type="radio" name="hasFlaw" value="no" checked={!hasFlaw} onChange={() => setHasFlaw(false)} className="ms-3" /> ไม่
                  </div>
                </div>

                {hasFlaw && (
                  <>
                    <div className="mb-3">
                      <label>รายละเอียดตำหนิ</label>
                      <textarea className="form-control" name="flaw" value={tradeData.flaw} onChange={handleTradeChange} required />
                    </div>
                  </>
                )}

                {/* Hashtags */}
                <div className="mb-3">
                  <label>Hashtags</label>
                  <input type="text" className="form-control"  placeholder="เช่น blackpink, lisa, 2014" value={tradeData.hashtag_i_have} onChange={(e) => handleHashtagChange(e, "hashtag_i_have")}  required />
                </div>

                {/* อัปโหลดรูป */}
                <div className="mb-3">
                  <label>อัปโหลดรูป (สูงสุด 3 รูป)</label>
                  <input type="file" className="form-control" multiple onChange={(e) => handleImageChange(e, "post_img_i_have", "Have")} required />
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card p-3 mb-3">
                <h5>การ์ดคุณที่ต้องการ</h5>
                <div className="mb-3">
                <div>
                  <label>คุณมีการ์ดที่อยากได้โดยเฉพาะหรือไม่?</label>
                  </div>
                  <div>
                    <input type="radio" name="hasWantedCard" value="yes" checked={hasWantedCard} onChange={() => setHasWantedCard(true)} /> ใช่
                    <input type="radio" name="hasWantedCard" value="no" checked={!hasWantedCard} onChange={() => setHasWantedCard(false)} className="ms-3" /> ไม่
                  </div>
                </div>

                {hasWantedCard && (
                  <>
                    <div className="mb-3">
                      <label>รายละเอียด</label>
                      <textarea className="form-control" name="description_i_want" value={tradeData.description_i_want} onChange={handleTradeChange} required />
                    </div>

                    <div className="mb-3">
                      <label>Hashtags</label>
                      <input type="text" className="form-control"  placeholder="เช่น blackpink, lisa, 2014" value={tradeData.hashtag_i_want} onChange={(e) => handleHashtagChange(e, "hashtag_i_want")}  required />
                    </div>

                    <div className="mb-3">
                      <label>อัปโหลดรูป (สูงสุด 3 รูป) - ไม่บังคับ</label>
                      <input type="file" className="form-control" multiple onChange={(e) => handleImageChange(e, "post_img_i_want", "Want")} />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ปุ่ม submit */}
          <div className="d-flex mt-4 mb-3 justify-content-center">
          <button type="submit" className="btn btn-dark-custom text-center">Submit Trade Post</button></div>
        </form>

</div>
      )}


{postType === "sell" && (
<div className="d-flex mt-4 mb-3 justify-content-center">
  <div className="card p-4 w-50">

    <form onSubmit={handleSubmit}>
      {/* แสดงฟอร์มสำหรับการโพสต์ Sell */}
      <div className="mb-3">
        <label>Title</label>
        <input type="text" className="form-control" name="title" value={sellData.title} onChange={handleSellChange} required />
      </div>

      <div className="mb-3">
        <label>Description</label>
        <textarea className="form-control" name="description" value={sellData.description} onChange={handleSellChange} required />
      </div>

      <div className="mb-3">
        <label>Price</label>
        <input type="number" className="form-control" name="price" value={sellData.price} onChange={handleSellChange} required />
      </div>

      {/* การ์ดมีตำหนิหรือไม่ */}
      <div className="mb-3">
        <label>การ์ดมีตำหนิหรือไม่?</label>
        <div>
          <input type="radio" name="hasFlaw" value="yes" checked={hasFlaw} onChange={() => setHasFlaw(true)} /> ใช่
          <input type="radio" name="hasFlaw" value="no" checked={!hasFlaw} onChange={() => setHasFlaw(false)} className="ms-3" /> ไม่
        </div>
      </div>

      {hasFlaw && (
        <>
          <div className="mb-3">
            <label>รายละเอียดตำหนิ</label>
            <textarea className="form-control" name="flaw" value={sellData.flaw} onChange={handleSellChange} required />
          </div>
        </>
      )}

      {/* Hashtags */}
      <div className="mb-3">
        <label>Hashtags</label>
        <input type="text" className="form-control" placeholder="เช่น blackpink, lisa, 2014" value={sellData.hashtag} onChange={(e) => handleHashtagChange(e, "hashtag")} required />
      </div>

      <div className="mb-3">
        <label>อัปโหลดรูป (สูงสุด 3 รูป)</label>
        <input type="file" className="form-control" multiple onChange={(e) => handleImageChange(e, "post_img", null)} required />
      </div>
      <div className="d-flex mt-4 mb-3 justify-content-center">
          <button type="submit" className="btn btn-dark-custom text-center">Submit Sell Post</button></div>

    </form>
    
  </div></div>
)}

    </div>
  );
}

export default CreatePost;
