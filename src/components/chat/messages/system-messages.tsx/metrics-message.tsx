import React from "react";
import { Activity, Cpu, MemoryStick, HardDrive } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface MetricsData {
  time: string;
  cpu: number;
  memory: number;
  storage: number;
}

interface MetricsMessageProps {
  payload: {
    metrics?: MetricsData[];
    resourceName?: string;
    timeRange?: string;
  };
}

export const MetricsMessageCard: React.FC<MetricsMessageProps> = ({
  payload,
}) => {
  const { metrics = [], resourceName = "Unknown Resource", timeRange = "Last 30 minutes" } = payload;

  // Sample data if no metrics provided
  const sampleMetrics: MetricsData[] = [
    { time: "00:00", cpu: 45, memory: 60, storage: 30 },
    { time: "00:05", cpu: 52, memory: 65, storage: 32 },
    { time: "00:10", cpu: 48, memory: 58, storage: 35 },
    { time: "00:15", cpu: 61, memory: 72, storage: 38 },
    { time: "00:20", cpu: 55, memory: 68, storage: 40 },
    { time: "00:25", cpu: 49, memory: 63, storage: 42 },
    { time: "00:30", cpu: 58, memory: 70, storage: 45 },
  ];

  const displayMetrics = metrics.length > 0 ? metrics : sampleMetrics;

  const getCurrentMetrics = () => {
    if (displayMetrics.length === 0) return { cpu: 0, memory: 0, storage: 0 };
    const latest = displayMetrics[displayMetrics.length - 1];
    return {
      cpu: latest.cpu || 0,
      memory: latest.memory || 0,
      storage: latest.storage || 0,
    };
  };

  const currentMetrics = getCurrentMetrics();

  const getMetricColor = (value: number) => {
    if (value >= 80) return "text-red-600";
    if (value >= 60) return "text-yellow-600";
    return "text-green-600";
  };

  const getProgressColor = (value: number) => {
    if (value >= 80) return "bg-red-500";
    if (value >= 60) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
        <h3 className="font-semibold text-gray-900 text-lg">Resource Monitor</h3>
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {resourceName}
        </span>
      </div>

      {/* Time Range */}
      <div className="text-sm text-gray-600">
        <span className="font-medium">Time Range:</span> {timeRange}
      </div>

      {/* Current Metrics Overview */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">CPU</span>
          </div>
          <div className="text-2xl font-bold text-blue-600 mb-2">
            {currentMetrics.cpu}%
          </div>
          <Progress 
            value={currentMetrics.cpu} 
            className="h-2"
            style={{
              '--progress-background': getProgressColor(currentMetrics.cpu)
            } as React.CSSProperties}
          />
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <MemoryStick className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-gray-700">Memory</span>
          </div>
          <div className="text-2xl font-bold text-green-600 mb-2">
            {currentMetrics.memory}%
          </div>
          <Progress 
            value={currentMetrics.memory} 
            className="h-2"
            style={{
              '--progress-background': getProgressColor(currentMetrics.memory)
            } as React.CSSProperties}
          />
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <HardDrive className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-medium text-gray-700">Storage</span>
          </div>
          <div className="text-2xl font-bold text-orange-600 mb-2">
            {currentMetrics.storage}%
          </div>
          <Progress 
            value={currentMetrics.storage} 
            className="h-2"
            style={{
              '--progress-background': getProgressColor(currentMetrics.storage)
            } as React.CSSProperties}
          />
        </div>
      </div>

      {/* Metrics Timeline */}
      <div className="bg-white p-3 rounded-lg border border-gray-200">
        <h4 className="font-medium text-gray-800 mb-3">Metrics Timeline</h4>
        <div className="space-y-2">
          {displayMetrics.slice(-5).map((metric, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <span className="text-gray-600 w-16">{metric.time}</span>
              <div className="flex items-center gap-4 flex-1">
                <div className="flex items-center gap-2">
                  <Cpu className="h-3 w-3 text-blue-600" />
                  <span className={`font-medium ${getMetricColor(metric.cpu)}`}>
                    {metric.cpu}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MemoryStick className="h-3 w-3 text-green-600" />
                  <span className={`font-medium ${getMetricColor(metric.memory)}`}>
                    {metric.memory}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <HardDrive className="h-3 w-3 text-orange-600" />
                  <span className={`font-medium ${getMetricColor(metric.storage)}`}>
                    {metric.storage}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span>Normal (&lt;60%)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-yellow-500 rounded"></div>
          <span>Warning (60-80%)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span>Critical (&gt;80%)</span>
        </div>
      </div>
    </div>
  );
};

export default MetricsMessageCard;
