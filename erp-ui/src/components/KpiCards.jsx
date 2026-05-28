export default function KpiCard({ title, value, change, positive }) {
  return (
    <div className="card" style={{
      padding: "16px",
      display: "flex",
      flexDirection: "column",
      gap: "6px"
    }}>
      <span style={{ fontSize: "13px", color: "#6B7280" }}>{title}</span>

      <span style={{ fontSize: "22px", fontWeight: "500" }}>
        {value}
      </span>

      <span style={{
        fontSize: "12px",
        color: positive ? "#0F6E56" : "#E76F51"
      }}>
        {positive ? "↑" : "↓"} {change}% vs last month
      </span>
    </div>
  );
}

function Card({ title, value, delta }) {
  const isPositive = delta.includes("+");

  return (
    <div className="bg-white border rounded-xl p-4">
      <p className="text-sm text-gray-500">{title}</p>
      <h2 className="text-xl font-medium">{value}</h2>
      <p className={isPositive ? "text-green-600" : "text-red-500"}>
        {delta}
      </p>
    </div>
  );
}