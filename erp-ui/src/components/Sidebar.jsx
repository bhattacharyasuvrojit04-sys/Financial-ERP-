import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {

  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navItem = (path) => `
    flex items-center px-3 py-2 rounded-lg text-sm transition
    ${
      isActive(path)
        ? "bg-white/15 text-white font-medium"
        : "text-white/80 hover:bg-white/10 hover:text-white"
    }
  `;

  return (
    <aside className="w-[240px] bg-[#0F6E56] text-white h-screen flex flex-col">

      {/* BRAND */}
      <div className="px-5 py-5 border-b border-white/10">

        <div className="flex items-center gap-2">

          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <span className="text-[#0F6E56] font-bold text-sm">
              F
            </span>
          </div>

          <div>
            <h1 className="font-semibold text-sm">
              ERP
            </h1>

            <p className="text-[10px] text-white/60">
              Finance Platform
            </p>
          </div>

        </div>

      </div>


      {/* NAVIGATION */}
      <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-6">


        {/* WORKSPACE */}
        <Section title="WORKSPACE">

          <Link to="/" className={navItem("/")}>
            Dashboard
          </Link>

        </Section>


        {/* ACCOUNTING */}
        <Section title="ACCOUNTING">

          <Link
            to="/accounting"
            className={navItem("/accounting")}
          >
            Overview
          </Link>

          <Link
            to="/accounting/chart-of-accounts"
            className={navItem("/accounting/chart-of-accounts")}
          >
            Chart of Accounts
          </Link>

          <Link
            to="/accounting/journal"
            className={navItem("/accounting/journal")}
          >
            Journal
          </Link>

          <Link
            to="/accounting/general-ledger"
            className={navItem("/accounting/general-ledger")}
          >
            General Ledger
          </Link>

          <Link
            to="/accounting/trial-balance"
            className={navItem("/accounting/trial-balance")}
          >
            Trial Balance
          </Link>

        </Section>


        {/* REPORTING */}
        <Section title="REPORTING">

          <Link to="/pnl" className={navItem("/pnl")}>
            P&L Statement
          </Link>

          <Link
            to="/balance-sheet"
            className={navItem("/balance-sheet")}
          >
            Balance Sheet
          </Link>

          <Link
            to="/cashflow"
            className={navItem("/cashflow")}
          >
            Cash Flow
          </Link>

          <Link
            to="/ratios"
            className={navItem("/ratios")}
          >
            Ratio Analysis
          </Link>

          <Link
            to="/forecast"
            className={navItem("/forecast")}
          >
            Forecast
          </Link>

        </Section>


        {/* TRANSACTIONS */}
        <Section title="TRANSACTIONS">

          <Link
            to="/transactions"
            className={navItem("/transactions")}
          >
            Transactions
          </Link>

        </Section>


        {/* ANALYTICS */}
        <Section title="ANALYTICS">

          <Link
            to="/ai-analysis"
            className={navItem("/ai-analysis")}
          >
            AI Analysis
          </Link>

          <Link
            to="/ai-pitch-deck"
            className={navItem("/ai-pitch-deck")}
          >
            AI Pitch Deck
          </Link>

          <Link
            to="/dcf"
            className={navItem("/dcf")}
          >
            DCF Valuation
          </Link>

        </Section>


        {/* FINANCIAL MODELLING */}
        <Section title="FINANCIAL MODELLING">

          <Link
            to="/project-finance"
            className={navItem("/project-finance")}
          >
            Project Finance
          </Link>

        </Section>


        {/* ADMIN */}
        <Section title="ADMINISTRATION">

          <Link
            to="/account"
            className={navItem("/account")}
          >
            Account
          </Link>

        </Section>

      </nav>


      {/* FOOTER */}
      <div className="px-4 py-4 border-t border-white/10">

        <div className="text-xs text-white/50">
          Finance ERP
        </div>

        <div className="text-[10px] text-white/40 mt-1">
          v2.0
        </div>

      </div>

    </aside>
  );
}


/* SECTION COMPONENT */

function Section({ title, children }) {

  return (
    <div>

      <div className="px-3 mb-2 text-[10px] tracking-wider font-semibold text-white/40">
        {title}
      </div>

      <div className="space-y-1">
        {children}
      </div>

    </div>
  );
}