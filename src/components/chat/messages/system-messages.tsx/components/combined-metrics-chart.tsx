import React from "react";
import { Cpu, MemoryStick, HardDrive } from "lucide-react";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

interface MetricsDataPoint {
  timestamp: number;
  readableTime: string;
  cpu: number;
  memory: number;
  storage?: number;
}

interface CombinedMetricsChartProps {
  data: MetricsDataPoint[];
  isLoading?: boolean;
  height?: string;
}

const chartConfig = {
  cpu: {
    label: "CPU",
    icon: Cpu,
    color: "hsl(var(--chart-1))",
  },
  memory: {
    label: "Memory",
    icon: MemoryStick,
    color: "hsl(var(--chart-2))",
  },
  storage: {
    label: "Storage",
    icon: HardDrive,
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig;

interface IndividualChartProps {
  data: any[];
  metricKey: string;
  metricName: string;
  color: string;
  height: string;
  hasStorage: boolean;
}

const IndividualChart: React.FC<IndividualChartProps> = ({
  data,
  metricKey,
  metricName,
  color,
  height,
  hasStorage,
}) => {
  // Calculate Y-axis domain for this metric
  const values = data
    .map((point) => point[metricKey])
    .filter((v) => v !== undefined);
  const maxValue = Math.max(...values, 0);

  let yAxisDomain: [number, number] = [0, 100];
  if (maxValue > 0) {
    const ceiling =
      maxValue <= 10
        ? 10
        : maxValue <= 25
        ? 25
        : maxValue <= 50
        ? 50
        : maxValue <= 75
        ? 75
        : 100;
    yAxisDomain = [0, ceiling];
  }

  // Get the latest value for this metric
  const latestValue = data.length > 0 ? data[data.length - 1][metricKey] : 0;

  return (
    <div className={`flex-1 ${hasStorage ? "w-1/3" : "w-1/2"}`}>
      <div className="text-xs font-medium text-center mb-1 flex items-center justify-center gap-1">
        {metricName === "CPU" && <Cpu className="h-3 w-3" />}
        {metricName === "Memory" && <MemoryStick className="h-3 w-3" />}
        {metricName === "Storage" && <HardDrive className="h-3 w-3" />}
        {metricName}
        <span className="font-mono font-semibold ml-1" style={{ color: color }}>
          {latestValue}%
        </span>
      </div>
      <ChartContainer config={chartConfig} className={`${height} w-full`}>
        <AreaChart
          data={data}
          margin={{ left: 0, right: 2, top: 2, bottom: 0 }}
          accessibilityLayer
        >
          <defs>
            <linearGradient id={`fill${metricKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.8} />
              <stop offset="95%" stopColor={color} stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="2 2" />
          <XAxis
            dataKey="time"
            tickLine={false}
            axisLine={false}
            tickMargin={2}
            minTickGap={15}
            tickFormatter={(value) => {
              const timePart = value.split(" ")[1];
              return timePart || value;
            }}
            fontSize={8}
          />
          <YAxis
            domain={yAxisDomain}
            tickLine={false}
            axisLine={false}
            tickMargin={2}
            tickFormatter={(value) => `${value}%`}
            width={25}
            fontSize={8}
          />
          <ChartTooltip
            content={({ active, payload, label }) => {
              if (!active || !payload || payload.length === 0) {
                return null;
              }

              return (
                <div className="border-border/50 bg-background rounded-lg border px-2 py-1 text-xs shadow-xl">
                  <div className="font-medium text-foreground mb-1">
                    {label}
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-muted-foreground font-medium">
                      {metricName}
                    </span>
                    <span className="text-foreground font-mono font-semibold">
                      {payload[0].value}%
                    </span>
                  </div>
                </div>
              );
            }}
          />
          <Area
            type="monotone"
            dataKey={metricKey}
            fill={`url(#fill${metricKey})`}
            stroke={color}
            strokeWidth={1.5}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
};

export const CombinedMetricsChart: React.FC<CombinedMetricsChartProps> = ({
  data,
  isLoading = false,
  height = "h-40",
}) => {
  // Transform data to format expected by Recharts
  const chartData = data.map((point) => ({
    time: point.readableTime,
    timestamp: point.timestamp,
    cpu: point.cpu,
    memory: point.memory,
    ...(point.storage !== undefined && { storage: point.storage }),
  }));

  const hasStorage = data.some((point) => point.storage !== undefined);

  if (isLoading) {
    return (
      <div
        className={`flex items-center justify-center ${height} text-sm text-muted-foreground`}
      >
        Loading metrics...
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div
        className={`flex items-center justify-center ${height} text-sm text-muted-foreground`}
      >
        No metrics data available
      </div>
    );
  }

  return (
    <div className={`w-full ${height}`}>
      <div className="flex gap-2 h-full">
        <IndividualChart
          data={chartData}
          metricKey="cpu"
          metricName="CPU"
          color={chartConfig.cpu.color}
          height={height}
          hasStorage={hasStorage}
        />
        <IndividualChart
          data={chartData}
          metricKey="memory"
          metricName="Memory"
          color={chartConfig.memory.color}
          height={height}
          hasStorage={hasStorage}
        />
        {hasStorage && (
          <IndividualChart
            data={chartData}
            metricKey="storage"
            metricName="Storage"
            color={chartConfig.storage.color}
            height={height}
            hasStorage={hasStorage}
          />
        )}
      </div>
    </div>
  );
};
export default CombinedMetricsChart;
