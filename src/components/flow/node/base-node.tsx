import { Handle, Position } from "@xyflow/react";

interface BaseNodeProps {
  children: React.ReactNode;
}

export default function BaseNode({ children }: BaseNodeProps) {
  return (
    <div className="flex h-40 w-60 flex-col rounded-lg border border-border bg-background p-4">
      <Handle position={Position.Top} type="target" />
      {children}
      <Handle position={Position.Bottom} type="source" />
    </div>
  );
}
