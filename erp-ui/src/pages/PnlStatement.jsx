import { useEffect, useState } from "react";
import { getPnlPeriodic } from "../services/api";

export default function PnlMultiPeriod() {
  const [data, setData] = useState([]);
  const [period, setPeriod] = useState("monthly");
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    loadData("monthly");
  }, []);

  const loadData = async (selectedPeriod) => {
    try {
      const res = await getPnlPeriodic(selectedPeriod);
      console.log("P&L MULTI:", res);
      setData(res);
      setPeriod(selectedPeriod);
      setExpanded({}); // reset expand state on reload
    } catch (err) {
      console.error(err);
    }
  };

  if (!data || data.length === 0) {
    return <div style={styles.loading}>Loading...</div>;
  }

  // Extract columns
  const columns = data.map((d) => d.label);

  // Get summary values
  const getValues = (keyPath) =>
    data.map((d) => {
      let val = d.data;
      keyPath.forEach((k) => {
        val = val?.[k];
      });
      return val || 0;
    });

  // 🔥 Build line items across periods
  const getLineItems = (category) => {
  const map = {};

  data.forEach((period, periodIndex) => {
    let raw = period?.data?.line_items?.[category];

    // 🛡️ Case 1: null / undefined
    if (!raw) return;

    let items = [];

    // 🛡️ Case 2: already array
    if (Array.isArray(raw)) {
      items = raw;
    }

    // 🛡️ Case 3: object → convert to array
    else if (typeof raw === "object") {
      items = Object.keys(raw).map((key) => ({
        name: key,
        value: raw[key],
      }));
    }

    // 🛡️ Case 4: something weird (string/number)
    else {
      console.warn("Unexpected line_items format:", raw);
      return;
    }

    // ✅ Safe loop
    items.forEach((item) => {
      if (!item || !item.name) return;

      if (!map[item.name]) {
        map[item.name] = new Array(data.length).fill(0);
      }

      map[item.name][periodIndex] = Number(item.value || 0);
    });
  });

  return map;
};

  const toggle = (key) => {
    setExpanded((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Profit & Loss Statement</h2>

        {/* PERIOD SELECTOR */}
        <div style={styles.buttons}>
          <button onClick={() => loadData("monthly")}>Monthly</button>
          <button onClick={() => loadData("quarterly")}>Quarterly</button>
          <button onClick={() => loadData("yearly")}>Yearly</button>
        </div>

        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.thLeft}>Particulars</th>
              {columns.map((col) => (
                <th key={col} style={styles.thRight}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {/* ================= INCOME ================= */}
            <SectionHeader label="Revenue" />

            <Row
              label="Operating Income"
              values={getValues(["summary", "operating_income"])}
              onClick={() => toggle("operating_income")}
              clickable
            />

            {expanded.operating_income && (
              <LineItems
                category="operating_income"
                data={data}
                getLineItems={getLineItems}
              />
            )}

            <Row
              label="Other Income"
              values={getValues(["summary", "non_operating_income"])}
              onClick={() => toggle("non_operating_income")}
              clickable
            />

            {expanded.non_operating_income && (
              <LineItems
                category="non_operating_income"
                data={data}
                getLineItems={getLineItems}
              />
            )}

            <TotalRow
              label="Total Income"
              values={getValues(["summary", "total_income"])}
            />

            {/* ================= EXPENSE ================= */}
            <SectionHeader label="Expenses" />

            <Row
              label="Operating Expense"
              values={getValues(["summary", "operating_expense"])}
              onClick={() => toggle("operating_expense")}
              clickable
            />

            {expanded.operating_expense && (
              <LineItems
                category="operating_expense"
                data={data}
                getLineItems={getLineItems}
              />
            )}

            <Row
              label="Other Expense"
              values={getValues(["summary", "non_operating_expense"])}
              onClick={() => toggle("non_operating_expense")}
              clickable
            />

            {expanded.non_operating_expense && (
              <LineItems
                category="non_operating_expense"
                data={data}
                getLineItems={getLineItems}
              />
            )}

            <TotalRow
              label="Total Expense"
              values={getValues(["summary", "total_expense"])}
            />

            {/* ================= PROFIT ================= */}
            <TotalRow
              label="Net Profit"
              values={getValues(["summary", "profit"])}
              highlight
            />
          </tbody>
        </table>
      </div>
    </div>
  );
} 

/* ================= COMPONENTS ================= */

function SectionHeader({ label }) {
  return (
    <tr>
      <td colSpan="100%" style={styles.section}>
        {label}
      </td>
    </tr>
  );
}

function Row({ label, values, onClick, clickable }) {
  return (
    <tr
      onClick={onClick}
      style={clickable ? styles.clickableRow : {}}
    >
      <td style={styles.label}>
        {clickable ? "▶ " : ""}
        {label}
      </td>
      {values.map((v, i) => (
        <td key={i} style={styles.value}>
          {format(v)}
        </td>
      ))}
    </tr>
  );
}

function LineItems({ category, getLineItems }) {
  let items = {};

  try {
    items = getLineItems(category);
  } catch (err) {
    console.error("LineItems crash:", err);
    return null;
  }

  if (!items || Object.keys(items).length === 0) return null;

  return (
    <>
      {Object.entries(items).map(([name, values]) => {
        if (!Array.isArray(values)) return null;

        return (
          <tr key={name}>
            <td style={styles.subLabel}>{name}</td>
            {values.map((v, i) => (
              <td key={i} style={styles.value}>
                {format(v)}
              </td>
            ))}
          </tr>
        );
      })}
    </>
  );
}

function TotalRow({ label, values, highlight }) {
  return (
    <tr style={highlight ? styles.highlightRow : {}}>
      <td style={styles.totalLabel}>{label}</td>
      {values.map((v, i) => (
        <td key={i} style={styles.totalValue}>
          {format(v)}
        </td>
      ))}
    </tr>
  );
}

/* ================= HELPERS ================= */

function format(num) {
  return Number(num || 0).toLocaleString("en-IN");
}

/* ================= STYLES ================= */

const styles = {
  container: {
    padding: "30px",
    background: "#F4F6F8",
    minHeight: "100vh",
  },

  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
  },

  title: {
    marginBottom: "15px",
  },

  buttons: {
    marginBottom: "15px",
    display: "flex",
    gap: "10px",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  thLeft: {
    textAlign: "left",
    padding: "10px",
    borderBottom: "2px solid #ddd",
  },

  thRight: {
    textAlign: "right",
    padding: "10px",
    borderBottom: "2px solid #ddd",
  },

  label: {
    padding: "8px 10px",
    fontWeight: "500",
  },

  subLabel: {
    padding: "8px 10px 8px 30px",
    color: "#555",
  },

  value: {
    textAlign: "right",
    padding: "8px 10px",
  },

  totalLabel: {
    fontWeight: "700",
    padding: "10px",
    borderTop: "2px solid #000",
  },

  totalValue: {
    textAlign: "right",
    fontWeight: "700",
    padding: "10px",
    borderTop: "2px solid #000",
  },

  section: {
    padding: "10px",
    fontWeight: "600",
    background: "#f1f5f9",
  },

  highlightRow: {
    background: "#ecfdf5",
  },

  clickableRow: {
    cursor: "pointer",
  },

  loading: {
    padding: "20px",
  },
};