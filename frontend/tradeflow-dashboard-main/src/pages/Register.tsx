import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingUp, Sparkles } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { toast } from "sonner";

const heroData = Array.from({ length: 50 }, (_, i) => ({ i, v: 100 + Math.cos(i / 3) * 12 + i * 0.9 + Math.random() * 4 }));

const Register = () => {
  const { user, register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ fullName: "", username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const onChange = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.username || !form.email || !form.password) {
      toast.error("Please fill all fields");
      return;
    }
    setLoading(true);
    const success = await register({
      full_name: form.fullName,
      username: form.username,
      email: form.email,
      password: form.password,
    });
    setLoading(false);
    if (success) {
      toast.success("Account created — welcome to TradeFlow!");
      nav("/dashboard");
    } else {
      toast.error("Registration failed. Username or email may already exist.");
    }
  };

  return (
    <div className="min-h-screen flex bg-background relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-50" />
      {/* Left illustration / chart panel */}
      <div className="hidden lg:flex flex-col w-1/2 relative p-12 z-10 border-r border-border/60">
        <Link to="/" className="flex items-center gap-2 font-display font-bold text-xl">
          <span className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shadow-glow">
            <TrendingUp className="w-4 h-4 text-primary-foreground" />
          </span>
          TradeFlow
        </Link>
        <div className="my-auto">
          <span className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-full glass mb-6">
            <Sparkles className="w-3 h-3 text-primary" /> Risk-free trading simulator
          </span>
          <h2 className="font-display text-5xl font-bold leading-tight tracking-tight mb-6">
            Practice trading like a <span className="text-transparent bg-clip-text gradient-primary">pro</span>.
          </h2>
          <p className="text-muted-foreground text-lg max-w-md">
            Build winning strategies with $25,000 of virtual capital. Real market data, zero risk.
          </p>
        </div>
        <div className="absolute inset-0 -z-10 opacity-50">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={heroData}>
              <defs>
                <linearGradient id="regGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--secondary))" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke="hsl(var(--secondary))" strokeWidth={2} fill="url(#regGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative z-10">
        <div className="w-full max-w-md animate-slide-up">
          <div className="lg:hidden mb-6">
            <Link to="/" className="flex items-center gap-2 font-display font-bold text-xl">
              <span className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center"><TrendingUp className="w-4 h-4 text-primary-foreground" /></span>
              TradeFlow
            </Link>
          </div>
          <div className="glass rounded-2xl p-8 shadow-elegant">
            <h1 className="font-display text-2xl font-bold mb-1">Create your account</h1>
            <p className="text-sm text-muted-foreground mb-6">Get $25,000 virtual capital instantly.</p>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full name</Label>
                <Input id="fullName" value={form.fullName} onChange={onChange("fullName")} placeholder="Jane Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" value={form.username} onChange={onChange("username")} placeholder="trader_jane" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={form.email} onChange={onChange("email")} placeholder="jane@email.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={form.password} onChange={onChange("password")} placeholder="••••••••" />
              </div>
              <Button type="submit" className="w-full gradient-primary text-primary-foreground font-semibold shadow-glow">
                Create Account
              </Button>
            </form>
            <p className="text-sm text-muted-foreground text-center mt-6">
              Already have an account?{" "}
              <Link to="/login" className="text-primary font-medium hover:underline">Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
