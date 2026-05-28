import { useEffect, useState } from "react";
import { getCashFlow } from "../services/api";
import "./cashflow.css";

export default function CashFlow() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const load = async () => {
      const res = await getCashFlow();
      setData(res);
    };
    load();
  }, []);

  if (!data) return <div className="loading">Loading...</div>;

  const { summary, line_items } = data;

  const renderLineItems = (items, indent = false) => {
    return Object.entries(items).map(([key, val]) => (
      <div className={`row ${indent ? "indent" : ""}`} key={key}>
        <span className="label">{formatLabel(key)}</span>
        <span className="value">{formatNumber(val)}</span>
      </div>
    ));
  };

  return (
    <div className="cf-container">
      <h1 className="title">Cash Flow Statement</h1>

      {/* OPERATING */}
      <section>
        <h2>Operating Activities</h2>

        <div className="row bold">
          <span>Net Profit</span>
          <span>{formatNumber(line_items.operating.net_profit)}</span>
        </div>

        <div className="row">
          <span>Depreciation</span>
          <span>{formatNumber(line_items.operating.depreciation)}</span>
        </div>

        <div className="sub-section">
          <div className="sub-title">Change in Current Assets</div>
          {renderLineItems(line_items.operating.change_in_current_assets, true)}
        </div>

        <div className="sub-section">
          <div className="sub-title">Change in Current Liabilities</div>
          {renderLineItems(line_items.operating.change_in_current_liabilities, true)}
        </div>

        <div className="row total">
          <span>Net Cash from Operating Activities</span>
          <span>{formatNumber(summary.operating_cash_flow)}</span>
        </div>
      </section>

      {/* INVESTING */}
      <section>
        <h2>Investing Activities</h2>

        {renderLineItems(line_items.investing)}

        <div className="row total">
          <span>Net Cash from Investing Activities</span>
          <span>{formatNumber(summary.investing_cash_flow)}</span>
        </div>
      </section>

      {/* FINANCING */}
      <section>
        <h2>Financing Activities</h2>

        {renderLineItems(line_items.financing)}

        <div className="row total">
          <span>Net Cash from Financing Activities</span>
          <span>{formatNumber(summary.financing_cash_flow)}</span>
        </div>
      </section>

      {/* FINAL */}
      <div className="grand-total">
        <span>Net Increase in Cash</span>
        <span>{formatNumber(summary.net_cash_flow)}</span>
      </div>
    </div>
  );
}

// helpers
const formatNumber = (num) => {
  if (!num) return "-";
  return num < 0
    ? `(${Math.abs(num).toLocaleString()})`
    : num.toLocaleString();
};

const formatLabel = (str) =>
  str.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());