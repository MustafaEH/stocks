import { STOCKS } from "@/data/stocks";
import { fmtPct } from "@/lib/format";

export const Ticker = () => {
  const items = [...STOCKS, ...STOCKS];
  return (
    <div className="overflow-hidden border-y border-border/60 bg-background/40 backdrop-blur">
      <div className="flex gap-8 py-3 ticker-track whitespace-nowrap">
        {items.map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-sm font-mono">
            <span className="font-semibold text-foreground">{s.symbol}</span>
            <span className="text-muted-foreground">${s.price.toFixed(2)}</span>
            <span className={s.changePct >= 0 ? "text-profit" : "text-loss"}>{fmtPct(s.changePct)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
