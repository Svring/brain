import { NodeProps } from "@xyflow/react";

export default function DevGroupNode({ data }: NodeProps) {
  return (
    <div className="relative w-full h-full bg-transparent border border-border-primary border-dashed rounded-lg">
      <div className="absolute bottom-2 left-2 text-sm font-medium text-muted-foreground">
        Dev
      </div>
    </div>
  );
}
