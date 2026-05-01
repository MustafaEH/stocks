import { useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Ticker } from "@/components/Ticker";
import { TrendingUp, LineChart } from "lucide-react";
import { Line, LineChart as RLineChart, ResponsiveContainer, Area, AreaChart } from "recharts";
import { toast } from "sonner";

const heroData = Array.from({ length: 60 }, (_, i) => ({ i, v: 100 + Math.sin(i / 4) * 18 + i * 1.2 + Math.random() * 5 }));

const Login = () => {
  const { user, login } = useAuth();
  const nav = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error("Please enter username and password");
      return;
    }
    setLoading(true);
    const success = await login(username, password);
    setLoading(false);
    if (success) {
      toast.success("Welcome back to TradeFlow");
      nav("/dashboard");
    } else {
      toast.error("Invalid username or password");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Hero chart background */}
      <div className="absolute inset-0 -z-0 opacity-40">
        <div className="absolute inset-0 grid-bg" />
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={heroData}>
            <defs>
              <linearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="v" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#heroGrad)" isAnimationActive />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <header className="relative z-10 flex items-center justify-between px-6 py-5">
        <Link to="/" className="flex items-center gap-2 font-display font-bold text-xl">
          <span className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shadow-glow">
            <TrendingUp className="w-4 h-4 text-primary-foreground" />
          </span>
          TradeFlow
        </Link>
        <Link to="/register" className="text-sm text-muted-foreground hover:text-foreground transition">Create account</Link>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md animate-slide-up">
          <div className="text-center mb-8">
            <h1 className="font-display text-4xl font-bold tracking-tight mb-2">Welcome back</h1>
            <p className="text-muted-foreground">Buy. Sell. Track. Grow.</p>
          </div>
          <div className="glass rounded-2xl p-8 shadow-elegant">
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="trader_jane" autoComplete="username" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
              </div>
              <Button type="submit" className="w-full gradient-primary text-primary-foreground font-semibold shadow-glow hover:opacity-90">
                Login
              </Button>
              <Button type="button" variant="outline" className="w-full" onClick={() => nav("/register")}>
                Create account
              </Button>
            </form>
            <p className="text-xs text-muted-foreground text-center mt-6 flex items-center justify-center gap-1">
              <LineChart className="w-3 h-3" /> Simulated trading. No real money involved.
            </p>
          </div>
        </div>
      </main>

      <div className="relative z-10">
        <Ticker />
      </div>
    </div>
  );
};

export default Login;
