"use client";

import React, { useEffect, useState } from "react";
import { Activity } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
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
import { createMetricsContext } from "@/lib/auth/auth-utils";
import {
  getLaunchpadInstantMonitorOptions,
  getLaunchpadRangedMonitorOptions,
} from "@/lib/sealos/resources/launchpad/launchpad-method/launchpad-query";
import {
  getDevboxInstantMonitorOptions,
  getDevboxRangedMonitorOptions,
} from "@/lib/sealos/resources/devbox/devbox-method/devbox-query";
import {
  getClusterInstantMonitorOptions,
  getClusterRangedMonitorOptions,
} from "@/lib/sealos/resources/cluster/cluster-method/cluster-query";
import type { GetLaunchPadMetricsResponse } from "@/lib/sealos/services/metrics/schemas/metrics-query-schema";
import type { GetClusterMetricsResponse } from "@/lib/sealos/services/metrics/schemas/cluster-metrics-schema";

interface NodeMonitorProps {
  resourceType: "launchpad" | "devbox" | "cluster";
  resourceName: string;
  clusterType?: string; // Only needed for cluster resources
  showTimespan?: boolean; // Whether to show timespan data or instant data
}

interface MetricsData {
  time: string;
  cpu: number;
  memory: number;
  storage?: number; // Only for clusters
}

// Union type for all possible metrics responses
type MetricsResponse =
  | { cpu: GetLaunchPadMetricsResponse; memory: GetLaunchPadMetricsResponse }
  | {
      cpu: GetClusterMetricsResponse;
      memory: GetClusterMetricsResponse;
      disk_used: GetClusterMetricsResponse;
    };

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

export default function NodeMonitor({
  resourceType,
  resourceName,
  clusterType,
  showTimespan = true,
}: NodeMonitorProps) {
  const [chartData, setChartData] = useState<MetricsData[]>([]);

  // Create appropriate metrics context
  const metricsContext = createMetricsContext(
    resourceType === "cluster" ? "cluster" : "launchpad"
  );

  // Determine which query options to use based on resource type and timespan preference
  const getQueryOptions = () => {
    if (showTimespan) {
      switch (resourceType) {
        case "launchpad":
          return getLaunchpadRangedMonitorOptions(metricsContext, resourceName);
        case "devbox":
          return getDevboxRangedMonitorOptions(metricsContext, resourceName);
        case "cluster":
          if (!clusterType) return null;
          return getClusterRangedMonitorOptions(
            metricsContext,
            resourceName,
            clusterType
          );
        default:
          return null;
      }
    } else {
      switch (resourceType) {
        case "launchpad":
          return getLaunchpadInstantMonitorOptions(
            metricsContext,
            resourceName
          );
        case "devbox":
          return getDevboxInstantMonitorOptions(metricsContext, resourceName);
        case "cluster":
          if (!clusterType) return null;
          return getClusterInstantMonitorOptions(
            metricsContext,
            resourceName,
            clusterType
          );
        default:
          return null;
      }
    }
  };

  const queryOptions = getQueryOptions();
  const {
    data: metricsData,
    isLoading,
    error,
  } = useQuery(
    (queryOptions || { 
      enabled: false,
      queryFn: () => Promise.resolve(null) // Fallback queryFn to prevent error
    }) as any
  );

  // Process metrics data and convert to chart format
  useEffect(() => {
    if (!metricsData) return;

    let processedData: MetricsData[] = [];

    // Type guard to check if we have valid metrics data
    const hasValidData = (data: any): data is MetricsResponse => {
      return (
        data &&
        data.cpu?.data?.result &&
        data.memory?.data?.result &&
        Array.isArray(data.cpu.data.result) &&
        Array.isArray(data.memory.data.result) &&
        data.cpu.data.result.length > 0 &&
        data.memory.data.result.length > 0
      );
    };

    if (!hasValidData(metricsData)) return;

    if (showTimespan && metricsData.cpu?.data?.resultType === "matrix") {
      // Handle timespan data (matrix format)
      const cpuValues = metricsData.cpu.data.result[0]?.values || [];
      const memoryValues = metricsData.memory.data.result[0]?.values || [];
      const storageValues =
        "disk_used" in metricsData &&
        metricsData.disk_used?.data?.resultType === "matrix"
          ? metricsData.disk_used.data.result[0]?.values || []
          : [];

      // Find the longest array to determine time range
      const maxLength = Math.max(
        cpuValues.length,
        memoryValues.length,
        storageValues.length
      );

      for (let i = 0; i < maxLength; i++) {
        const timestamp =
          cpuValues[i]?.[0] || memoryValues[i]?.[0] || storageValues[i]?.[0];
        if (timestamp) {
          const date = new Date(timestamp * 1000);
          const timeString = date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          });

          processedData.push({
            time: timeString,
            cpu: parseFloat(cpuValues[i]?.[1] || "0") * 100, // Convert percentage to number
            memory: parseFloat(memoryValues[i]?.[1] || "0") * 100, // Convert percentage to number
            storage: storageValues[i]
              ? parseFloat(storageValues[i][1]) * 100
              : undefined,
          });
        }
      }
    } else if (
      !showTimespan &&
      metricsData.cpu?.data?.resultType === "vector" &&
      metricsData.cpu.data.result[0]?.value && // Check if value exists and is not null
      metricsData.memory.data.result[0]?.value // Check if value exists and is not null
    ) {
      // Handle instant data (vector format)
      const cpuValue = metricsData.cpu.data.result[0]?.value?.[1] || "0";
      const memoryValue = metricsData.memory.data.result[0]?.value?.[1] || "0";
      const storageValue =
        "disk_used" in metricsData &&
        metricsData.disk_used?.data?.resultType === "vector" &&
        metricsData.disk_used.data.result[0]?.value
          ? metricsData.disk_used.data.result[0]?.value?.[1] || "0"
          : "0";

      const now = new Date();
      const timeString = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      processedData = [
        {
          time: timeString,
          cpu: parseFloat(cpuValue) * 100,
          memory: parseFloat(memoryValue) * 100,
          storage:
            "disk_used" in metricsData
              ? parseFloat(storageValue) * 100
              : undefined,
        },
      ];
    }

    setChartData(processedData);
  }, [metricsData, showTimespan]);

  console.log("metricsData", metricsData);

  // Handle loading and error states
  if (isLoading) {
    return (
      <div className="p-1 border-2 border-muted-foreground/20 rounded-full cursor-pointer">
        <Activity className="h-4 w-4 text-muted-foreground animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-1 border-2 border-destructive/50 rounded-full cursor-pointer">
        <Activity className="h-4 w-4 text-destructive" />
      </div>
    );
  }

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
              <p className="text-xs text-muted-foreground">
                {showTimespan ? "Last 30 minutes" : "Current values"}
              </p>
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
                  {resourceType === "cluster" && (
                    <linearGradient
                      id="fillStorage"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
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
                  )}
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
                {resourceType === "cluster" && (
                  <Area
                    dataKey="storage"
                    type="natural"
                    fill="url(#fillStorage)"
                    stroke="var(--color-storage)"
                    stackId="a"
                  />
                )}
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
