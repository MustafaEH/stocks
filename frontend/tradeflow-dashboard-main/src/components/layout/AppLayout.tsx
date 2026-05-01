import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { usePortfolio } from "@/context/PortfolioContext";
import { Bell, Briefcase, LayoutDashboard, LineChart, LogOut, Receipt, Search, TrendingUp, User as UserIcon, Wallet } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { fmtMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { STOCKS } from "@/data/stocks";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/markets", label: "Markets", icon: LineChart },
  { to: "/portfolio", label: "Portfolio", icon: Briefcase },
  { to: "/deposit", label: "Deposit Funds", icon: Wallet },
  { to: "/transactions", label: "Transactions", icon: Receipt },
  { to: "/profile", label: "Profile", icon: UserIcon },
];

const AppLayout = () => {
  const { user, logout } = useAuth();
  const { balance } = usePortfolio();
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const results = q
    ? STOCKS.filter((s) => s.symbol.toLowerCase().includes(q.toLowerCase()) || s.name.toLowerCase().includes(q.toLowerCase())).slice(0, 6)
    : [];

  const initials = (user?.fullName || user?.username || "?")
    .split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r border-sidebar-border bg-sidebar hidden md:flex flex-col">
        <div className="px-6 py-5 border-b border-sidebar-border">
          <NavLink to="/dashboard" className="flex items-center gap-2 font-display font-bold text-lg">
            <span className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shadow-glow">
              <TrendingUp className="w-4 h-4 text-primary-foreground" />
            </span>
            <span className="text-sidebar-foreground">TradeFlow</span>
          </NavLink>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition group",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-card-soft"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                )
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-sidebar-border">
          <button
            onClick={() => { logout(); nav("/login"); }}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-loss transition"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-30 flex items-center gap-3 px-4 md:px-6">
          <NavLink to="/dashboard" className="md:hidden flex items-center gap-2 font-display font-bold">
            <span className="w-7 h-7 rounded-md gradient-primary flex items-center justify-center"><TrendingUp className="w-3.5 h-3.5 text-primary-foreground" /></span>
            TradeFlow
          </NavLink>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => { setQ(e.target.value); setOpen(true); }}
              onFocus={() => setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 150)}
              placeholder="Search stocks (AAPL, Tesla, ...)"
              className="pl-9 bg-muted/40 border-border/60"
            />
            {open && results.length > 0 && (
              <div className="absolute top-full mt-2 left-0 right-0 glass rounded-xl p-2 shadow-elegant z-50 animate-scale-in">
                {results.map((r) => (
                  <button
                    key={r.symbol}
                    onMouseDown={() => { nav(`/stock/${r.symbol}`); setQ(""); }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-muted/50 text-left text-sm"
                  >
                    <span className="flex items-center gap-3">
                      <span className="font-mono font-semibold">{r.symbol}</span>
                      <span className="text-muted-foreground truncate">{r.name}</span>
                    </span>
                    <span className={r.changePct >= 0 ? "text-profit" : "text-loss"}>
                      ${r.price.toFixed(2)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-sm font-mono px-3 py-1.5 rounded-lg bg-muted/40 border border-border/60">
            <Wallet className="w-3.5 h-3.5 text-primary" />
            <span className="text-muted-foreground">Bal</span>
            <span className="font-semibold">{fmtMoney(balance)}</span>
          </div>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
          </Button>
          <button onClick={() => nav("/profile")} className="w-9 h-9 rounded-full gradient-primary text-primary-foreground font-semibold text-sm flex items-center justify-center shadow-glow">
            {initials}
          </button>
        </header>
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
