import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="w-[220px] bg-[#0F6E56] text-white h-screen p-5">

      {/* LOGO */}
      <h2 className="text-lg font-medium mb-8">ERP</h2>

      {/* NAV */}
      <nav className="space-y-3 text-sm">

        <Link to="/" className="block hover:opacity-80">Dashboard</Link>
        <Link to="/reports" className="block hover:opacity-80">Reports</Link>
        <Link to="/pnl" className="block hover:opacity-80">P&L Statement</Link>
        <Link to="/cashflow" className="block hover:opacity-80">Cash Flow</Link>
        <Link to="/balance-sheet" className="block hover:opacity-80">Balance Sheet</Link>
        <Link to="/forecast" className="block hover:opacity-80">Forecast</Link>

      </nav>
    </div>
  );
}