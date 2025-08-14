"use client";

import React from "react";
import { Activity } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

// Sample monitoring data
const chartData = [
  { time: "00:00", cpu: 45, memory: 60, storage: 30 },
  { time: "00:05", cpu: 52, memory: 65, storage: 32 },
  { time: "00:10", cpu: 48, memory: 58, storage: 35 },
  { time: "00:15", cpu: 61, memory: 72, storage: 38 },
  { time: "00:20", cpu: 55, memory: 68, storage: 40 },
  { time: "00:25", cpu: 49, memory: 63, storage: 42 },
  { time: "00:30", cpu: 58, memory: 70, storage: 45 },
];

const chartConfig = {
  cpu: {
    label: "CPU",
    color: "hsl(var(--chart-1))",
  },
  memory: {
    label: "Memory",
    color: "hsl(var(--chart-2))",
  },
  storage: {
    label: "Storage",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

export default function NodeMonitor() {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="p-1 border-2 border-muted-foreground/20 rounded-full cursor-pointer hover:border-muted-foreground/40 transition-colors">
            <Activity className="h-4 w-4 text-theme-green" />
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          className="bg-background-secondary rounded-lg p-0"
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <div className="p-4 w-80">
            <div className="mb-3">
              <h3 className="text-sm font-medium">Resource Monitor</h3>
              <p className="text-xs text-muted-foreground">Last 30 minutes</p>
            </div>
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <AreaChart data={chartData}>
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
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="time"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
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
                  dataKey="storage"
                  type="natural"
                  fill="url(#fillStorage)"
                  stroke="var(--color-storage)"
                  stackId="a"
                />
                <Area
                  dataKey="memory"
                  type="natural"
                  fill="url(#fillMemory)"
                  stroke="var(--color-memory)"
                  stackId="a"
                />
                <Area
                  dataKey="cpu"
                  type="natural"
                  fill="url(#fillCpu)"
                  stroke="var(--color-cpu)"
                  stackId="a"
                />
                <ChartLegend content={<ChartLegendContent />} />
              </AreaChart>
            </ChartContainer>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
