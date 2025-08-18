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
    <div className="flex items-center justify-around px-4 py-3 border border-dashed rounded-xl">
      <div className="flex flex-col items-center gap-1 text-center">
        <Cpu className="w-4 h-4" />
        <span className="text-xs text-muted-foreground">CPU</span>
        <div className="text-sm font-medium">{cpuValue}</div>
      </div>

      <div className="flex flex-col items-center gap-1 text-center">
        <MemoryStick className="w-4 h-4" />
        <span className="text-xs text-muted-foreground">Memory</span>
        <div className="text-sm font-medium">{memoryValue}</div>
      </div>

      {storage && (
        <div className="flex flex-col items-center gap-1 text-center">
          <HardDrive className="w-4 h-4" />
          <span className="text-xs text-muted-foreground">Storage</span>
          <div className="text-sm font-medium">{storageValue}</div>
        </div>
      )}
    </div>
  );
};

export default ResourceQuotaRow;
