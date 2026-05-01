import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePortfolio } from "@/context/PortfolioContext";
import { StockCard } from "@/components/StockCard";
import { TradeDialog } from "@/components/trade/TradeDialog";
import { fmtMoney, fmtPct } from "@/lib/format";
import { ArrowDownRight, ArrowUpRight, Briefcase, DollarSign, TrendingUp, Wallet } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useNavigate } from "react-router-dom";
import { StockLogo } from "@/components/StockLogo";

const PIE_COLORS = ["#22C55E", "#3B82F6", "#A78BFA", "#F59E0B", "#EF4444", "#14B8A6", "#F472B6", "#0EA5E9"];

const Dashboard = () => {
  const { user } = useAuth();
  const { balance, holdings, marketValue, unrealized, unrealizedPct, todayChangePct, stocks, loading } = usePortfolio();
  const [tradeSym, setTradeSym] = useState<string | null>(null);
  const nav = useNavigate();

  const totalValue = balance + marketValue;
  const positive = unrealized >= 0;
  const todayPos = todayChangePct >= 0;

  // Helper to get stock price from stocks array
  const getStockPrice = (symbol: string): number => {
    const stock = stocks.find((s) => s.symbol === symbol);
    return stock?.price ?? 0;
  };

  const allocation = holdings.map((h, i) => {
    const price = getStockPrice(h.symbol);
    return { name: h.symbol, value: price * h.shares, color: PIE_COLORS[i % PIE_COLORS.length] };
  });

  if (loading) {
    return (
      <div className="space-y-8 max-w-[1400px] mx-auto">
        <div className="py-12 text-center text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto">
      {/* Hero */}
      <section className="relative rounded-3xl gradient-card border border-border p-6 md:p-8 overflow-hidden shadow-card-soft">
        <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative">
          <p className="text-sm text-muted-foreground">Welcome back,</p>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-6">{user?.full_name || user?.username} 👋</h1>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Stat icon={Wallet} label="Account balance" value={fmtMoney(balance)} />
            <Stat icon={Briefcase} label="Portfolio value" value={fmtMoney(totalValue)} />
            <Stat icon={DollarSign} label="Unrealized P/L" value={fmtMoney(unrealized)} sub={fmtPct(unrealizedPct)} positive={positive} />
            <Stat icon={todayPos ? ArrowUpRight : ArrowDownRight} label="Today's change" value={fmtPct(todayChangePct)} positive={todayPos} highlight />
          </div>
        </div>
      </section>

      {/* Two-column */}
      <section className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">Market Watchlist</h2>
            <button onClick={() => nav("/markets")} className="text-sm text-primary hover:underline">View all</button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {stocks.slice(0, 6).map((s) => (
              <StockCard key={s.symbol} stock={s} onBuy={(sym) => setTradeSym(sym)} />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="font-display text-xl font-semibold">Portfolio Snapshot</h2>
          <div className="gradient-card border border-border rounded-2xl p-5">
            {holdings.length === 0 ? (
              <div className="py-10 text-center">
                <TrendingUp className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-4">No positions yet. Start building your portfolio.</p>
                <button onClick={() => nav("/markets")} className="text-sm text-primary hover:underline">Browse markets →</button>
              </div>
            ) : (
              <>
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={allocation} dataKey="value" innerRadius={45} outerRadius={75} paddingAngle={3}>
                        {allocation.map((a, i) => <Cell key={i} fill={a.color} stroke="hsl(var(--background))" strokeWidth={2} />)}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12 }}
                        formatter={(v: number) => fmtMoney(v)}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-3">
                  {holdings.slice(0, 4).map((h) => {
                    const price = getStockPrice(h.symbol);
                    const value = price * h.shares;
                    const pl = (price - h.avgPrice) * h.shares;
                    const pos = pl >= 0;
                    return (
                      <button key={h.symbol} onClick={() => nav(`/stock/${h.symbol}`)} className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-muted/40 transition">
                        <div className="flex items-center gap-2.5">
                          <StockLogo symbol={h.symbol} size={32} />
                          <div className="text-left">
                            <div className="text-sm font-semibold">{h.symbol}</div>
                            <div className="text-xs text-muted-foreground">{h.shares} sh @ {fmtMoney(h.avgPrice)}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-mono">{fmtMoney(value)}</div>
                          <div className={`text-xs font-medium ${pos ? "text-profit" : "text-loss"}`}>{pos ? "+" : ""}{fmtMoney(pl)}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <TradeDialog symbol={tradeSym} mode="BUY" open={!!tradeSym} onOpenChange={(v) => !v && setTradeSym(null)} />
    </div>
  );
};

const Stat = ({ icon: Icon, label, value, sub, positive, highlight }: { icon: any; label: string; value: string; sub?: string; positive?: boolean; highlight?: boolean }) => (
  <div className="rounded-2xl bg-background/40 border border-border/60 p-4 backdrop-blur">
    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
      <Icon className="w-3.5 h-3.5" />
      {label}
    </div>
    <div className={`font-display text-xl md:text-2xl font-bold font-mono ${highlight ? (positive ? "text-profit" : "text-loss") : ""}`}>
      {value}
    </div>
    {sub && <div className={`text-xs mt-1 ${positive ? "text-profit" : "text-loss"}`}>{sub}</div>}
  </div>
);

export default Dashboard;
