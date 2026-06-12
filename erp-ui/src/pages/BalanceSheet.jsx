import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { getBalanceSheet } from "../services/api";

export default function BalanceSheet() {
  const [data, setData] = useState([]);
  const [period, setPeriod] = useState("yearly");

  const loadData = async () => {
    try {
      const res = await getBalanceSheet({ period });
      console.log("BALANCE SHEET:", res);

      // normalize single object into array
      const normalized = Array.isArray(res)
        ? res
        : [{ label: "Current", ...res }];

      setData(normalized);

    } catch (err) {
      console.error("Error loading balance sheet:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, [period]);

  if (!data.length) {
    return (
      <Layout title="Balance Sheet">
        <p>Loading...</p>
      </Layout>
    );
  }

  const getAccounts = (section) => {

  const accounts = new Set();

  data.forEach((report) => {

    const items =
      (report.data || report)
        .line_items?.[section] || {};

    Object.keys(items).forEach(acc =>
      accounts.add(acc)
    );

  });

  return Array.from(accounts);
};

  return (
    <Layout title="Balance Sheet">

      {/* PERIOD SELECTOR */}
      <div style={{ marginBottom: "20px" }}>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          style={{
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            minWidth: "200px"
          }}
        >
          <option value="monthly">Monthly</option>
          <option value="quarterly">Quarterly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>

      <div className="card" style={{ padding: "20px" }}>

        <h2 style={{ marginBottom: "20px" }}>
          Balance Sheet
        </h2>

        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Account</th>

              {data.map((report) => (
                <th key={report.label} style={thStyle}>
                  {report.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>

            {/* ================= CURRENT ASSETS ================= */}
            <tr>
              <td colSpan={data.length + 1} style={sectionStyle}>
                Current Assets
              </td>
            </tr>

            {getAccounts("current_assets").map((account) => (
              <tr key={account}>
                <td style={tdStyle}>
                  {formatName(account)}
                </td>

                {data.map((report) => (
                  <td style={tdStyle}>
                    {formatNumber(
                      (report.data || report).line_items?.current_assets?.[account]
                    )}
                  </td>
                ))}
              </tr>
            ))}

            {/* ================= NON CURRENT ASSETS ================= */}
            <tr>
              <td colSpan={data.length + 1} style={sectionStyle}>
                Non Current Assets
              </td>
            </tr>

            {getAccounts("non_current_assets").map((account) => (
              <tr key={account}>
                <td style={tdStyle}>
                  {formatName(account)}
                </td>

                {data.map((report) => (
                  <td style={tdStyle}>
                    {formatNumber(
                      (report.data || report).line_items?.non_current_assets?.[account]
                    )}
                  </td>
                ))}
              </tr>
            ))}

            {/* ================= TOTAL ASSETS ================= */}
            <tr style={totalRow}>
              <td style={tdStyle}>Total Assets</td>

              {data.map((report) => (
                <td style={tdStyle}>
                  {formatNumber((report.data || report).summary?.total_assets)}
                </td>
              ))}
            </tr>

            {/* ================= CURRENT LIABILITIES ================= */}
            <tr>
              <td colSpan={data.length + 1} style={sectionStyle}>
                Current Liabilities
              </td>
            </tr>

            {getAccounts("current_liabilities").map((account) => (
              <tr key={account}>
                <td style={tdStyle}>
                  {formatName(account)}
                </td>

                {data.map((report) => (
                  <td style={tdStyle}>
                    {formatNumber(
                      (report.data || report).line_items?.current_liabilities?.[account]
                    )}
                  </td>
                ))}
              </tr>
            ))}

            {/* ================= NON CURRENT LIABILITIES ================= */}
            <tr>
              <td colSpan={data.length + 1} style={sectionStyle}>
                Non Current Liabilities
              </td>
            </tr>

            {getAccounts("non_current_liabilities").map((account) => (
              <tr key={account}>
                <td style={tdStyle}>
                  {formatName(account)}
                </td>

                {data.map((report) => (
                  <td style={tdStyle}>
                    {formatNumber(
                      (report.data || report).line_items?.non_current_liabilities?.[account]
                    )}
                  </td>
                ))}
              </tr>
            ))}

            {/* ================= EQUITY ================= */}
            <tr style={totalRow}>
              <td style={tdStyle}>Equity</td>

              {data.map((report) => (
                <td style={tdStyle}>
                  {formatNumber((report.data || report).summary?.equity)}
                </td>
              ))}
            </tr>

            {/* ================= TOTAL LIABILITIES ================= */}
            <tr style={totalRow}>
              <td style={tdStyle}>Total Liabilities</td>

              {data.map((report) => (
                <td style={tdStyle}>
                  {formatNumber((report.data || report).summary?.total_liabilities)}
                </td>
              ))}
            </tr>

            {/* ================= BALANCE CHECK ================= */}
            <tr style={balanceCheckRow}>
              <td style={tdStyle}>Balance Check</td>

              {data.map((report) => (
                <td style={tdStyle}>
                  {formatNumber((report.data || report).summary?.balance_check)}
                </td>
              ))}
            </tr>

          </tbody>
        </table>

      </div>

    </Layout>
  );
}

/* ================= STYLES ================= */

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse"
};

const thStyle = {
  textAlign: "left",
  padding: "12px",
  borderBottom: "1px solid #ddd",
  background: "#f8f9fa",
  fontWeight: "600"
};

const tdStyle = {
  padding: "10px",
  borderBottom: "1px solid #eee"
};

const sectionStyle = {
  padding: "12px",
  background: "#f3f4f6",
  fontWeight: "700",
  fontSize: "15px"
};

const totalRow = {
  fontWeight: "700",
  background: "#fafafa"
};

const balanceCheckRow = {
  fontWeight: "700",
  background: "#f5f5f5"
};

/* ================= HELPERS ================= */

function formatNumber(num) {
  if (!num) return "0";

  return Number(num).toLocaleString("en-IN");
}

function formatName(name) {
  return name
    .replace(/_/g, " ")
    .replace(/\b\w/g, c => c.toUpperCase());
}