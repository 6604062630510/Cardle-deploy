
import React, { useState } from "react";

const Report= () => {
  const [report, setReport] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Report submitted:", report);
    alert("รายงานของคุณถูกส่งเรียบร้อยแล้ว");
  };

  return (
    <div className="container mt-5">
      <h2>รายงานปัญหา</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">รายละเอียด</label>
          <textarea
            className="form-control"
            value={report}
            onChange={(e) => setReport(e.target.value)}
            rows={5}
            placeholder="กรอกรายละเอียดของปัญหาที่พบ"
          ></textarea>
        </div>
        <button type="submit" className="btn btn-danger">
          ส่งรายงาน
        </button>
      </form>
    </div>
  );
};

export default Report;
