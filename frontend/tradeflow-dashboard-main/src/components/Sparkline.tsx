import { Line, LineChart, ResponsiveContainer } from "recharts";

export const Sparkline = ({ data, positive, height = 40 }: { data: number[]; positive: boolean; height?: number }) => {
  const chartData = data.map((v, i) => ({ i, v }));
  const stroke = positive ? "hsl(var(--profit))" : "hsl(var(--loss))";
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData}>
        <Line type="monotone" dataKey="v" stroke={stroke} strokeWidth={2} dot={false} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  );
};
