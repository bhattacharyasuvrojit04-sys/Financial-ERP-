export default function DcfSummary({data}) {

    const format = (num)=> {
        return Number(num || 0).toFixed(2);
    }

    const cards = [
        ["Enterprise Value", data.enterprise_value],
        ["Equity Value", data.equity_value],
        ["Price per Share", data.price_per_share],
        ["PV of FcF", data.pv_fcf]
    ];

    return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: "15px",
      marginTop: "15px"
    }}>
      {cards.map(([title, value]) => (
        <div key={title} className="card" style={{ padding: "15px" }}>
          <div style={{ fontSize: "12px", color: "#0a851e" }}>{title}</div>
          <div style={{ fontSize: "20px", fontWeight: "600" }}>
            ${format(value)}
          </div>
        </div>
      ))}
    </div>
  );
}