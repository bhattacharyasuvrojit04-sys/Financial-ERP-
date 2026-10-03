import React from "react";
import { NavLink, useLocation } from "react-router-dom";

import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Landmark,
  Receipt,
  Scale,
  BarChart3,
  Wallet,
  TrendingUp,
  Sparkles,
  Presentation,
  Calculator,
  FolderKanban,
  ArrowLeftRight,
  UserCircle,
  Settings,
  ChevronRight,
  ChevronDown,
  Menu,
  Search,
  Bell,
  CalendarDays,
  PanelLeftClose,
  PanelLeftOpen,
  Boxes,
  Database
} from "lucide-react";

import "../App.css";


const navigation = [
  {
    section: "WORKSPACE",
    items: [
      {
        name: "Dashboard",
        path: "/",
        icon: LayoutDashboard,
      },
    ],
  },

    {
    section: "ACCOUNTING",
    items: [
      {
        name: "Overview",
        path: "/accounting",
        icon: BookOpen,
      },
      {
        name: "Chart of Accounts",
        path: "/chart-of-accounts",
        icon: FileText,
      },
      {
        name: "Journal",
        path: "/journal",
        icon: Receipt,
      },
      {
        name: "General Ledger",
        path: "/general-ledger",
        icon: Landmark,
      },
      {
        name: "Trial Balance",
        path: "/trial-balance",
        icon: Scale,
      },
      {
        name: "Inventory",
        path: "/inventory",
        icon: Boxes
        },
      {
        name: "Masters",
        path: "/accounting/masters",
        icon: Database,
      },
      {
        name: "Fixed Assets",
        path: "/fixed-assets",
        icon: FolderKanban,
      },
      {
        name: "Depreciation",
        path: "/depreciation",
        icon: TrendingUp,
      },
    ],
  },

  {
    section: "REPORTING",
    items: [
      {
        name: "P&L Statement",
        path: "/pnl",
        icon: BarChart3,
      },
      {
        name: "Balance Sheet",
        path: "/balance-sheet",
        icon: Scale,
      },
      {
        name: "Cash Flow",
        path: "/cashflow",
        icon: Wallet,
      },
      {
        name: "Ratio Analysis",
        path: "/ratios",
        icon: Calculator,
      },
      {
        name: "Forecast",
        path: "/forecast",
        icon: TrendingUp,
      },
    ],
  },

  {
    section: "ANALYTICS",
    items: [
      {
        name: "AI Analysis",
        path: "/ai-analysis",
        icon: Sparkles,
      },
      {
        name: "AI Pitch Deck",
        path: "/ai-pitch-deck",
        icon: Presentation,
      },
      {
        name: "DCF Valuation",
        path: "/dcf",
        icon: Calculator,
      },
    ],
  },

  {
    section: "FINANCIAL MODELLING",
    items: [
      {
        name: "Project Finance",
        path: "/project-finance",
        icon: FolderKanban,
      },
    ],
  },

  {
    section: "TRANSACTIONS",
    items: [
      {
        name: "Transactions",
        path: "/transactions",
        icon: ArrowLeftRight,
      },
    ],
  },

  {
    section: "ADMINISTRATION",
    items: [
      {
        name: "Account",
        path: "#",
        icon: UserCircle,
      },
      {
        name: "Settings",
        path: "#",
        icon: Settings,
      },
    ],
  },
];


function Sidebar({ collapsed, setCollapsed }) {
  return (
    <aside className={`sidebar ${collapsed ? "sidebar-collapsed" : ""}`}>

      {/* LOGO */}
      <div className="sidebar-brand">

        <div className="brand-icon">
          <span>◇</span>
        </div>

        {!collapsed && (
          <div className="brand-text">
            <div className="brand-title">FINOXIN</div>
            <div className="brand-subtitle">Finance ERP</div>
          </div>
        )}

      </div>


      {/* NAVIGATION */}
      <div className="sidebar-navigation">

        {navigation.map((group) => (
          <div className="nav-group" key={group.section}>

            {!collapsed && (
              <div className="nav-section-title">
                {group.section}
              </div>
            )}

            {group.items.map((item) => {

              const Icon = item.icon;

              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `nav-item ${isActive ? "active" : ""}`
                  }
                  title={collapsed ? item.name : ""}
                >

                  <Icon size={17} strokeWidth={1.8} />

                  {!collapsed && (
                    <>
                      <span>{item.name}</span>

                      {item.name === "Overview" && (
                        <ChevronRight
                          className="nav-chevron"
                          size={14}
                        />
                      )}
                    </>
                  )}

                </NavLink>
              );
            })}

          </div>
        ))}

      </div>


      {/* WORKSPACE CARD */}
      {!collapsed && (
        <div className="workspace-card">

          <div className="workspace-label">
            Workspace
          </div>

          <div className="workspace-name">
            Finance ERP
          </div>

          <div className="workspace-version">
            Version 2.0
          </div>

        </div>
      )}


      {/* COLLAPSE BUTTON */}
      <button
        className="sidebar-collapse"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? (
          <PanelLeftOpen size={17} />
        ) : (
          <PanelLeftClose size={17} />
        )}
      </button>

    </aside>
  );
}


function Topbar({ onMenuClick }) {

  const location = useLocation();

  const currentPage =
    navigation
      .flatMap((group) => group.items)
      .find((item) => item.path === location.pathname);

  const title =
    currentPage?.name || "Dashboard";


  return (
    <header className="topbar">

      {/* LEFT */}
      <div className="topbar-left">

        <button
          className="mobile-menu-button"
          onClick={onMenuClick}
        >
          <Menu size={20} />
        </button>

        <div className="page-title">
          {title}
        </div>

      </div>


      {/* SEARCH */}
      <div className="topbar-search">

        <Search size={16} />

        <input
          type="text"
          placeholder="Search anything..."
        />

        <span className="search-shortcut">
          Ctrl + K
        </span>

      </div>


      {/* RIGHT */}
      <div className="topbar-right">

        <button className="topbar-date">
          <CalendarDays size={16} />
          <span>2 Sep 2026</span>
        </button>


        <button className="notification-button">

          <Bell size={18} />

          <span className="notification-badge">
            3
          </span>

        </button>


        <div className="user-profile">

          <div className="avatar">
            AD
          </div>

          <div className="user-info">

            <div className="user-name">
              Admin
            </div>

            <div className="user-role">
              Administrator
            </div>

          </div>

          <ChevronDown size={15} />

        </div>

      </div>

    </header>
  );
}


export default function Layout({ children }) {

  const [collapsed, setCollapsed] = React.useState(false);

  const [mobileOpen, setMobileOpen] = React.useState(false);


  return (
    <div className="erp-layout">

      <div
        className={`sidebar-wrapper ${
          mobileOpen ? "mobile-open" : ""
        }`}
      >

        <Sidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />

      </div>


      {mobileOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}


      <div
        className={`erp-main ${
          collapsed ? "main-expanded" : ""
        }`}
      >

        <Topbar
          onMenuClick={() =>
            setMobileOpen(!mobileOpen)
          }
        />


        <main className="erp-content">

          {children}

        </main>

      </div>

    </div>
  );
}