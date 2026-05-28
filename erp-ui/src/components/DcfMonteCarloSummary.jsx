export default function DcfMonteCarloSummary({data}) {
    if(!data) return null;

    return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "10px" }}>
      <Card label="Mean" value={data.mean} />
      <Card label="P10" value={data.p10} />
      <Card label="Median" value={data.p50} />
      <Card label="P90" value={data.p90} />
    </div>
    );
}

function Card({label, value}){
     return (
    <div style={{
      padding: "10px",
      background: "#fff",
      borderRadius: "8px",
      border: "1px solid #eee"
    }}>
      <div style={{ fontSize: "12px", color: "#666" }}>{label}</div>
      <div style={{ fontSize: "18px", fontWeight: "600" }}>₹{value.toFixed(2)}</div>
    </div>
  );
}