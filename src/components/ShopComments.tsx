import React, { useEffect, useState } from "react";
import { supabase } from "../database/client";


interface ShopCommentsProps {
  id_post: number;
  currentUser: any;
}

const ShopComments: React.FC<ShopCommentsProps> = ({ id_post, currentUser }) => {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
        let query = supabase
          .from("Comment_sell")
          .select(`
            id, id_post, by_userid, context, created_at,
            Users (acc_name, username)
          `)
          .eq("id_post", id_post)
          .order("created_at", { ascending: true});
      
        const { data, error } = await query;
      
        if (error) {
          console.error("Error fetching comments:", error.message);
        } else {
          console.log("Fetched data:", data);
          setComments(data);
        }
      };
      
      
      
      
  
    fetchComments();
  }, [id_post]);
  

  const handleSubmitComment = async () => {
    if (!currentUser) {
      alert("กรุณาเข้าสู่ระบบก่อนแสดงความคิดเห็น");
      return;
    }

    if (!newComment.trim()) {
      alert("กรุณากรอกข้อความก่อนส่งความคิดเห็น");
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.from("Comment_sell").insert([
      {
        id_post: id_post,
        by_userid: currentUser.id,
        context: newComment.trim(),
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error("Error inserting comment:", error.message);
      alert(`เกิดข้อผิดพลาดในการส่งความคิดเห็น: ${error.message}`);

    } else {
      setNewComment("");
      alert("ส่งความคิดเห็นสำเร็จ");
      window.location.reload(); // รีโหลดเพื่อแสดงคอมเมนต์ใหม่
    }

    setIsSubmitting(false);
  };

  return (
    <div className="mt-5 mb-5">
      <h4>ความคิดเห็น</h4>
      <div className="border p-3 bg-white rounded">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="mb-3 p-2 border-bottom">
              <strong>{comment.Users.acc_name} </strong> <small className="text-muted">@{comment.Users.username} </small><small className="text-muted">({new Date(comment.created_at).toLocaleString()})</small>
              <p className="mb-0">{comment.context}</p>
            </div>
          ))
        ) : (
          <p className="text-muted">ยังไม่มีความคิดเห็น</p>
        )}
      </div>

      {/* ฟอร์มเพิ่มคอมเมนต์ */}
      {currentUser && (
  <div className="d-flex align-items-center mt-4 mb-5 w-100">
    <textarea
      className="form-control me-3"
      placeholder="แสดงความคิดเห็น..."
      value={newComment}
      onChange={(e) => setNewComment(e.target.value)}
      rows={3}
    ></textarea>
    <button
      className="btn btn-detail btn-lg h-100"
      style={{ whiteSpace: 'nowrap' }}  // เพิ่มตรงนี้เพื่อไม่ให้ข้อความแยกบรรทัด
      onClick={handleSubmitComment}
      disabled={isSubmitting}
    >
      {isSubmitting ? "กำลังส่ง..." : "ส่งความคิดเห็น"}
    </button>
  </div>
)}


    </div>
  );
};

export default ShopComments;
