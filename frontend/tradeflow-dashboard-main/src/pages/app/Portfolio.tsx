import { useMemo, useState } from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { getStock } from "@/data/stocks";
import { StockLogo } from "@/components/StockLogo";
import { Button } from "@/components/ui/button";
import { fmtMoney, fmtPct } from "@/lib/format";
import { Briefcase, DollarSign, TrendingUp, Wallet } from "lucide-react";
import { Area, AreaChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TradeDialog } from "@/components/trade/TradeDialog";
import { useNavigate } from "react-router-dom";

const COLORS = ["#22C55E", "#3B82F6", "#A78BFA", "#F59E0B", "#EF4444", "#14B8A6", "#F472B6", "#0EA5E9"];

const Portfolio = () => {
  const { holdings, marketValue, invested, unrealized, unrealizedPct } = usePortfolio();
  const [sellSym, setSellSym] = useState<string | null>(null);
  const nav = useNavigate();

  const allocation = holdings.map((h, i) => {
    const s = getStock(h.symbol);
    return { name: h.symbol, value: (s?.price ?? 0) * h.shares, color: COLORS[i % COLORS.length] };
  });

  const growth = useMemo(() => {
    const data = [];
    let v = invested || 10000;
    for (let i = 0; i < 30; i++) {
      v += (Math.random() - 0.4) * (invested || 10000) * 0.012;
      data.push({ d: i, v: +v.toFixed(2) });
    }
    if (data.length) data[data.length - 1].v = marketValue || invested || 10000;
    return data;
  }, [invested, marketValue]);

  const positive = unrealized >= 0;

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="font-display text-3xl font-bold mb-1">Portfolio</h1>
        <p className="text-muted-foreground">Track your holdings and performance</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Summary icon={Wallet} label="Total invested" value={fmtMoney(invested)} />
        <Summary icon={Briefcase} label="Market value" value={fmtMoney(marketValue)} />
        <Summary icon={DollarSign} label="Unrealized P/L" value={fmtMoney(unrealized)} sub={fmtPct(unrealizedPct)} positive={positive} highlight />
        <Summary icon={TrendingUp} label="Positions" value={String(holdings.length)} />
      </div>

      {holdings.length === 0 ? (
        <div className="rounded-2xl gradient-card border border-border p-12 text-center">
          <TrendingUp className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">You don't own any stocks yet.</p>
          <Button onClick={() => nav("/markets")} className="gradient-primary text-primary-foreground">Explore Markets</Button>
        </div>
      ) : (
        <>
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="gradient-card border border-border rounded-2xl p-5">
              <h3 className="font-display font-semibold mb-4">Allocation</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={allocation} dataKey="value" innerRadius={50} outerRadius={90} paddingAngle={3}>
                      {allocation.map((a, i) => <Cell key={i} fill={a.color} stroke="hsl(var(--background))" strokeWidth={2} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} formatter={(v: number) => fmtMoney(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="gradient-card border border-border rounded-2xl p-5">
              <h3 className="font-display font-semibold mb-4">Portfolio growth</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={growth}>
                    <defs>
                      <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="d" hide />
                    <YAxis domain={["auto", "auto"]} hide />
                    <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} formatter={(v: number) => fmtMoney(v)} labelFormatter={() => ""} />
                    <Area type="monotone" dataKey="v" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#pg)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border gradient-card overflow-hidden">
            <div className="grid grid-cols-12 px-5 py-3 text-xs uppercase tracking-wide text-muted-foreground border-b border-border bg-background/40">
              <div className="col-span-3">Symbol</div>
              <div className="col-span-1 text-right">Shares</div>
              <div className="col-span-2 text-right">Avg buy</div>
              <div className="col-span-2 text-right">Current</div>
              <div className="col-span-2 text-right">Value</div>
              <div className="col-span-2 text-right">P/L</div>
            </div>
            <div className="divide-y divide-border">
              {holdings.map((h) => {
                const s = getStock(h.symbol)!;
                const value = s.price * h.shares;
                const pl = (s.price - h.avgPrice) * h.shares;
                const plPct = ((s.price - h.avgPrice) / h.avgPrice) * 100;
                const pos = pl >= 0;
                return (
                  <div key={h.symbol} className="grid grid-cols-12 items-center px-5 py-3 hover:bg-muted/30 transition">
                    <div className="col-span-3 flex items-center gap-3 min-w-0">
                      <StockLogo symbol={h.symbol} size={36} />
                      <div className="min-w-0">
                        <div className="font-semibold">{h.symbol}</div>
                        <div className="text-xs text-muted-foreground truncate">{s.name}</div>
                      </div>
                    </div>
                    <div className="col-span-1 text-right font-mono">{h.shares}</div>
                    <div className="col-span-2 text-right font-mono">{fmtMoney(h.avgPrice)}</div>
                    <div className="col-span-2 text-right font-mono">{fmtMoney(s.price)}</div>
                    <div className="col-span-2 text-right font-mono font-semibold">{fmtMoney(value)}</div>
                    <div className={`col-span-2 text-right font-mono font-medium ${pos ? "text-profit" : "text-loss"}`}>
                      <div>{pos ? "+" : ""}{fmtMoney(pl)}</div>
                      <div className="text-xs">{fmtPct(plPct)}</div>
                    </div>
                    <div className="col-span-12 mt-2 flex justify-end gap-2 md:hidden">
                      <Button size="sm" variant="outline" onClick={() => setSellSym(h.symbol)} className="border-loss/40 text-loss">Sell</Button>
                    </div>
                    <div className="hidden md:flex col-span-12 justify-end mt-2">
                      <Button size="sm" variant="outline" onClick={() => setSellSym(h.symbol)} className="border-loss/40 text-loss hover:bg-loss hover:text-destructive-foreground">Sell</Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      <TradeDialog symbol={sellSym} mode="SELL" open={!!sellSym} onOpenChange={(v) => !v && setSellSym(null)} />
    </div>
  );
};

const Summary = ({ icon: Icon, label, value, sub, positive, highlight }: any) => (
  <div className="rounded-2xl gradient-card border border-border p-4">
    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2"><Icon className="w-3.5 h-3.5" />{label}</div>
    <div className={`font-display text-2xl font-bold font-mono ${highlight ? (positive ? "text-profit" : "text-loss") : ""}`}>{value}</div>
    {sub && <div className={`text-xs mt-1 ${positive ? "text-profit" : "text-loss"}`}>{sub}</div>}
  </div>
);

export default Portfolio;
