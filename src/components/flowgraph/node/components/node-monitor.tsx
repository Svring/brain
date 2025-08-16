"use client";

import React, { useEffect, useState } from "react";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

interface NodeMonitorProps {
  data: Array<[string, string]>; // [timestamp, value] pairs
  label?: string; // Label for the metric (e.g., "CPU", "Memory")
  color?: string; // Color for the chart
  showTimespan?: boolean; // Whether to show timespan data or just current value
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

export default function NodeMonitor({
  data,
  label = "Value",
  color = "hsl(var(--chart-1))",
  showTimespan = true,
}: NodeMonitorProps) {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [yAxisDomain, setYAxisDomain] = useState<[number, number]>([0, 100]);

  // Process data and create chart data points
  useEffect(() => {
    if (!data || data.length === 0) return;

    let processedData: ChartDataPoint[] = [];

    if (showTimespan) {
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
    } else {
      // Just show the latest value
      const latestData = data[data.length - 1];
      if (latestData) {
        processedData = [
          {
            time: new Date().toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            }),
            value: parseFloat(latestData[1]) * 100,
            valueFormatted: `${(parseFloat(latestData[1]) * 100).toFixed(2)}%`,
          },
        ];
      }
    }

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
  }, [data, showTimespan]);

  // Handle empty data state - show empty chart
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-full">
        <div className="mb-3">
          <h3 className="text-sm font-medium">{label} Monitor</h3>
        </div>
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
                <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                <stop offset="95%" stopColor={color} stopOpacity={0.1} />
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
              stroke={color}
              stackId="a"
            />
            {/* <ChartLegend content={<ChartLegendContent />} /> */}
          </AreaChart>
        </ChartContainer>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <div className="mb-3">
        <h3 className="text-sm font-medium">{label} Monitor</h3>
      </div>
      <ChartContainer config={chartConfig} className="h-full w-full">
        <AreaChart 
          data={chartData}
          margin={{ left: 0, right: 10, top: 10, bottom: 30 }}
          width={undefined}
          height={undefined}
        >
          <defs>
            <linearGradient id="fillValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.8} />
              <stop offset="95%" stopColor={color} stopOpacity={0.1} />
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
            stroke={color}
            stackId="a"
          />
          <ChartLegend content={<ChartLegendContent />} />
        </AreaChart>
      </ChartContainer>
    </div>
  );
}
