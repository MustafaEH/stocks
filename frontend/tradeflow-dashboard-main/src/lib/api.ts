const API_BASE = "http://localhost:8001";

export interface User {
  id: number;
  full_name: string;
  email: string;
  username: string;
  created_at?: string;
}

export interface Stock {
  symbol: string;
  name: string;
  price: number;
  sector?: string;
  changePct?: number;
  high?: number;
  low?: number;
  volume?: number;
  marketCap?: string;
  color?: string;
}

export interface PortfolioItem {
  symbol: string;
  quantity: number;
  avg_buy_price: number;
  current_price: number;
  market_value: number;
  profit_loss: number;
}

export interface Transaction {
  id: number;
  symbol: string;
  quantity: number;
  unit_price: number;
  total_cost: number;
  transaction_type: string;
  created_at: string;
}

export interface Account {
  id: number;
  user_id: number;
  balance: number;
}

// Auth API
export const authApi = {
  async register(data: { full_name: string; email: string; username: string; password: string }) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Registration failed");
    }
    return res.json();
  },

  async login(username: string, password: string) {
    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);

    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Login failed");
    }
    return res.json();
  },

  async getProfile(token: string): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to get profile");
    return res.json();
  },
};

// Stocks API
export const stocksApi = {
  async getAll(): Promise<Stock[]> {
    const res = await fetch(`${API_BASE}/stocks/`);
    if (!res.ok) throw new Error("Failed to fetch stocks");
    return res.json();
  },

  async getOne(symbol: string): Promise<Stock> {
    const res = await fetch(`${API_BASE}/stocks/${symbol}`);
    if (!res.ok) throw new Error("Stock not found");
    return res.json();
  },
};

// Portfolio API
export const portfolioApi = {
  async getPortfolio(token: string): Promise<PortfolioItem[]> {
    const res = await fetch(`${API_BASE}/portfolio/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch portfolio");
    return res.json();
  },

  async buy(token: string, symbol: string, quantity: number) {
    const res = await fetch(`${API_BASE}/trade/buy`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ symbol, quantity }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Buy failed");
    }
    return res.json();
  },

  async sell(token: string, symbol: string, quantity: number) {
    const res = await fetch(`${API_BASE}/trade/sell`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ symbol, quantity }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Sell failed");
    }
    return res.json();
  },
};

// Account API
export const accountApi = {
  async getBalance(token: string): Promise<{ balance: number }> {
    const res = await fetch(`${API_BASE}/account/balance`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to get balance");
    return res.json();
  },

  async deposit(token: string, amount: number) {
    const res = await fetch(`${API_BASE}/account/deposit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ amount }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Deposit failed");
    }
    return res.json();
  },
};

// Transactions API
export const transactionsApi = {
  async getAll(token: string): Promise<Transaction[]> {
    const res = await fetch(`${API_BASE}/transactions/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch transactions");
    return res.json();
  },
};