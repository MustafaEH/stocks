import { useState } from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fmtMoney } from "@/lib/format";
import { CheckCircle2, Wallet } from "lucide-react";
import { toast } from "sonner";

const QUICK = [100, 500, 1000, 5000];

const Deposit = () => {
  const { balance, deposit, loading } = usePortfolio();
  const [amount, setAmount] = useState<number>(500);
  const [success, setSuccess] = useState(false);
  const [depositing, setDepositing] = useState(false);

  const onDeposit = async () => {
    if (amount <= 0) { toast.error("Enter a valid amount"); return; }
    setDepositing(true);
    const res = await deposit(amount);
    setDepositing(false);
    if (res.ok) {
      setSuccess(true);
      toast.success(`${fmtMoney(amount)} deposited`);
      setTimeout(() => setSuccess(false), 1800);
    } else {
      toast.error(res.error ?? "Deposit failed");
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="font-display text-3xl font-bold mb-1">Deposit Funds</h1>
        <p className="text-muted-foreground">Add virtual capital to your account</p>
      </div>

      <div className="rounded-3xl gradient-card border border-border p-6 md:p-8 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="relative">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2"><Wallet className="w-4 h-4" /> Current balance</div>
          <div className="font-display text-4xl md:text-5xl font-bold font-mono mb-8">{fmtMoney(balance)}</div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amt">Deposit amount</Label>
              <Input id="amt" type="number" min={1} value={amount} onChange={(e) => setAmount(Number(e.target.value) || 0)} className="text-lg font-mono h-12" />
            </div>
            <div className="flex gap-2 flex-wrap">
              {QUICK.map((q) => (
                <button key={q} onClick={() => setAmount(q)} className="px-4 py-1.5 rounded-full border border-border text-sm hover:border-primary/60 hover:text-primary transition">
                  +${q.toLocaleString()}
                </button>
              ))}
            </div>
            <Button onClick={onDeposit} disabled={depositing || loading} className={`w-full h-12 font-semibold transition-all ${success ? "bg-profit text-primary-foreground" : "gradient-primary text-primary-foreground shadow-glow"}`}>
              {success ? <span className="flex items-center gap-2 animate-scale-in"><CheckCircle2 className="w-5 h-5" /> Deposited!</span> : depositing ? "Processing..." : `Deposit ${fmtMoney(amount)}`}
            </Button>
          </div>
        </div>
      </div>

      {/* Note: Deposit history would come from backend transactions endpoint */}
      <div className="rounded-2xl gradient-card border border-border p-5">
        <h3 className="font-display font-semibold mb-3">Deposit history</h3>
        <p className="text-sm text-muted-foreground">Deposit history is available from your account transactions.</p>
      </div>
    </div>
  );
};

export default Deposit;
