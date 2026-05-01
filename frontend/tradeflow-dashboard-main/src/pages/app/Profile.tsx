import { useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePortfolio } from "@/context/PortfolioContext";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { fmtMoney } from "@/lib/format";
import { Award, Calendar, Mail, Star, TrendingDown, TrendingUp, User } from "lucide-react";
import { toast } from "sonner";

const Profile = () => {
  const { user, logout } = useAuth();
  const { transactions } = usePortfolio();

  const stats = useMemo(() => {
    const trades = transactions.length;
    const sells = transactions.filter((t) => t.type === "SELL");
    const wins = sells.map((s) => s.total);
    const biggestWin = wins.length ? Math.max(...wins) : 0;
    const biggestLoss = wins.length ? Math.min(...wins) : 0;
    const counts: Record<string, number> = {};
    transactions.forEach((t) => (counts[t.symbol] = (counts[t.symbol] || 0) + 1));
    const favorite = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
    return { trades, biggestWin, biggestLoss, favorite };
  }, [transactions]);

  const initials = (user?.fullName || user?.username || "?").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  const toggleTheme = () => {
    document.documentElement.classList.toggle("light");
    document.documentElement.classList.toggle("dark");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="font-display text-3xl font-bold mb-1">Profile</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <div className="rounded-2xl gradient-card border border-border p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6">
        <div className="w-24 h-24 rounded-2xl gradient-primary text-primary-foreground font-display font-bold text-3xl flex items-center justify-center shadow-glow">
          {initials}
        </div>
        <div className="flex-1 text-center md:text-left">
          <h2 className="font-display text-2xl font-bold">{user?.fullName}</h2>
          <p className="text-muted-foreground">@{user?.username}</p>
          <div className="grid sm:grid-cols-2 gap-3 mt-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground"><Mail className="w-4 h-4" /> {user?.email}</div>
            <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="w-4 h-4" /> Joined {user ? new Date(user.joined).toLocaleDateString() : ""}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={TrendingUp} label="Total trades" value={String(stats.trades)} />
        <StatCard icon={Award} label="Biggest win" value={fmtMoney(stats.biggestWin)} accent="profit" />
        <StatCard icon={TrendingDown} label="Biggest loss" value={fmtMoney(stats.biggestLoss)} accent="loss" />
        <StatCard icon={Star} label="Favorite stock" value={stats.favorite} />
      </div>

      <div className="rounded-2xl gradient-card border border-border p-6 space-y-4">
        <h3 className="font-display font-semibold text-lg">Settings</h3>
        <Setting label="Change password" description="Update your account password">
          <Button variant="outline" size="sm" onClick={() => toast("Password update coming soon")}>Change</Button>
        </Setting>
        <Setting label="Dark theme" description="Switch between dark and light mode">
          <Switch defaultChecked onCheckedChange={toggleTheme} />
        </Setting>
        <Setting label="Notifications" description="Get alerts on price changes and trades">
          <Switch defaultChecked />
        </Setting>
        <div className="pt-2">
          <Button variant="outline" onClick={() => { logout(); toast("Logged out"); }} className="border-loss/40 text-loss hover:bg-loss hover:text-destructive-foreground">
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, accent }: { icon: any; label: string; value: string; accent?: "profit" | "loss" }) => (
  <div className="rounded-2xl gradient-card border border-border p-4">
    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2"><Icon className="w-3.5 h-3.5" />{label}</div>
    <div className={`font-display text-xl font-bold font-mono ${accent === "profit" ? "text-profit" : ""} ${accent === "loss" ? "text-loss" : ""}`}>{value}</div>
  </div>
);

const Setting = ({ label, description, children }: { label: string; description: string; children: React.ReactNode }) => (
  <div className="flex items-center justify-between gap-4 py-2 border-b border-border last:border-0">
    <div>
      <Label className="text-base">{label}</Label>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
    {children}
  </div>
);

export default Profile;
