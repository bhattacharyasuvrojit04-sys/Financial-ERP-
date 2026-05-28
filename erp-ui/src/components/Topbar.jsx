export default function Topbar() {
  return (
    <div className="topbar">

  {/* LEFT */}
  <div>
    <h1 style={{ fontSize: "18px", fontWeight: 500 }}>
      {title}
    </h1>
  </div>

  {/* RIGHT */}
  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>

    {/* DATE BADGE */}
    <div style={{
      background: "#fff",
      border: "0.5px solid #E5E7EB",
      padding: "6px 12px",
      borderRadius: "8px",
      fontSize: "13px",
      color: "#6B7280"
    }}>
      {new Date().toLocaleDateString()}
    </div>

    {/* AVATAR */}
    <div style={{
      width: "32px",
      height: "32px",
      borderRadius: "50%",
      background: "#D1D5DB"
    }} />

  </div>

</div>
  );
}