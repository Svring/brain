import React from "react";
import { Cpu, MemoryStick, HardDrive } from "lucide-react";

interface ResourceQuotaRowProps {
  cpu?: any;
  memory?: any;
  storage?: any;
}

export const ResourceQuotaRow: React.FC<ResourceQuotaRowProps> = ({
  cpu,
  memory,
  storage,
}) => {
  const formatValue = (value: any, type: "cpu" | "memory" | "storage") => {
    if (!value) return "N/A";
    if (type === "cpu") return `${value}m`;
    if (type === "memory") return `${value}MB`;
    if (type === "storage") return `${value}GB`;
    return value;
  };

  const cpuValue = formatValue(cpu, "cpu");
  const memoryValue = formatValue(memory, "memory");
  const storageValue = formatValue(storage, "storage");

  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="flex flex-col">
        <span className="text-sm text-muted-foreground">CPU</span>
        <span className="text-sm font-medium">{cpuValue}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-sm text-muted-foreground">Memory</span>
        <span className="text-sm font-medium">{memoryValue}</span>
      </div>
    </div>
  );
};

export default ResourceQuotaRow;
