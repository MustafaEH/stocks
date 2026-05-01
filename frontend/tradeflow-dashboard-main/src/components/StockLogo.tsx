import { getStock } from "@/data/stocks";

export const StockLogo = ({ symbol, size = 40 }: { symbol: string; size?: number }) => {
  const s = getStock(symbol);
  const color = s?.color ?? "#22C55E";
  const initials = symbol.slice(0, 2);
  return (
    <div
      className="flex items-center justify-center rounded-xl font-bold font-display shrink-0"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${color}33, ${color}11)`,
        color,
        border: `1px solid ${color}40`,
        fontSize: size * 0.36,
      }}
    >
      {initials}
    </div>
  );
};
