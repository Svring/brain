import React, { useEffect, useState } from "react";
import { Cpu, MemoryStick, HardDrive } from "lucide-react";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

type MetricType = "cpu" | "memory" | "storage";

interface MetricRowProps {
  metric: MetricType;
  resource?: any;
  monitorData?: Array<[string, string]>;
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

  const metricConfig = {
    cpu: { Icon: Cpu, label: "CPU", color: "hsl(var(--chart-1))" },
    memory: {
      Icon: MemoryStick,
      label: "Memory",
      color: "hsl(var(--chart-2))",
    },
    storage: {
      Icon: HardDrive,
      label: "Storage",
      color: "hsl(var(--chart-3))",
    },
  }[metric];

  const resourceValue = resource
    ? metric === "cpu"
      ? `${resource.cpu ?? "N/A"}m`
      : metric === "memory"
      ? `${resource.memory ?? "N/A"}MB`
      : resource.storage ?? "N/A"
    : "N/A";

  const normalizeMonitorData = (
    data: Array<[string, string]>
  ): Array<[string, string]> => {
    return data.map(([timestamp, value]) => [
      timestamp,
      parseFloat(value).toString(),
    ]);
  };

  // Process data and create chart data points
  useEffect(() => {
    if (!monitorData || monitorData.length === 0) return;

    const data = normalizeMonitorData(monitorData);

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
        return Math.abs(dataTime.getTime() - timePoint.getTime()) <= 60 * 1000;
      });

      processedData.push({
        time: timeString,
        value: matchingData ? parseFloat(matchingData[1]) * 100 : 0, // Convert decimal to percentage
        valueFormatted: matchingData
          ? `${(parseFloat(matchingData[1]) * 100).toFixed(2)}%`
          : "0%",
      });
    });

    setChartData(processedData);

    // Calculate Y-axis domain based on maximum value
    if (processedData.length > 0) {
      const maxValue = Math.max(...processedData.map((d) => d.value));
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
        <div className="flex items-center justify-center h-8 text-xs text-muted-foreground">
          Loading...
        </div>
      );
    }

    if (!monitorData || monitorData.length === 0) {
      return (
        <div className="flex items-center justify-center h-12 text-xs text-muted-foreground">
          No {metricConfig.label} data
        </div>
      );
    }

    const chartHeight = !chartData || chartData.length === 0 ? "h-48" : "h-32";
    const chartDataToUse =
      !chartData || chartData.length === 0
        ? (() => {
            const now = new Date();
            const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);
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
          })()
        : chartData;

    return (
      <div className={`w-full ${chartHeight}`}>
        <ChartContainer config={chartConfig} className="h-full w-full">
          <AreaChart
            data={chartDataToUse}
            margin={{ left: 0, right: 10, top: 2, bottom: 10 }}
            width={undefined}
            height={50}
          >
            <defs>
              <linearGradient id="fillValue" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={color || metricConfig.color}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={color || metricConfig.color}
                  stopOpacity={0.1}
                />
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
              stroke={color || metricConfig.color}
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-5 gap-3 items-center py-1 border border-dashed rounded-md">
      <div className="col-span-1 flex flex-col items-center gap-0.5 text-center">
        <metricConfig.Icon className="w-3 h-3" />
        <span className="text-xs text-muted-foreground">
          {metricConfig.label}
        </span>
        <div className="text-xs font-medium">{resourceValue}</div>
      </div>

      <div className="col-span-4">{renderChart()}</div>
    </div>
  );
};

export default MetricRow;
