import { useMemo, useState } from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { Input } from "@/components/ui/input";
import { fmtMoney } from "@/lib/format";
import { Search, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";

type Filter = "all" | "buy" | "sell";

const Transactions = () => {
  const { transactions } = usePortfolio();
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");

  const filtered = useMemo(
    () =>
      transactions
        .filter((t) => filter === "all" || t.type.toLowerCase() === filter)
        .filter((t) => t.symbol.toLowerCase().includes(q.toLowerCase())),
    [transactions, filter, q]
  );

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      <div>
        <h1 className="font-display text-3xl font-bold mb-1">Transactions</h1>
        <p className="text-muted-foreground">Your complete trading history</p>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search symbol..." className="pl-9" />
        </div>
        <div className="flex gap-2">
          {(["all", "buy", "sell"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium border capitalize transition",
                filter === f ? "gradient-primary text-primary-foreground border-transparent shadow-glow" : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl gradient-card border border-border overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Receipt className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">No transactions yet.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-12 px-5 py-3 text-xs uppercase tracking-wide text-muted-foreground border-b border-border bg-background/40">
              <div className="col-span-2">Type</div>
              <div className="col-span-2">Symbol</div>
              <div className="col-span-2 text-right">Qty</div>
              <div className="col-span-2 text-right">Price</div>
              <div className="col-span-2 text-right">Total</div>
              <div className="col-span-2 text-right">Date</div>
            </div>
            <div className="divide-y divide-border">
              {filtered.map((t) => (
                <div key={t.id} className="grid grid-cols-12 items-center px-5 py-3 hover:bg-muted/30 transition text-sm">
                  <div className="col-span-2">
                    <span className={cn(
                      "px-2.5 py-1 rounded-full text-xs font-semibold",
                      t.type === "BUY" ? "bg-profit/15 text-profit" : "bg-loss/15 text-loss"
                    )}>
                      {t.type}
                    </span>
                  </div>
                  <div className="col-span-2 font-mono font-semibold">{t.symbol}</div>
                  <div className="col-span-2 text-right font-mono">{t.qty}</div>
                  <div className="col-span-2 text-right font-mono">{fmtMoney(t.price)}</div>
                  <div className="col-span-2 text-right font-mono font-semibold">{fmtMoney(t.total)}</div>
                  <div className="col-span-2 text-right text-xs text-muted-foreground">{new Date(t.date).toLocaleDateString()} {new Date(t.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Transactions;
