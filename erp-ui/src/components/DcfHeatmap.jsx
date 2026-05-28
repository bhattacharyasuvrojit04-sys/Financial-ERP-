export default function DcfHeatmap({ data }) {
  if (!data) return null;

  const { wacc, terminal_growth, matrix } = data;

  const getColor = (val, min, max) => {
    const ratio = (val - min) / (max - min || 1);
    const green = Math.floor(200 * ratio);
    const red = Math.floor(200 * (1 - ratio));
    return `rgb(${red}, ${green}, 100)`;
  };

  const flat = matrix.flat();
  const min = Math.min(...flat);
  const max = Math.max(...flat);

  return (
    <div>
      <h3>Sensitivity Analysis</h3>

      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th>Terminal ↓ / WACC →</th>
            {wacc.map((w, i) => (
              <th key={i}>{w}%</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {terminal_growth.map((tg, i) => (
            <tr key={i}>
              <td>{tg}%</td>

              {matrix[i].map((val, j) => (
                <td
                  key={j}
                  style={{
                    padding: "8px",
                    textAlign: "center",
                    background: getColor(val, min, max),
                    color: "#000",
                    border: "1px solid #ddd"
                  }}
                >
                  ₹{val}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}