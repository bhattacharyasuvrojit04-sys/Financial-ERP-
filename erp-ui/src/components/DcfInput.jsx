export default function DcfInput ({inputs, setInputs}) {

    const handleChange = (key,value) => {
        setInputs({
            ...inputs,
            [key]: Number(value)
        });
    };

     const fields = [
    ["revenue", "Revenue (Year 1)"],
    ["revenue_growth", "Revenue Growth %"],
    ["ebitda_margin", "EBITDA Margin %"],
    ["tax_rate", "Tax Rate %"],
    ["capex_pct", "CapEx %"],
    ["nwc_pct", "Change in NWC %"],
    ["wacc", "WACC %"],
    ["terminal_growth", "Terminal Growth %"],
    ["years", "Projection Years"],
    ["net_debt", "Net Debt"],
    ["shares", "Shares"]
  ];

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: "15px",
      marginTop: "15px"
    }}>
      {fields.map(([key, label]) => (
        <div key={key}>
          <div style={{ fontSize: "12px", color: "#666" }}>{label}</div>
          <input
            type="number"
            value={inputs[key]}
            onChange={(e) => handleChange(key, e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "6px",
              border: "1px solid #ccc"
            }}
          />
        </div>
      ))}
    </div>
  );
}