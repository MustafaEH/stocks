import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { portfolioApi, accountApi, stocksApi, transactionsApi, PortfolioItem, Stock } from "../lib/api";

export interface Holding {
  symbol: string;
  shares: number;
  avgPrice: number;
}
export interface Transaction {
  id: string;
  type: "BUY" | "SELL";
  symbol: string;
  qty: number;
  price: number;
  total: number;
  date: string;
}
export interface Deposit {
  id: string;
  amount: number;
  date: string;
}

interface PortfolioState {
  balance: number;
  holdings: Holding[];
  transactions: Transaction[];
  deposits: Deposit[];
  stocks: Stock[];
  loading: boolean;
}
interface Ctx extends PortfolioState {
  buy: (symbol: string, qty: number) => Promise<{ ok: boolean; error?: string }>;
  sell: (symbol: string, qty: number) => Promise<{ ok: boolean; error?: string }>;
  deposit: (amount: number) => Promise<{ ok: boolean; error?: string }>;
  refreshPortfolio: () => Promise<void>;
  marketValue: number;
  invested: number;
  unrealized: number;
  unrealizedPct: number;
  todayChangePct: number;
}

const C = createContext<Ctx | null>(null);

export const PortfolioProvider = ({ children }: { children: ReactNode }) => {
  const { token } = useAuth();
  const [state, setState] = useState<PortfolioState>({
    balance: 0,
    holdings: [],
    transactions: [],
    deposits: [],
    stocks: [],
    loading: true,
  });

  // Fetch stocks (public, no auth needed)
  useEffect(() => {
    stocksApi.getAll()
      .then((stocks) => setState((s) => ({ ...s, stocks })))
      .catch(console.error);
  }, []);

  // Fetch portfolio when token changes
  const refreshPortfolio = async () => {
    if (!token) {
      setState((s) => ({ ...s, loading: false }));
      return;
    }
    try {
      const [portfolio, balanceData, transactions] = await Promise.all([
        portfolioApi.getPortfolio(token),
        accountApi.getBalance(token),
        transactionsApi.getAll(token),
      ]);

      const holdings: Holding[] = portfolio.map((p: PortfolioItem) => ({
        symbol: p.symbol,
        shares: p.quantity,
        avgPrice: p.avg_buy_price,
      }));

      const txns: Transaction[] = transactions.map((t: any) => ({
        id: String(t.id),
        type: t.transaction_type as "BUY" | "SELL",
        symbol: t.symbol,
        qty: t.quantity,
        price: Number(t.unit_price),
        total: Number(t.total_cost),
        date: t.created_at,
      }));

      setState((s) => ({
        ...s,
        holdings,
        balance: Number(balanceData.balance),
        transactions: txns,
        loading: false,
      }));
    } catch (error) {
      console.error("Failed to load portfolio:", error);
      setState((s) => ({ ...s, loading: false }));
    }
  };

  useEffect(() => {
    refreshPortfolio();
  }, [token]);

  const getStockPrice = (symbol: string): number => {
    const stock = state.stocks.find((s) => s.symbol === symbol);
    return stock?.price ?? 0;
  };

  const buy = async (symbol: string, qty: number): Promise<{ ok: boolean; error?: string }> => {
    if (!token) return { ok: false, error: "Not authenticated" };
    try {
      await portfolioApi.buy(token, symbol, qty);
      await refreshPortfolio();
      return { ok: true };
    } catch (error: any) {
      return { ok: false, error: error.message };
    }
  };

  const sell = async (symbol: string, qty: number): Promise<{ ok: boolean; error?: string }> => {
    if (!token) return { ok: false, error: "Not authenticated" };
    try {
      await portfolioApi.sell(token, symbol, qty);
      await refreshPortfolio();
      return { ok: true };
    } catch (error: any) {
      return { ok: false, error: error.message };
    }
  };

  const deposit = async (amount: number): Promise<{ ok: boolean; error?: string }> => {
    if (!token) return { ok: false, error: "Not authenticated" };
    try {
      await accountApi.deposit(token, amount);
      await refreshPortfolio();
      return { ok: true };
    } catch (error: any) {
      return { ok: false, error: error.message };
    }
  };

  const derived = useMemo(() => {
    const marketValue = state.holdings.reduce((sum, h) => sum + getStockPrice(h.symbol) * h.shares, 0);
    const invested = state.holdings.reduce((sum, h) => sum + h.avgPrice * h.shares, 0);
    const unrealized = marketValue - invested;
    const unrealizedPct = invested > 0 ? (unrealized / invested) * 100 : 0;
    // For todayChangePct, we'd need changePct from stocks - using 0 for now
    const todayChangePct = 0;
    return { marketValue, invested, unrealized, unrealizedPct, todayChangePct };
  }, [state.holdings, state.stocks]);

  return (
    <C.Provider value={{ ...state, buy, sell, deposit, refreshPortfolio, ...derived }}>
      {children}
    </C.Provider>
  );
};

export const usePortfolio = () => {
  const c = useContext(C);
  if (!c) throw new Error("usePortfolio must be used within PortfolioProvider");
  return c;
};
