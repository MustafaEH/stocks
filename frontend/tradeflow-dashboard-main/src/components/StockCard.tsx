import { useNavigate } from "react-router-dom";
import { Stock } from "@/lib/api";
import { StockLogo } from "@/components/StockLogo";
import { Sparkline } from "@/components/Sparkline";
import { Button } from "@/components/ui/button";
import { fmtMoney, fmtPct } from "@/lib/format";

// Generate sparkline data from price history (simplified)
const generateSparkline = (price: number): number[] => {
  const out: number[] = [];
  let p = price * 0.97;
  for (let i = 0; i < 24; i++) {
    p += (Math.random() - 0.45) * price * 0.02;
    out.push(+p.toFixed(2));
  }
  out[out.length - 1] = price;
  return out;
};

export const StockCard = ({ stock, onBuy }: { stock: Stock; onBuy: (s: string) => void }) => {
  const nav = useNavigate();
  const positive = (stock.changePct ?? 0) >= 0;
  const sparklineData = generateSparkline(stock.price);

  return (
    <div className="gradient-card border border-border rounded-2xl p-4 hover:border-primary/40 hover:shadow-elegant transition group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <StockLogo symbol={stock.symbol} />
          <div className="min-w-0">
            <div className="font-display font-semibold">{stock.symbol}</div>
            <div className="text-xs text-muted-foreground truncate">{stock.name}</div>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="font-mono font-semibold">{fmtMoney(stock.price)}</div>
          <div className={`text-xs font-medium ${positive ? "text-profit" : "text-loss"}`}>{fmtPct(stock.changePct ?? 0)}</div>
        </div>
      </div>
      <div className="h-12 mb-3">
        <Sparkline data={sparklineData} positive={positive} />
      </div>
      <div className="flex gap-2">
        <Button size="sm" className="flex-1 bg-profit/10 text-profit hover:bg-profit hover:text-primary-foreground border border-profit/20" onClick={() => onBuy(stock.symbol)}>
          Buy
        </Button>
        <Button size="sm" variant="outline" className="flex-1" onClick={() => nav(`/stock/${stock.symbol}`)}>
          View
        </Button>
      </div>
    </div>
  );
};
