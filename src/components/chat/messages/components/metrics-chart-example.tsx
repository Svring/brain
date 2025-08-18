import React from "react";
import { CombinedMetricsChart } from "./combined-metrics-chart";

// Example data matching the format you provided
const exampleData = [
  {
    timestamp: 1755516514,
    readableTime: "2025/08/18 19:28",
    cpu: 6.23,
    memory: 0.08,
    storage: 15.5, // Optional storage field
  },
  {
    timestamp: 1755518314,
    readableTime: "2025/08/18 19:58",
    cpu: 6.45,
    memory: 0.08,
    storage: 16.2,
  },
  {
    timestamp: 1755518434,
    readableTime: "2025/08/18 20:00",
    cpu: 6.45,
    memory: 7.96,
    storage: 17.8,
  },
  {
    timestamp: 1755518554,
    readableTime: "2025/08/18 20:02",
    cpu: 6.45,
    memory: 0.08,
  },
  {
    timestamp: 1755518794,
    readableTime: "2025/08/18 20:06",
    cpu: 2.02,
    memory: 0.07,
  },
  {
    timestamp: 1755518914,
    readableTime: "2025/08/18 20:08",
    cpu: 2.02,
    memory: 8,
    storage: 18.5,
  },
  {
    timestamp: 1755519034,
    readableTime: "2025/08/18 20:10",
    cpu: 2.02,
    memory: 0.07,
  },
  {
    timestamp: 1755519514,
    readableTime: "2025/08/18 20:18",
    cpu: 0.06,
    memory: 0,
  },
  {
    timestamp: 1755519634,
    readableTime: "2025/08/18 20:20",
    cpu: 0.06,
    memory: 0,
  },
  {
    timestamp: 1755519754,
    readableTime: "2025/08/18 20:22",
    cpu: 0.06,
    memory: 0,
  },
  {
    timestamp: 1755519994,
    readableTime: "2025/08/18 20:26",
    cpu: 3.32,
    memory: 0,
  },
  {
    timestamp: 1755520114,
    readableTime: "2025/08/18 20:28",
    cpu: 3.32,
    memory: 0,
  },
];

export const MetricsChartExample: React.FC = () => {
  return (
    <div className="p-6 space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">CPU & Memory Metrics</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Real-time monitoring of CPU and memory usage over time
        </p>
      </div>
      
      <div className="border rounded-lg p-4">
        <CombinedMetricsChart 
          data={exampleData}
        />
      </div>
    </div>
  );
};

export default MetricsChartExample;
