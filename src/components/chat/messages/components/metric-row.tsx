import React, { useEffect, useState } from "react";
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

type MetricType = "cpu" | "memory" | "storage";

interface MetricRowProps {
  metric: MetricType;
  resource?: any;
  monitorData?: Record<
    string,
    {
      cpu: Array<[string, string]>;
      memory: Array<[string, string]>;
      storage?: Array<[string, string]>;
    }
  >;
  isLoading?: boolean;
  color?: string;
}

interface ChartDataPoint {
  time: string;
  value: number;
  valueFormatted: string;
}

const chartConfig = {
  value: {
    label: "Value (%)",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export const MetricRow: React.FC<MetricRowProps> = ({
  metric,
  resource,
  monitorData,
  isLoading = false,
  color,
}) => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [yAxisDomain, setYAxisDomain] = useState<[number, number]>([0, 100]);

  const Icon = metric === "cpu" ? Cpu : metric === "memory" ? MemoryStick : HardDrive;
  const label = metric === "cpu" ? "CPU" : metric === "memory" ? "Memory" : "Storage";
  const defaultColor =
    metric === "cpu"
      ? "hsl(var(--chart-1))"
      : metric === "memory"
      ? "hsl(var(--chart-2))"
      : "hsl(var(--chart-3))";

  const resourceValue = (() => {
    if (!resource) return "N/A";
    if (metric === "cpu") return `${resource.cpu ?? "N/A"}m`;
    if (metric === "memory") return `${resource.memory ?? "N/A"}MB`;
    return resource.storage ?? "N/A";
  })();

  const normalizeMonitorData = (data: Array<[string, string]>): Array<[string, string]> => {
    return data.map(([timestamp, value]) => [timestamp, (parseFloat(value) / 100).toString()]);
  };

  // Process data and create chart data points
  useEffect(() => {
    if (!monitorData || Object.keys(monitorData).length === 0) return;

    const podNames = Object.keys(monitorData);
    const firstPod = podNames[0];
    const rawData = (monitorData[firstPod]?.[metric] || []) as Array<[string, string]>;
    const data = normalizeMonitorData(rawData);

    if (!data || data.length === 0) return;

    let processedData: ChartDataPoint[] = [];

    // Create time series from current time to 3 hours ago with 5-minute intervals
    const now = new Date();
    const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);

    // Create time points every 5 minutes
    const timePoints: Date[] = [];
    for (
      let time = threeHoursAgo;
      time <= now;
      time = new Date(time.getTime() + 5 * 60 * 1000)
    ) {
      timePoints.push(time);
    }

    // Process each time point
    timePoints.forEach((timePoint) => {
      const timeString = timePoint.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      // Find matching data point or use 0
      const matchingData = data.find(([timestamp]) => {
        const dataTime = new Date(timestamp);
        // Check if the data time is within 1 minute of the time point
        return (
          Math.abs(dataTime.getTime() - timePoint.getTime()) <= 60 * 1000
        );
      });

      processedData.push({
        time: timeString,
        value: matchingData ? parseFloat(matchingData[1]) * 100 : 0, // Convert to percentage
        valueFormatted: matchingData
          ? `${(parseFloat(matchingData[1]) * 100).toFixed(2)}%`
          : "0%",
      });
    });

    setChartData(processedData);

    // Calculate Y-axis domain based on maximum value
    if (processedData.length > 0) {
      const maxValue = Math.max(...processedData.map(d => d.value));
      let ceiling = 100; // Default ceiling for percentage values
      
      if (maxValue > 0) {
        // Calculate appropriate ceiling based on maximum value
        if (maxValue <= 10) {
          ceiling = 10;
        } else if (maxValue <= 25) {
          ceiling = 25;
        } else if (maxValue <= 50) {
          ceiling = 50;
        } else if (maxValue <= 75) {
          ceiling = 75;
        } else {
          ceiling = 100;
        }
      }
      
      setYAxisDomain([0, ceiling]);
    }
  }, [monitorData, metric]);

  const renderChart = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-16 text-xs text-muted-foreground">
          Loading...
        </div>
      );
    }

    if (!monitorData || Object.keys(monitorData).length === 0) {
      return (
        <div className="flex items-center justify-center h-32 text-xs text-muted-foreground">
          No {label} data
        </div>
      );
    }

    // Handle empty data state - show empty chart
    if (!chartData || chartData.length === 0) {
      return (
        <div className="w-full h-full">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <AreaChart
              data={(() => {
                const now = new Date();
                const threeHoursAgo = new Date(
                  now.getTime() - 3 * 60 * 60 * 1000
                );
                const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
                const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

                return [
                  {
                    time: threeHoursAgo.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    }),
                    value: 0,
                    valueFormatted: "0%",
                  },
                  {
                    time: twoHoursAgo.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    }),
                    value: 0,
                    valueFormatted: "0%",
                  },
                  {
                    time: oneHourAgo.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    }),
                    value: 0,
                    valueFormatted: "0%",
                  },
                  {
                    time: now.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    }),
                    value: 0,
                    valueFormatted: "0%",
                  },
                ];
              })()}
              margin={{ left: 0, right: 10, top: 10, bottom: 15 }}
              width={undefined}
              height={undefined}
            >
              <defs>
                <linearGradient id="fillValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color || defaultColor} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={color || defaultColor} stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="time"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={20}
              />
              <YAxis
                domain={yAxisDomain}
                tickLine={false}
                axisLine={false}
                tickMargin={4}
                tickFormatter={(value) => `${value}%`}
                width={40}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => `Time: ${value}`}
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="value"
                type="natural"
                fill="url(#fillValue)"
                stroke={color || defaultColor}
                stackId="a"
              />
            </AreaChart>
          </ChartContainer>
        </div>
      );
    }

    return (
      <div className="w-full h-full">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <AreaChart 
            data={chartData}
            margin={{ left: 0, right: 10, top: 10, bottom: 30 }}
            width={undefined}
            height={undefined}
          >
            <defs>
              <linearGradient id="fillValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color || defaultColor} stopOpacity={0.8} />
                <stop offset="95%" stopColor={color || defaultColor} stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={20}
            />
            <YAxis
              domain={yAxisDomain}
              tickLine={false}
              axisLine={false}
              tickMargin={4}
              tickFormatter={(value) => `${value}%`}
              width={40}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => `Time: ${value}`}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="value"
              type="natural"
              fill="url(#fillValue)"
              stroke={color || defaultColor}
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-5 gap-4 items-center">
      <div className="col-span-1 flex flex-col items-center gap-1 text-center">
        <Icon className="w-4 h-4" />
        <span className="text-xs text-muted-foreground">{label}</span>
        <div className="text-sm font-medium">{resourceValue}</div>
      </div>

      <div className="col-span-4">{renderChart()}</div>
    </div>
  );
};

export default MetricRow;


