import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePortfolio } from "@/context/PortfolioContext";
import { fmtMoney } from "@/lib/format";
import { StockLogo } from "@/components/StockLogo";
import { toast } from "sonner";

interface Props {
  symbol: string | null;
  mode: "BUY" | "SELL";
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export const TradeDialog = ({ symbol, mode, open, onOpenChange }: Props) => {
  const [qty, setQty] = useState(1);
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const { buy, sell, balance, holdings, stocks } = usePortfolio();
  
  // Get stock from portfolio context (from backend)
  const stock = symbol ? stocks.find((s) => s.symbol === symbol) : null;
  if (!stock) return null;

  const total = stock.price * qty;
  const holding = holdings.find((h) => h.symbol === symbol);

  const reset = () => { setQty(1); setConfirming(false); };
  const close = () => { onOpenChange(false); setTimeout(reset, 200); };

  const onSubmit = async () => {
    if (!confirming) { setConfirming(true); return; }
    setLoading(true);
    const res = mode === "BUY" 
      ? await buy(stock.symbol, qty) 
      : await sell(stock.symbol, qty);
    setLoading(false);
    if (res.ok) {
      toast.success(`${mode === "BUY" ? "Bought" : "Sold"} ${qty} ${stock.symbol} @ ${fmtMoney(stock.price)}`);
      close();
    } else {
      toast.error(res.error ?? "Order failed");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) close(); else onOpenChange(v); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <StockLogo symbol={stock.symbol} />
            <div>
              <DialogTitle className="font-display">{mode} {stock.symbol}</DialogTitle>
              <DialogDescription>{stock.name}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {!confirming ? (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Market price</span>
              <span className="font-mono font-semibold">{fmtMoney(stock.price)}</span>
            </div>
            <div className="space-y-2">
              <Label htmlFor="qty">Quantity</Label>
              <Input id="qty" type="number" min={1} value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))} />
            </div>
            <div className="rounded-xl bg-muted/40 border border-border/60 p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Estimated total</span>
                <span className="font-mono font-bold text-lg">{fmtMoney(total)}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{mode === "BUY" ? "Available cash" : "Shares owned"}</span>
                <span className="font-mono">{mode === "BUY" ? fmtMoney(balance) : (holding?.shares ?? 0)}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3 pt-2 animate-scale-in">
            <p className="text-sm text-muted-foreground">Please confirm your order:</p>
            <div className="rounded-xl gradient-card border border-border p-5 space-y-3">
              <Row label="Stock" value={stock.symbol} />
              <Row label="Action" value={mode} accent={mode === "BUY" ? "profit" : "loss"} />
              <Row label="Quantity" value={qty.toString()} />
              <Row label="Price / share" value={fmtMoney(stock.price)} />
              <div className="border-t border-border pt-3">
                <Row label="Total" value={fmtMoney(total)} bold />
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={close}>Cancel</Button>
          <Button
            onClick={onSubmit}
            className={mode === "BUY" ? "bg-profit text-primary-foreground hover:bg-profit/90" : "bg-loss text-destructive-foreground hover:bg-loss/90"}
          >
            {confirming ? "Confirm Order" : `Review ${mode}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const Row = ({ label, value, bold, accent }: { label: string; value: string; bold?: boolean; accent?: "profit" | "loss" }) => (
  <div className="flex justify-between text-sm">
    <span className="text-muted-foreground">{label}</span>
    <span className={`font-mono ${bold ? "font-bold text-base" : ""} ${accent === "profit" ? "text-profit" : ""} ${accent === "loss" ? "text-loss" : ""}`}>{value}</span>
  </div>
);
