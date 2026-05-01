export type Sector = "Tech" | "Energy" | "Finance" | "Healthcare";

export interface Stock {
  symbol: string;
  name: string;
  sector: Sector;
  price: number;
  changePct: number;
  high: number;
  low: number;
  volume: number;
  marketCap: string;
  color: string; // hex used for logo bubble
}

const seedSparkline = (base: number, n = 24, vol = 0.025) => {
  const out: number[] = [];
  let p = base * (1 - vol * 8);
  for (let i = 0; i < n; i++) {
    p += (Math.random() - 0.45) * base * vol;
    out.push(+p.toFixed(2));
  }
  out[out.length - 1] = base;
  return out;
};

export const STOCKS: Stock[] = [
  { symbol: "AAPL", name: "Apple Inc.", sector: "Tech", price: 232.41, changePct: 1.24, high: 234.10, low: 229.50, volume: 58_120_000, marketCap: "3.52T", color: "#E5E7EB" },
  { symbol: "TSLA", name: "Tesla, Inc.", sector: "Tech", price: 268.77, changePct: -2.13, high: 275.40, low: 266.10, volume: 92_400_000, marketCap: "856B", color: "#EF4444" },
  { symbol: "NVDA", name: "NVIDIA Corp.", sector: "Tech", price: 138.92, changePct: 3.41, high: 140.20, low: 134.05, volume: 210_000_000, marketCap: "3.41T", color: "#22C55E" },
  { symbol: "MSFT", name: "Microsoft Corp.", sector: "Tech", price: 428.15, changePct: 0.62, high: 430.00, low: 425.10, volume: 24_500_000, marketCap: "3.18T", color: "#3B82F6" },
  { symbol: "AMZN", name: "Amazon.com, Inc.", sector: "Tech", price: 199.84, changePct: 0.91, high: 201.20, low: 197.40, volume: 41_200_000, marketCap: "2.10T", color: "#F59E0B" },
  { symbol: "META", name: "Meta Platforms", sector: "Tech", price: 583.20, changePct: -0.48, high: 588.10, low: 580.55, volume: 17_800_000, marketCap: "1.48T", color: "#60A5FA" },
  { symbol: "GOOGL", name: "Alphabet Inc.", sector: "Tech", price: 174.66, changePct: 1.05, high: 175.90, low: 172.80, volume: 22_900_000, marketCap: "2.15T", color: "#A78BFA" },
  { symbol: "JPM", name: "JPMorgan Chase", sector: "Finance", price: 218.40, changePct: 0.34, high: 219.10, low: 216.20, volume: 9_200_000, marketCap: "624B", color: "#0EA5E9" },
  { symbol: "GS", name: "Goldman Sachs", sector: "Finance", price: 512.80, changePct: -0.72, high: 519.40, low: 510.30, volume: 2_100_000, marketCap: "168B", color: "#14B8A6" },
  { symbol: "XOM", name: "Exxon Mobil", sector: "Energy", price: 117.32, changePct: 1.84, high: 118.20, low: 115.10, volume: 14_800_000, marketCap: "520B", color: "#F97316" },
  { symbol: "CVX", name: "Chevron Corp.", sector: "Energy", price: 158.21, changePct: 0.92, high: 159.40, low: 156.10, volume: 6_300_000, marketCap: "289B", color: "#EAB308" },
  { symbol: "JNJ", name: "Johnson & Johnson", sector: "Healthcare", price: 162.50, changePct: -0.21, high: 163.40, low: 161.80, volume: 5_700_000, marketCap: "390B", color: "#F43F5E" },
  { symbol: "PFE", name: "Pfizer Inc.", sector: "Healthcare", price: 28.94, changePct: 2.05, high: 29.10, low: 28.20, volume: 31_200_000, marketCap: "164B", color: "#06B6D4" },
  { symbol: "UNH", name: "UnitedHealth Group", sector: "Healthcare", price: 564.10, changePct: 0.48, high: 567.20, low: 561.00, volume: 3_100_000, marketCap: "519B", color: "#84CC16" },
];

export const SPARKLINES: Record<string, number[]> = Object.fromEntries(
  STOCKS.map((s) => [s.symbol, seedSparkline(s.price)])
);

export const getStock = (symbol: string) => STOCKS.find((s) => s.symbol === symbol);

// Generate detailed chart for stock detail page
export const generateChart = (symbol: string, range: "1D" | "1W" | "1M" | "1Y" | "All") => {
  const stock = getStock(symbol);
  if (!stock) return [];
  const config = { "1D": 48, "1W": 56, "1M": 30, "1Y": 52, "All": 80 } as const;
  const vol = { "1D": 0.005, "1W": 0.012, "1M": 0.02, "1Y": 0.04, "All": 0.06 } as const;
  const n = config[range];
  const v = vol[range];
  const data: { t: string; price: number }[] = [];
  let p = stock.price * (1 - v * 6);
  for (let i = 0; i < n; i++) {
    p += (Math.random() - 0.46) * stock.price * v;
    data.push({ t: String(i), price: +p.toFixed(2) });
  }
  data[data.length - 1].price = stock.price;
  return data;
};
