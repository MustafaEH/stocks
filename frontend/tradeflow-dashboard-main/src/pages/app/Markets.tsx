import { useMemo, useState } from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StockLogo } from "@/components/StockLogo";
import { fmtMoney, fmtPct } from "@/lib/format";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { TradeDialog } from "@/components/trade/TradeDialog";
import { cn } from "@/lib/utils";

type Sector = "Tech" | "Energy" | "Finance" | "Healthcare";
const FILTERS: ("All" | Sector)[] = ["All", "Tech", "Energy", "Finance", "Healthcare"];

const Markets = () => {
  const { stocks, loading } = usePortfolio();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [tradeSym, setTradeSym] = useState<string | null>(null);
  const nav = useNavigate();

  const filtered = useMemo(
    () =>
      stocks.filter((s) => filter === "All" || s.sector === filter).filter(
        (s) => s.symbol.toLowerCase().includes(q.toLowerCase()) || s.name.toLowerCase().includes(q.toLowerCase())
      ),
    [stocks, q, filter]
  );

  if (loading) {
    return (
      <div className="space-y-6 max-w-[1400px] mx-auto">
        <div>
          <h1 className="font-display text-3xl font-bold mb-1">Markets</h1>
          <p className="text-muted-foreground">Browse all available stocks</p>
        </div>
        <div className="py-12 text-center text-muted-foreground">Loading stocks...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="font-display text-3xl font-bold mb-1">Markets</h1>
        <p className="text-muted-foreground">Browse all available stocks</p>
      </div>

      <div className="flex flex-col md:flex-row gap-3 md:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by symbol or company" className="pl-9" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-sm font-medium border transition",
                filter === f
                  ? "gradient-primary text-primary-foreground border-transparent shadow-glow"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border gradient-card overflow-hidden">
        <div className="grid grid-cols-12 px-5 py-3 text-xs uppercase tracking-wide text-muted-foreground border-b border-border bg-background/40">
          <div className="col-span-5 md:col-span-4">Symbol</div>
          <div className="col-span-3 md:col-span-3 text-right">Price</div>
          <div className="col-span-4 md:col-span-2 text-right">Change</div>
          <div className="hidden md:block md:col-span-3 text-right">Actions</div>
        </div>
        <div className="divide-y divide-border">
          {filtered.map((s) => {
            const positive = (s.changePct ?? 0) >= 0;
            return (
              <div key={s.symbol} className="grid grid-cols-12 items-center px-5 py-3 hover:bg-muted/30 transition">
                <div className="col-span-5 md:col-span-4 flex items-center gap-3 min-w-0">
                  <StockLogo symbol={s.symbol} size={36} />
                  <div className="min-w-0">
                    <div className="font-semibold">{s.symbol}</div>
                    <div className="text-xs text-muted-foreground truncate">{s.name}</div>
                  </div>
                </div>
                <div className="col-span-3 md:col-span-3 text-right font-mono">{fmtMoney(s.price)}</div>
                <div className={`col-span-4 md:col-span-2 text-right font-medium ${positive ? "text-profit" : "text-loss"}`}>{fmtPct(s.changePct ?? 0)}</div>
                <div className="hidden md:flex md:col-span-3 justify-end gap-2">
                  <Button size="sm" className="bg-profit/10 text-profit hover:bg-profit hover:text-primary-foreground border border-profit/20" onClick={() => setTradeSym(s.symbol)}>Buy</Button>
                  <Button size="sm" variant="outline" onClick={() => nav(`/stock/${s.symbol}`)}>Details</Button>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && <div className="py-12 text-center text-muted-foreground">No stocks found.</div>}
        </div>
      </div>

      <TradeDialog symbol={tradeSym} mode="BUY" open={!!tradeSym} onOpenChange={(v) => !v && setTradeSym(null)} />
    </div>
  );
};

export default Markets;
