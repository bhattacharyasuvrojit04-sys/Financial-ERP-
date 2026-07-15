import { Link } from "react-router-dom"; 

export default function Layout({ children, title }) {
  return (
    <div style={{
      display: "flex",
      height: "100vh"
    }}>

      {/* SIDEBAR */}
      <div className="sidebar">
        <h2>ERP</h2>

        <Link to="/">Dashboard</Link>
        <Link to="/reports">Reports</Link>
        <Link to="/pnl">P&L Statement</Link>
        <Link to="/cashflow">Cash Flow</Link>
        <Link to="/balance-sheet">Balance Sheet</Link>
        <a href="/ratios">Ratio Analysis</a>
        <Link to="/project-finance">Project Finance</Link>
        <a href="/transactions">Transactions</a>
        <a href="/ai-analysis">AI Analysis</a>
        <a href="/ai-pitch-deck">AI Pitch Deck</a>



        {/* 🔥 NEW DCF FEATURE */}
        <Link to="/dcf">DCF Valuation</Link>

        <Link to="/account">Account</Link>
      </div>

      {/* MAIN */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column"
      }}>

        {/* TOPBAR */}
        <div className="topbar">
          <h1>{title}</h1>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <span>{new Date().toLocaleDateString()}</span>
            <div style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: "#ddd"
            }} />
          </div>
        </div>

        {/* CONTENT */}
        <div style={{
          padding: "20px",
          flex: 1,
          overflowY: "auto"
        }}>
          {children}
        </div>

      </div>
    </div>
  );
}