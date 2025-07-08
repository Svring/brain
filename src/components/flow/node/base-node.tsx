import { Handle, Position } from "@xyflow/react";
import { BaseNode } from "@/components/flow/components/base-node";

interface BaseNodeProps {
  children: React.ReactNode;
}

export default function BaseNodeWrapper({ children }: BaseNodeProps) {
  return (
    <BaseNode>
      <Handle position={Position.Top} type="source" />
      {children}
      <Handle position={Position.Bottom} type="target" />
    </BaseNode>
  );
}
