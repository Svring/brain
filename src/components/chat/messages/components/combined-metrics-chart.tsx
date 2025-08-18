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

export const CombinedMetricsChart: React.FC<CombinedMetricsChartProps> = ({
  data,
  isLoading = false,
  height = "h-64",
}) => {
  // Transform data to format expected by Recharts
  const chartData = data.map((point) => ({
    time: point.readableTime,
    timestamp: point.timestamp,
    cpu: point.cpu,
    memory: point.memory,
    ...(point.storage !== undefined && { storage: point.storage }),
  }));

  // Calculate Y-axis domain based on data
  const allValues = data.flatMap((point) => [
    point.cpu, 
    point.memory, 
    ...(point.storage !== undefined ? [point.storage] : [])
  ]);
  const maxValue = Math.max(...allValues, 0);
  const minValue = Math.min(...allValues, 0);

  // Set appropriate Y-axis domain
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
      <ChartContainer config={chartConfig} className="h-full w-full">
        <AreaChart
          data={chartData}
          margin={{ left: 0, right: 10, top: 10, bottom: 0 }}
          accessibilityLayer
        >
          <defs>
            <linearGradient id="fillCpu" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-cpu)"
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor="var(--color-cpu)"
                stopOpacity={0.1}
              />
            </linearGradient>
            <linearGradient id="fillMemory" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-memory)"
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor="var(--color-memory)"
                stopOpacity={0.1}
              />
            </linearGradient>
            <linearGradient id="fillStorage" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-storage)"
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor="var(--color-storage)"
                stopOpacity={0.1}
              />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="time"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={30}
            tickFormatter={(value) => {
              // Format time to show only time part (HH:MM)
              const timePart = value.split(" ")[1];
              return timePart || value;
            }}
          />
          <YAxis
            domain={yAxisDomain}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => `${value}%`}
            width={50}
          />
          <ChartTooltip
            content={({ active, payload, label }) => {
              if (!active || !payload || payload.length === 0) {
                return null;
              }

              return (
                <div className="border-border/50 bg-background rounded-lg border px-3 py-2 text-xs shadow-xl">
                  <div className="font-medium text-foreground mb-2">
                    Time: {label}
                  </div>
                  <div className="space-y-1">
                    {payload.map((entry, index) => {
                      const metricName = entry.dataKey === 'cpu' ? 'CPU' : 
                                       entry.dataKey === 'memory' ? 'Memory' : 
                                       entry.dataKey === 'storage' ? 'Storage' : entry.dataKey;
                      const color = entry.dataKey === 'cpu' ? 'var(--color-cpu)' : 
                                  entry.dataKey === 'memory' ? 'var(--color-memory)' :
                                  entry.dataKey === 'storage' ? 'var(--color-storage)' : 'var(--color-cpu)';
                      
                      return (
                        <div key={index} className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: color }}
                            />
                            <span className="text-muted-foreground font-medium">
                              {metricName}
                            </span>
                          </div>
                          <span className="text-foreground font-mono font-semibold">
                            {entry.value}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            }}
          />
          <ChartLegend 
            content={
              <div className="flex items-center justify-center gap-6 pt-3">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: "var(--color-cpu)" }}
                  />
                  <span className="text-xs font-medium">CPU</span>
                </div>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: "var(--color-memory)" }}
                  />
                  <span className="text-xs font-medium">Memory</span>
                </div>
                {data.some(point => point.storage !== undefined) && (
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-sm"
                      style={{ backgroundColor: "var(--color-storage)" }}
                    />
                    <span className="text-xs font-medium">Storage</span>
                  </div>
                )}
              </div>
            } 
          />
          <Area
            type="monotone"
            dataKey="cpu"
            fill="url(#fillCpu)"
            stroke="var(--color-cpu)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="memory"
            fill="url(#fillMemory)"
            stroke="var(--color-memory)"
            strokeWidth={2}
          />
          {data.some(point => point.storage !== undefined) && (
            <Area
              type="monotone"
              dataKey="storage"
              fill="url(#fillStorage)"
              stroke="var(--color-storage)"
              strokeWidth={2}
            />
          )}
        </AreaChart>
      </ChartContainer>
    </div>
  );
};

export default CombinedMetricsChart;
