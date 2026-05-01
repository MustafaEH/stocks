import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { generateChart, getStock } from "@/data/stocks";
import { StockLogo } from "@/components/StockLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { fmtCompact, fmtMoney, fmtPct } from "@/lib/format";
import { TradeDialog } from "@/components/trade/TradeDialog";
import { ArrowLeft } from "lucide-react";
import { usePortfolio } from "@/context/PortfolioContext";

type Range = "1D" | "1W" | "1M" | "1Y" | "All";

const StockDetail = () => {
  const { symbol = "" } = useParams();
  const nav = useNavigate();
  const stock = getStock(symbol.toUpperCase());
  const [range, setRange] = useState<Range>("1M");
  const [qty, setQty] = useState(1);
  const [trade, setTrade] = useState<{ open: boolean; mode: "BUY" | "SELL" }>({ open: false, mode: "BUY" });
  const { holdings } = usePortfolio();

  const data = useMemo(() => (stock ? generateChart(stock.symbol, range) : []), [stock, range]);

  if (!stock) {
    return <div className="text-center py-20"><p className="text-muted-foreground">Stock not found.</p></div>;
  }

  const positive = stock.changePct >= 0;
  const stroke = positive ? "hsl(var(--profit))" : "hsl(var(--loss))";
  const owned = holdings.find((h) => h.symbol === stock.symbol);

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <button onClick={() => nav(-1)} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <StockLogo symbol={stock.symbol} size={56} />
          <div>
            <h1 className="font-display text-3xl font-bold">{stock.name}</h1>
            <div className="flex items-center gap-3 text-muted-foreground">
              <span className="font-mono">{stock.symbol}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-muted/40 border border-border/60">{stock.sector}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-display text-3xl font-bold font-mono">{fmtMoney(stock.price)}</div>
          <div className={`font-medium ${positive ? "text-profit" : "text-loss"}`}>{fmtPct(stock.changePct)} today</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 gradient-card border border-border rounded-2xl p-5">
          <Tabs value={range} onValueChange={(v) => setRange(v as Range)}>
            <TabsList className="bg-muted/40">
              {(["1D", "1W", "1M", "1Y", "All"] as Range[]).map((r) => (
                <TabsTrigger key={r} value={r} className="data-[state=active]:gradient-primary data-[state=active]:text-primary-foreground">{r}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <div className="h-80 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={stroke} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={stroke} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="t" hide />
                <YAxis domain={["auto", "auto"]} hide />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12 }}
                  formatter={(v: number) => fmtMoney(v)}
                  labelFormatter={() => ""}
                />
                <Area type="monotone" dataKey="price" stroke={stroke} strokeWidth={2.5} fill="url(#chartGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
            <Stat label="Day high" value={fmtMoney(stock.high)} />
            <Stat label="Day low" value={fmtMoney(stock.low)} />
            <Stat label="Volume" value={fmtCompact(stock.volume)} />
            <Stat label="Market cap" value={stock.marketCap} />
          </div>
        </div>

        <div className="gradient-card border border-border rounded-2xl p-5 space-y-4 h-fit">
          <div>
            <h3 className="font-display font-semibold text-lg mb-1">Trade {stock.symbol}</h3>
            <p className="text-sm text-muted-foreground">{owned ? `You own ${owned.shares} shares` : "Place a market order"}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dq">Quantity</Label>
            <Input id="dq" type="number" min={1} value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))} />
          </div>
          <div className="rounded-xl bg-muted/40 border border-border/60 p-3 flex justify-between text-sm">
            <span className="text-muted-foreground">Estimated total</span>
            <span className="font-mono font-bold">{fmtMoney(qty * stock.price)}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={() => setTrade({ open: true, mode: "BUY" })} className="bg-profit text-primary-foreground hover:bg-profit/90">Buy</Button>
            <Button onClick={() => setTrade({ open: true, mode: "SELL" })} variant="outline" disabled={!owned} className="border-loss/40 text-loss hover:bg-loss hover:text-destructive-foreground">Sell</Button>
          </div>
        </div>
      </div>

      <TradeDialog symbol={stock.symbol} mode={trade.mode} open={trade.open} onOpenChange={(v) => setTrade((t) => ({ ...t, open: v }))} />
    </div>
  );
};

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div>
    <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
    <div className="font-mono font-semibold mt-1">{value}</div>
  </div>
);

export default StockDetail;
